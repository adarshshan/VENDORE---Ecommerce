import { Request, Response } from "express";
import { OrderModel } from "../models/OrderSchema";
import { UserModel } from "../models/UserSchema";
import { ProductModel } from "../models/productsSchema";
import Contact from "../models/ContactSchema";

export class AdminController {
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const totalUsers = await UserModel.countDocuments();
      const totalProducts = await ProductModel.countDocuments();
      const totalOrders = await OrderModel.countDocuments();
      const totalContactRequests = await Contact.countDocuments({
        status: "New",
      });

      const orders = await OrderModel.find({ isPaid: true });
      const totalRevenue = orders.reduce(
        (acc, order) => acc + order.totalPrice,
        0,
      );

      const recentOrders = await OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "name email");

      res.json({
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        recentOrders,
        totalContactRequests,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
