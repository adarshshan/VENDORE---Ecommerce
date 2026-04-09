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

  async createSeller(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const userExists = await UserModel.findOne({ email });

      if (userExists) {
        res.status(400).json({ success: false, message: "User already exists" });
        return;
      }

      const seller = await UserModel.create({
        name,
        email,
        password,
        role: "seller",
      });

      res.status(201).json({
        success: true,
        message: "Seller created successfully",
        seller: {
          id: seller._id,
          name: seller.name,
          email: seller.email,
          role: seller.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSellers(req: Request, res: Response): Promise<void> {
    try {
      const sellers = await UserModel.find({ role: "seller" }).select("-password");
      res.json({ success: true, sellers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async blockSeller(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const seller = await UserModel.findByIdAndUpdate(
        id,
        { status: "blocked" },
        { new: true }
      );

      if (!seller) {
        res.status(404).json({ success: false, message: "Seller not found" });
        return;
      }

      res.json({ success: true, message: "Seller blocked successfully", seller });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async unblockSeller(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const seller = await UserModel.findByIdAndUpdate(
        id,
        { status: "active" },
        { new: true }
      );

      if (!seller) {
        res.status(404).json({ success: false, message: "Seller not found" });
        return;
      }

      res.json({ success: true, message: "Seller unblocked successfully", seller });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
