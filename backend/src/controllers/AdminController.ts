import { Request, Response } from "express";
import { OrderModel } from "../models/OrderSchema";
import { UserModel } from "../models/UserSchema";
import { ProductModel } from "../models/productsSchema";

export class AdminController {
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const totalUsers = await UserModel.countDocuments();
      const totalProducts = await ProductModel.countDocuments();
      const totalOrders = await OrderModel.countDocuments();

      const orders = await OrderModel.find({ isPaid: true });
      const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

      const recentOrders = await OrderModel.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email");

      res.json({
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        recentOrders,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
