import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { DatabaseError, NotFoundError } from "../utils/errors";
import { UserModel } from "../models/UserSchema";
import { CreateJWT } from "../utils/generateToken";
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

export class UserController {
  constructor(
    private userService: UserService,
    private createJWT: CreateJWT,
  ) {}

  async userLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: { email: string; password: string } = req.body;
      const loginStatus = await this.userService.userLogin(email, password); //This would return authResponse or throws error

      const accessTokenMaxAge = 2 * 60 * 60 * 1000;
      const refreshTokenMaxAge = 48 * 60 * 60 * 1000;

      res
        .status(loginStatus.status)
        .cookie("access_token", loginStatus.data.token, {
          maxAge: accessTokenMaxAge,
          sameSite: "none",
          secure: true,
          httpOnly: true,
        })
        .cookie("refresh_token", loginStatus.data.refreshToken, {
          maxAge: refreshTokenMaxAge,
          sameSite: "none",
          secure: true,
          httpOnly: true,
        })
        .json(loginStatus);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(401).json({
          success: false,
          message: "Authentication failed: User not found.",
        });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({
          success: false,
          message: "Internal server error during login.",
        });
      } else if (error instanceof Error) {
        res.status(401).json({
          success: false,
          message: error.message || "Authentication failed.",
        });
      } else {
        res
          .status(500)
          .json({ success: false, message: "An unexpected error occurred." });
      }
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const { users, totalItems } = await this.userService.getAllUsers(
        page,
        limit,
      );
      res.json({
        users,
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error creating user" });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const success = await this.userService.deleteUser(req.params.id);
      if (!success) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  }

  async blockUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.blockUser(req.params.id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error blocking user" });
    }
  }

  async unblockUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.unblockUser(req.params.id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error unblocking user" });
    }
  }

  async getWishlist(req: Request, res: Response): Promise<void> {
    try {
      const userId = req?.userId;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const user = await this.userService.getWishlist(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json({ success: true, wishlist: user?.wishlist });
    } catch (error) {
      res.status(500).json({ message: "Error fetching wishlist" });
    }
  }

  async addToWishlist(req: Request, res: Response): Promise<void> {
    try {
      const userId = req?.userId;
      const { productId } = req.body;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      if (!productId) {
        res.status(400).json({ message: "Product ID is required" });
        return;
      }
      const user = await this.userService.addToWishlist(userId, productId);
      res.json({
        success: true,
        message: "Added to wishlist",
        wishlist: user?.wishlist,
      });
    } catch (error) {
      res.status(500).json({ message: "Error adding to wishlist" });
    }
  }

  async removeFromWishlist(req: Request, res: Response): Promise<void> {
    try {
      const userId = req?.userId;
      const { productId } = req.params;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const user = await this.userService.removeFromWishlist(userId, productId);
      res.json({
        success: true,
        message: "Removed from wishlist",
        wishlist: user?.wishlist,
      });
    } catch (error) {
      res.status(500).json({ message: "Error removing from wishlist" });
    }
  }

  async getAddresses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req?.userId;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const addresses = await this.userService.getAddresses(userId);
      res.json({ success: true, addresses });
    } catch (error) {
      res.status(500).json({ message: "Error fetching addresses" });
    }
  }

  async addAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req?.userId;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const user = await this.userService.addAddress(userId, req.body);
      res.status(201).json({
        success: true,
        message: "Address added",
        addresses: user?.addresses,
      });
    } catch (error) {
      res.status(500).json({ message: "Error adding address" });
    }
  }

  async updateAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req?.userId;
      const { addressId } = req.params;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const user = await this.userService.updateAddress(
        userId,
        addressId,
        req.body,
      );
      if (!user) {
        res.status(404).json({ message: "Address not found" });
        return;
      }
      res.json({
        success: true,
        message: "Address updated",
        addresses: user?.addresses,
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating address" });
    }
  }

  async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req?.userId;
      const { addressId } = req.params;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const user = await this.userService.deleteAddress(userId, addressId);
      res.json({
        success: true,
        message: "Address deleted",
        addresses: user?.addresses,
      });
    } catch (error) {
      res.status(500).json({ message: "Error deleting address" });
    }
  }

  async setDefaultAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req?.userId;
      const { addressId } = req.params;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const user = await this.userService.setDefaultAddress(userId, addressId);
      res.json({
        success: true,
        message: "Default address updated",
        addresses: user?.addresses,
      });
    } catch (error) {
      res.status(500).json({ message: "Error setting default address" });
    }
  }

  async googleSignIn(req: Request, res: Response) {
    const { credential, client_id } = req.body;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: client_id,
      });
      const payload = ticket.getPayload();
      const { email, given_name, family_name } = payload;

      // Check if the user already exists in the database
      let user = await UserModel.findOne({ email });
      if (!user) {
        // Create a new user if they don't exist
        user = await UserModel.create({
          email,
          name: `${given_name} ${family_name}`,
          authSource: "google",
        });
      }

      // Generate a JWT token
      const token = this.createJWT.generateToken(user?._id as string);
      const refreshToken = this.createJWT.generateRefreshToken(
        user?._id as string,
      );

      const accessTokenMaxAge = 2 * 60 * 60 * 1000; //two hours
      const refreshTokenMaxAge = 48 * 60 * 60 * 1000; //two days
      // Send the token as a cookie and response
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
          secure: true,
          maxAge: accessTokenMaxAge,
          sameSite: "none",
        })
        .cookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge: refreshTokenMaxAge,
          sameSite: "none",
        })
        .json({
          success: true,
          user,
          accessToken: token,
          refreshToken: refreshToken,
          message: "Authentication successful",
        });
    } catch (error) {
      res.status(500).json({ message: "Error Google Login" });
    }
  }
}
