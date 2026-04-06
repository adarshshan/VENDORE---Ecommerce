import { Request, Response } from "express";
import { IProductRepository } from "../repositories/ProductRepository";
import { IOrderRepository } from "../repositories/OrderRepository";
import { OrderModel } from "../models/OrderSchema";
import { ProductModel } from "../models/productsSchema";

export class SellerController {
  constructor(
    private productRepository: IProductRepository,
    private orderRepository: IOrderRepository,
  ) {}

  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    const sellerUser = process.env.SELLER_USERNAME || "seller";
    const sellerPass = process.env.SELLER_PASSWORD || "seller123";
    const sellerToken = process.env.SELLER_TOKEN || "seller-secret-token";

    if (username === sellerUser && password === sellerPass) {
      return res.status(200).json({
        success: true,
        token: sellerToken,
        message: "Logged in successfully",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  async getInventory(req: Request, res: Response) {
    try {
      const { category, search, page = 1, limit = 10 } = req.query;

      const filters: any = {
        page: Number(page),
        limit: Number(limit),
      };

      if (category && category !== "All") {
        filters.category = category;
      }

      if (search) {
        filters.search = search as string;
      }

      const { products, totalItems } =
        await this.productRepository.findAll(filters);

      res.status(200).json({
        success: true,
        products,
        totalItems,
        totalPages: Math.ceil(totalItems / Number(limit)),
        currentPage: Number(page),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateQuantity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { stock, sizeStock } = req.body;

      let updatedProduct;

      if (sizeStock) {
        // Atomic update for specific size
        updatedProduct = await ProductModel.findOneAndUpdate(
          { _id: id, "sizes.size": sizeStock.size },
          { $set: { "sizes.$.stock": sizeStock.stock } },
          { new: true, runValidators: false },
        );
      } else if (stock !== undefined) {
        // Atomic update for global stock
        updatedProduct = await ProductModel.findByIdAndUpdate(
          id,
          { $set: { stock: stock } },
          { new: true, runValidators: false },
        );
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Quantity update data missing" });
      }

      if (!updatedProduct) {
        return res
          .status(404)
          .json({ success: false, message: "Product or Size not found" });
      }

      res.status(200).json({
        success: true,
        message: "Quantity updated successfully",
        product: updatedProduct,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getOrders(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status, isBooked } = req.query;

      const query: any = {};
      if (status) {
        query.status = status;
      } else {
        // Default: New orders (Pending or Processing)
        query.status = { $in: ["Pending", "Processing"] };
      }

      if (isBooked !== undefined) {
        query.sellerBooked = isBooked === "true";
      }

      const totalItems = await OrderModel.countDocuments(query);
      const orders = await OrderModel.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(limit) * (Number(page) - 1))
        .populate("user", "name email")
        .lean();

      res.status(200).json({
        success: true,
        orders,
        totalItems,
        totalPages: Math.ceil(totalItems / Number(limit)),
        currentPage: Number(page),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async bookOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await OrderModel.findByIdAndUpdate(
        id,
        { $set: { sellerBooked: true, sellerBookedAt: new Date() } },
        { new: true, runValidators: false },
      );
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      res.status(200).json({
        success: true,
        message: "Order booked/reserved successfully",
        order,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
