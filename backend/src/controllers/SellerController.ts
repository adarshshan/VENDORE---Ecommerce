import { Request, Response } from "express";
import { IProductRepository } from "../repositories/ProductRepository";
import { IOrderRepository } from "../repositories/OrderRepository";
import { OrderModel } from "../models/OrderSchema";
import { ProductModel } from "../models/productsSchema";
import { UserModel } from "../models/UserSchema";
import { CreateJWT } from "../utils/generateToken";

const createJWT = new CreateJWT();

export class SellerController {
  constructor(
    private productRepository: IProductRepository,
    private orderRepository: IOrderRepository,
  ) {}

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findOne({ email });

      if (!user || user.role !== "seller") {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials or not a seller",
        });
      }

      if (user.status === "blocked") {
        return res.status(403).json({
          success: false,
          message: "Your account is blocked. Please contact admin.",
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = createJWT.generateToken(user._id as string);
      const refreshToken = createJWT.generateRefreshToken(user._id as string);

      const accessTokenMaxAge = 30 * 60 * 1000;
      const refreshTokenMaxAge = 48 * 60 * 60 * 1000;

      res
        .status(200)
        .cookie("access_token", token, {
          maxAge: accessTokenMaxAge,
          sameSite: "none",
          secure: true,
          httpOnly: true,
        })
        .cookie("refresh_token", refreshToken, {
          maxAge: refreshTokenMaxAge,
          sameSite: "none",
          secure: true,
          httpOnly: true,
        })
        .json({
          success: true,
          message: "Logged in successfully",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getInventory(req: Request, res: Response) {
    try {
      const { category, search, page = 1, limit = 10 } = req.query;
      const sellerId = req.userId;

      const filters: any = {
        page: Number(page),
        limit: Number(limit),
        sellerId: sellerId,
      };

      if (category && category !== "All") {
        filters.category = category;
      }

      if (search) {
        filters.search = search as string;
      }

      const query: any = { sellerId: sellerId };
      if (filters.category) query.category = filters.category;
      if (filters.search) query.$text = { $search: filters.search };

      const totalItems = await ProductModel.countDocuments(query);
      const products = await ProductModel.find(query)
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(limit) * (Number(page) - 1))
        .lean();

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
      const sellerId = req.userId;

      // Ensure the product belongs to the seller
      const product = await ProductModel.findOne({ _id: id, sellerId });
      if (!product) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access to this product",
        });
      }

      let updatedProduct;

      if (sizeStock) {
        // Atomic update for specific size
        updatedProduct = await ProductModel.findOneAndUpdate(
          { _id: id, "sizes.size": sizeStock.size, sellerId },
          { $set: { "sizes.$.stock": sizeStock.stock } },
          { new: true, runValidators: false },
        );
      } else if (stock !== undefined) {
        // Atomic update for global stock
        updatedProduct = await ProductModel.findOneAndUpdate(
          { _id: id, sellerId },
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
      const sellerId = req.userId;

      // Find all product IDs belonging to this seller
      const sellerProducts = await ProductModel.find({ sellerId }).select(
        "_id",
      );
      const sellerProductIds = sellerProducts.map((p) => p._id);

      const query: any = {
        "items.product": { $in: sellerProductIds },
      };

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

      // For each order, we might want to only show items belonging to this seller
      const filteredOrders = orders.map((order: any) => ({
        ...order,
        items: order.items.filter((item: any) =>
          sellerProductIds.some(
            (spId: any) => spId.toString() === item.product.toString(),
          ),
        ),
      }));

      res.status(200).json({
        success: true,
        orders: filteredOrders,
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
      const sellerId = req.userId;

      // Verify the order contains at least one product from this seller
      const sellerProducts = await ProductModel.find({ sellerId }).select(
        "_id",
      );
      const sellerProductIds = sellerProducts.map((p) => p._id);

      const order = await OrderModel.findOne({
        _id: id,
        "items.product": { $in: sellerProductIds },
      });

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found or unauthorized" });
      }

      order.sellerBooked = true;
      order.sellerBookedAt = new Date();
      await order.save();

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
