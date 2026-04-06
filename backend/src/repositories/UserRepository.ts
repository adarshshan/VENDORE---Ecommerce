import { UserDocument, UserModel } from "../models/UserSchema";
import { connectToDatabase } from "../config/database";

export interface IUserRepository {
  findAll(
    page?: number,
    limit?: number,
  ): Promise<{ users: UserDocument[]; totalItems: number }>;
  findById(id: string): Promise<UserDocument | null>;
  findByEmail(email: string): Promise<UserDocument | null>;
  create(user: Omit<UserDocument, "_id">): Promise<UserDocument>;
  update(id: string, user: Partial<UserDocument>): Promise<UserDocument | null>;
  delete(id: string): Promise<boolean>;
  getWishlist(userId: string): Promise<UserDocument | null>;
  addToWishlist(
    userId: string,
    productId: string,
  ): Promise<UserDocument | null>;
  removeFromWishlist(
    userId: string,
    productId: string,
  ): Promise<UserDocument | null>;
  countAll(): Promise<number>;
}

export class UserRepository implements IUserRepository {
  constructor() {
    connectToDatabase();
  }

  async getWishlist(userId: string): Promise<UserDocument | null> {
    return (await UserModel.findById(userId)
      .populate("wishlist")
      .exec()) as UserDocument | null;
  }

  async addToWishlist(
    userId: string,
    productId: string,
  ): Promise<UserDocument | null> {
    return (await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: productId } },
      { new: true },
    )
      .populate("wishlist")
      .exec()) as UserDocument | null;
  }

  async removeFromWishlist(
    userId: string,
    productId: string,
  ): Promise<UserDocument | null> {
    return (await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: productId } },
      { new: true },
    )
      .populate("wishlist")
      .exec()) as UserDocument | null;
  }

  async countAll(): Promise<number> {
    return await UserModel.countDocuments({});
  }

  async findAll(
    page?: number,
    limit?: number,
  ): Promise<{ users: UserDocument[]; totalItems: number }> {
    const totalItems = await UserModel.countDocuments({});
    const query = UserModel.find();

    if (limit) {
      const pageNum = page || 1;
      const skip = (pageNum - 1) * limit;
      query.skip(skip).limit(limit);
    }

    const users = (await query.exec()) as UserDocument[];
    return { users, totalItems };
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      return (await UserModel.findById(id).exec()) as UserDocument | null;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Cast to ObjectId failed")
      ) {
        return null;
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return (await UserModel.findOne({ email }).exec()) as UserDocument | null;
  }

  async create(user: Omit<UserDocument, "_id">): Promise<UserDocument> {
    const newUser = new UserModel(user);
    return (await newUser.save()) as UserDocument;
  }

  async update(
    id: string,
    userData: Partial<UserDocument>,
  ): Promise<UserDocument | null> {
    try {
      return (await UserModel.findByIdAndUpdate(
        id,
        { $set: userData },
        { new: true },
      ).exec()) as UserDocument | null;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Cast to ObjectId failed")
      ) {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Cast to ObjectId failed")
      ) {
        return false;
      }
      throw error;
    }
  }
}
