import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";

export class OrderController {
  constructor(private orderService: OrderService) {}

  // Create Razorpay Order
  async createRazorpayOrder(req: Request, res: Response): Promise<void> {
    try {
      const { items, pincode } = req.body;
      const order = await this.orderService.createRazorpayOrder(items, pincode);
      res.send(order);
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
      const isValid = await this.orderService.verifyPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      );

      if (isValid) {
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
      const userId = (req as any).userId;
      const createdOrder = await this.orderService.createOrder(
        userId,
        req.body,
      );
      res.status(201).json(createdOrder);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getMyOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const { orders, totalItems } = await this.orderService.getMyOrders(
        userId,
        page,
        limit,
      );
      res.json({
        orders,
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.id;
      const order = await this.orderService.getOrderById(orderId);
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
      const userId = (req as any).userId;
      const updatedOrder = await this.orderService.cancelOrder(
        req.params.id,
        userId,
        reason,
      );
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Request Return (Item-level)
  async requestReturn(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, productId, reason, customReason } = req.body;
      const userId = (req as any).userId;
      const updatedOrder = await this.orderService.requestReturn(
        orderId,
        productId,
        userId,
        reason,
        customReason,
      );
      res.json({
        message: "Return request submitted successfully",
        order: updatedOrder,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // --- ADMIN ACTIONS ---

  // Get All Orders (Admin)
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const result = await this.orderService.getAllOrders(page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update Order Status (Admin)
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const updatedOrder = await this.orderService.updateOrderStatus(
        req.params.id,
        status,
      );
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Handle Return Request (Admin)
  async handleReturnRequest(req: Request, res: Response): Promise<void> {
    try {
      const { status, productId } = req.body;
      const updatedOrder = await this.orderService.handleReturnRequest(
        req.params.id,
        status,
        productId,
      );
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
