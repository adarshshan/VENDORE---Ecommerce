import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { OrderModel } from "../models/OrderSchema";
import { ProductModel } from "../models/productsSchema";

export class OrderController {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });
  }

  // Create Razorpay Order
  async createRazorpayOrder(req: Request, res: Response): Promise<void> {
    try {
      const { items } = req.body;

      // Validate stock before creating Razorpay order
      for (const item of items) {
        const product = await ProductModel.findById(item.product);
        if (!product) {
          res.status(404).json({ message: `Product not found: ${item.name}` });
          return;
        }

        if (product?.hasSizes) {
          if (!item.size) {
            res.status(400).json({
              message: `Size is required for product: ${product.name}`,
            });
            return;
          }

          const sizeObj = product.sizes.find((s) => s.size === item.size);
          if (!sizeObj || sizeObj.stock < item.quantity) {
            res.status(400).json({
              message: `Insufficient stock for ${product.name} (Size: ${item.size}). Available: ${sizeObj ? sizeObj.stock : 0}`,
            });
            return;
          }
        } else {
          if (product.stock < item.quantity) {
            res.status(400).json({
              message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
            });
            return;
          }
        }
      }

      // Calculate total price server-side to prevent tampering
      let totalAmount = 0;
      for (const item of items) {
        const product = await ProductModel.findById(item?.product);
        if (product) {
          totalAmount += product.price * item.quantity;
        }
      }

      // Add tax and shipping logic here if needed
      const taxAmount = totalAmount * 0.1; // Example 10% tax
      const shippingAmount = totalAmount > 100 ? 0 : 10; // Free shipping over $100
      const finalAmount = totalAmount + taxAmount + shippingAmount;

      const options = {
        amount: Math.round(finalAmount * 100), // Razorpay expects amount in paise
        currency: "INR", // Changed to INR as Razorpay is common in India
        receipt: `receipt_${Date.now()}`,
      };

      const order = await this.razorpay.orders.create(options);

      res.send({
        orderId: order.id,
        amount: finalAmount,
        tax: taxAmount,
        shipping: shippingAmount,
        currency: order.currency,
      });
    } catch (error: any) {
      console.log(error as Error);
      res.status(500).json({ message: error.message });
    }
  }

  // Verify Razorpay Payment Signature
  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
        .update(body.toString())
        .digest("hex");

      const isSignatureValid = expectedSignature === razorpay_signature;

      if (isSignatureValid) {
        res.json({ message: "Payment verified successfully", success: true });
      } else {
        res.status(400).json({ message: "Invalid signature", success: false });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create Order (called after successful payment confirmation and verification)
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentResult,
      } = req.body;
      const userId = req.userId;

      if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: "No order items" });
        return;
      }

      const order = new OrderModel({
        user: userId, // Assumes auth middleware populates user
        items: orderItems,
        shippingAddress,
        paymentMethod,
        paymentResult,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: true,
        paidAt: Date.now(),
        status: "Processing",
      });

      const createdOrder = await order.save();

      // Update stock atomically and validate again
      for (const item of orderItems) {
        let updatedProduct;
        const product = await ProductModel.findById(item.product);

        if (product?.hasSizes) {
          updatedProduct = await ProductModel.findOneAndUpdate(
            {
              _id: item.product,
              "sizes.size": item.size,
              "sizes.stock": { $gte: item.quantity },
            },
            { $inc: { "sizes.$.stock": -item.quantity } },
            { new: true },
          );
        } else {
          updatedProduct = await ProductModel.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: true },
          );
        }

        if (!updatedProduct) {
          console.error(
            `Stock race condition for product ${item.product} (Size: ${item.size})`,
          );
        }
      }

      res.status(201).json(createdOrder);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getMyOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const orders = await OrderModel.find({
        user: userId,
      }).sort({ createdAt: -1 });
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.id;

      const order = await OrderModel.findById(orderId).populate(
        "user",
        "name email",
      );
      if (order) {
        res.json(order);
      } else {
        res.status(404).json({ message: "Order not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // --- USER ACTIONS ---

  // Cancel Order
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { reason } = req.body;
      const userId = req.userId;
      const order = await OrderModel.findById(req.params.id);

      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      // Check ownership
      if (order.user.toString() !== userId) {
        res.status(401).json({ message: "Not authorized" });
        return;
      }

      // Check status
      if (
        order.status === "Shipped" ||
        order.status === "Delivered" ||
        order.status === "Cancelled"
      ) {
        res.status(400).json({
          message: `Cannot cancel order with status: ${order.status}`,
        });
        return;
      }

      // Check 24-hour window
      const orderDate = new Date(order?.createdAt);
      const diffTime = Math.abs(Date.now() - orderDate.getTime());
      const diffHours = diffTime / (1000 * 60 * 60);

      if (diffHours > 24) {
        res
          .status(400)
          .json({ message: "Cancellation period expired (24 hours)" });
        return;
      }

      order.status = "Cancelled";
      order.cancelReason = reason || "User cancelled";
      order.cancelDate = new Date();

      // Initiate refund if paid
      if (order.isPaid && order.paymentResult?.id) {
        await this.processRefund(order);
      }

      const updatedOrder = await order.save();

      // Restore stock
      for (const item of order.items) {
        if (item.size) {
          // Check if product still has sizes (schema might have changed, but usually we follow order record)
          const product = await ProductModel.findById(item.product);
          if (product?.hasSizes) {
            await ProductModel.findOneAndUpdate(
              { _id: item.product, "sizes.size": item.size },
              { $inc: { "sizes.$.stock": item.quantity } },
            );
          } else {
            await ProductModel.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity },
            });
          }
        } else {
          await ProductModel.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
      }

      res.json(updatedOrder);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Request Return
  async requestReturn(req: Request, res: Response): Promise<void> {
    try {
      const { reason } = req.body;
      const userId = req.userId;
      const order = await OrderModel.findById(req.params.id);

      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      if (order.user.toString() !== userId) {
        res.status(401).json({ message: "Not authorized" });
        return;
      }

      if (order.status !== "Delivered") {
        res.status(400).json({ message: "Can only return delivered orders" });
        return;
      }

      if (order.returnStatus) {
        res.status(400).json({ message: "Return already requested" });
        return;
      }

      // Check 7-day window
      const deliveryDate = order.deliveredAt
        ? new Date(order.deliveredAt)
        : new Date();
      const diffTime = Math.abs(Date.now() - deliveryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 7) {
        res.status(400).json({ message: "Return period expired (7 days)" });
        return;
      }

      order.returnStatus = "Requested";
      order.returnReason = reason;
      order.returnDate = new Date();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // --- ADMIN ACTIONS ---

  // Get All Orders (Admin)
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const pageSize = 10;
      const page = Number(req.query.pageNumber) || 1;

      const count = await OrderModel.countDocuments({});
      const orders = await OrderModel.find({})
        .populate("user", "id name")
        .sort({ createdAt: -1 }) // Newest first
        .limit(pageSize)
        .skip(pageSize * (page - 1));

      res.json({ orders, page, pages: Math.ceil(count / pageSize) });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update Order Status (Admin)
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const order = await OrderModel.findById(req.params.id);

      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      order.status = status;

      if (status === "Delivered") {
        order.isDelivered = true;
        order.deliveredAt = new Date();
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Handle Return Request (Admin)
  async handleReturnRequest(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body; // "Approved" or "Rejected"
      const order = await OrderModel.findById(req.params.id);

      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      if (order.returnStatus !== "Requested") {
        res.status(400).json({ message: "No pending return request" });
        return;
      }

      order.returnStatus = status;

      if (status === "Approved") {
        order.status = "Returned";
        // Initiate refund
        await this.processRefund(order);

        // Restore stock logic could go here depending on business rule (damaged vs unwanted)
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // --- HELPERS ---

  private async processRefund(order: any): Promise<void> {
    try {
      if (order.refundId) return; // Already refunded

      // Razorpay refund
      // Note: In real production, you might want to partial refund or check payment ID validity
      const paymentId = order.paymentResult?.id;
      if (!paymentId) return;

      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: Math.round(order.totalPrice * 100), // Amount in paise
        speed: "normal",
        receipt: `refund_${order._id}`,
      });

      order.refundId = refund.id;
      order.refundAmount = order.totalPrice;
      order.refundStatus = refund.status;
      order.refundDate = new Date();
    } catch (error: any) {
      console.error("Refund failed:", error);
      order.refundStatus = "Failed";
      // Do not throw, just log so the status update persists
    }
  }
}
