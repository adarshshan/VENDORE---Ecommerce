import Razorpay from "razorpay";
import crypto from "crypto";
import { IOrderRepository } from "../repositories/OrderRepository";
import { IProductRepository } from "../repositories/ProductRepository";
import { ProductModel } from "../models/productsSchema";
import { notificationService } from "./NotificationService";

export class OrderService {
  private razorpay: Razorpay;

  constructor(
    private orderRepository: IOrderRepository,
    private productRepository: IProductRepository,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });
  }

  async createRazorpayOrder(items: any[]) {
    // Validate stock before creating Razorpay order
    for (const item of items) {
      const product = await this.productRepository.findById(item?.product);
      if (!product) {
        throw new Error(`Product not found: ${item?.name}`);
      }

      if (product?.hasSizes) {
        if (!item.size) {
          throw new Error(`Size is required for product: ${product?.name}`);
        }

        const sizeObj = product?.sizes.find((s) => s?.size === item?.size);
        if (!sizeObj || sizeObj?.stock < item?.quantity) {
          throw new Error(
            `Insufficient stock for ${product?.name} (Size: ${item?.size}). Available: ${sizeObj ? sizeObj?.stock : 0}`,
          );
        }
      } else {
        if (product?.stock < item?.quantity) {
          throw new Error(
            `Insufficient stock for ${product?.name}. Available: ${product?.stock}`,
          );
        }
      }
    }

    // Calculate total price server-side to prevent tampering
    let totalAmount = 0;
    for (const item of items) {
      const product = await this.productRepository.findById(item?.product);
      if (product) {
        totalAmount += product?.price * item?.quantity;
      }
    }

    const shippingAmount = totalAmount > 100 ? 0 : 10;
    const finalAmount = totalAmount + shippingAmount;

    const options = {
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await this.razorpay.orders.create(options);

    return {
      orderId: order?.id,
      amount: finalAmount,
      shipping: shippingAmount,
      currency: order?.currency,
    };
  }

  async verifyPayment(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
  ) {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(body.toString())
      .digest("hex");

    return expectedSignature === razorpay_signature;
  }

  async createOrder(userId: string, orderData: any) {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentResult,
    } = orderData;

    if (orderItems && orderItems?.length === 0) {
      throw new Error("No order items");
    }

    const createdOrder = await this.orderRepository.create({
      user: userId as any,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: true,
      paidAt: new Date(),
      status: "Processing",
    });

    // Notify Admin
    const orderWithUser: any = await this.orderRepository.findByIdWithPopulate(
      String(createdOrder?._id),
      "user",
    );
    notificationService.notifyAdmin({
      eventType: "Placed",
      orderId: String(createdOrder?._id),
      customerName: orderWithUser?.user?.name || "Unknown",
      amount: createdOrder?.totalPrice,
      items: createdOrder?.items,
    });

    // Update stock atomically
    for (const item of orderItems) {
      let updatedProduct;
      if (item?.size) {
        updatedProduct = await ProductModel.findOneAndUpdate(
          {
            _id: item?.product,
            "sizes.size": item?.size,
            "sizes.stock": { $gte: item?.quantity },
          },
          { $inc: { "sizes.$.stock": -item?.quantity } },
          { new: true },
        );
      } else {
        updatedProduct = await ProductModel.findOneAndUpdate(
          { _id: item?.product, stock: { $gte: item?.quantity } },
          { $inc: { stock: -item?.quantity } },
          { new: true },
        );
      }

      if (!updatedProduct) {
        console.error(
          `Stock race condition for product ${item?.product} (Size: ${item?.size})`,
        );
      }
    }

    return createdOrder;
  }

  async getMyOrders(userId: string, pageNumber: number = 1, limit: number = 10) {
    const page = pageNumber || 1;
    const pageSize = limit || 10;
    return await this.orderRepository.findByUserWithPagination(userId, page, pageSize);
  }

  async getOrderById(orderId: string) {
    return await this.orderRepository.findByIdWithPopulate(orderId, "user");
  }

  async cancelOrder(orderId: string, userId: string, reason: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    // Check ownership
    if (order?.user?.toString() !== userId) {
      throw new Error("Not authorized");
    }

    // Check status
    if (
      order?.status === "Shipped" ||
      order?.status === "Delivered" ||
      order?.status === "Cancelled"
    ) {
      throw new Error(`Cannot cancel order with status: ${order?.status}`);
    }

    // Check 24-hour window
    const orderDate = new Date(order?.createdAt);
    const diffTime = Math.abs(Date.now() - orderDate.getTime());
    const diffHours = diffTime / (1000 * 60 * 60);

    if (diffHours > 24) {
      throw new Error("Cancellation period expired (24 hours)");
    }

    order.status = "Cancelled";
    order.cancelReason = reason || "User cancelled";
    order.cancelDate = new Date();

    // Initiate refund if paid
    if (order?.isPaid && order?.paymentResult?.id) {
      await this.processRefund(order);
    }

    const updatedOrder = await this.orderRepository.save(order);

    // Notify Admin
    const orderWithUser: any = await this.orderRepository.findByIdWithPopulate(
      String(updatedOrder?._id),
      "user",
    );
    notificationService.notifyAdmin({
      eventType: "Cancelled",
      orderId: String(updatedOrder?._id),
      customerName: orderWithUser?.user?.name || "Unknown",
      amount: updatedOrder?.totalPrice,
      items: updatedOrder?.items,
    });

    // Restore stock
    for (const item of order?.items) {
      if (item.size) {
        const product = await this.productRepository.findById(
          String(item?.product),
        );
        if (product?.hasSizes) {
          await ProductModel.findOneAndUpdate(
            { _id: item?.product, "sizes.size": item?.size },
            { $inc: { "sizes.$.stock": item?.quantity } },
          );
        } else {
          await ProductModel.findByIdAndUpdate(item?.product, {
            $inc: { stock: item?.quantity },
          });
        }
      } else {
        await ProductModel.findByIdAndUpdate(item?.product, {
          $inc: { stock: item?.quantity },
        });
      }
    }

    return updatedOrder;
  }

  async requestReturn(
    orderId: string,
    productId: string,
    userId: string,
    reason: string,
    customReason?: string,
  ) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    // Check ownership
    if (order?.user.toString() !== userId) {
      throw new Error("Not authorized");
    }

    // Check order status
    if (order?.status !== "Delivered") {
      throw new Error("Returns are only allowed for delivered orders");
    }

    // Find the specific item
    const item = order?.items.find((i) => i.product.toString() === productId);

    if (!item) {
      throw new Error("Product not found in this order");
    }

    // Check if already returned/requested
    if (item.returnStatus && item?.returnStatus !== "None") {
      throw new Error(`Return already ${item?.returnStatus.toLowerCase()}`);
    }

    // Check 5-day window
    const deliveryDate = order?.deliveredAt
      ? new Date(order?.deliveredAt)
      : new Date();
    const diffTime = Date.now() - deliveryDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays > 5) {
      throw new Error("Return period expired (5 days limit)");
    }

    // Update item return status
    item.returnStatus = "Requested";
    item.returnReason = reason;
    item.customReturnReason = customReason;

    return await this.orderRepository.save(order);
  }

  async getAllOrders(pageNumber: number, limit: number = 10) {
    const pageSize = limit || 10;
    const page = pageNumber || 1;

    const { orders, totalItems } = await this.orderRepository.findAllWithPagination(
      page,
      pageSize,
    );

    return { orders, page, totalItems, totalPages: Math.ceil(totalItems / pageSize) };
  }

  async updateOrderStatus(orderId: string, status: any) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.status = status;

    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    return await this.orderRepository.save(order);
  }

  async handleReturnRequest(
    orderId: string,
    status: string,
    productId?: string,
  ) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    if (productId) {
      // Item-level return
      const item = order.items.find((i) => i.product.toString() === productId);
      if (!item) {
        throw new Error("Product not found in this order");
      }

      if (item.returnStatus !== "Requested") {
        throw new Error("No pending return request for this item");
      }

      item.returnStatus = status as any;

      if (status === "Approved") {
        const allItemsReturned = order.items.every(
          (i) => i.returnStatus === "Approved" || i.returnStatus === "Refunded",
        );
        if (allItemsReturned) {
          order.status = "Returned";
        }
      }
    } else {
      // Whole order return
      if (order.returnStatus !== "Requested") {
        throw new Error("No pending return request");
      }

      order.returnStatus = status as any;

      if (status === "Approved") {
        order.status = "Returned";
        order.items.forEach((item) => {
          if (item.returnStatus === "Requested") {
            item.returnStatus = "Approved";
          }
        });
        await this.processRefund(order);
      }
    }

    const updatedOrder = await this.orderRepository.save(order);

    // Notify Admin on Approval
    if (status === "Approved") {
      const orderWithUser: any =
        await this.orderRepository.findByIdWithPopulate(
          String(updatedOrder?._id),
          "user",
        );
      notificationService.notifyAdmin({
        eventType: "Returned",
        orderId: String(updatedOrder?._id),
        customerName: orderWithUser?.user?.name || "Unknown",
        amount: updatedOrder.totalPrice,
        items: updatedOrder?.items?.filter(
          (i) => i?.returnStatus === "Approved",
        ),
      });
    }

    return updatedOrder;
  }

  private async processRefund(order: any): Promise<void> {
    try {
      if (order.refundId) return;

      const paymentId = order.paymentResult?.id;
      if (!paymentId) return;

      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: Math.round(order.totalPrice * 100),
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
    }
  }
}
