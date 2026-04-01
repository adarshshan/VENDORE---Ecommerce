import { connectToDatabase } from "../config/database";
import { OrderDocument, OrderModel } from "../models/OrderSchema";

export interface IOrderRepository {
  findAll(): Promise<OrderDocument[]>;
  findById(id: string): Promise<OrderDocument | null>;
  create(orderData: Partial<OrderDocument>): Promise<OrderDocument>;
  findByUser(userId: string): Promise<OrderDocument[]>;
  findByIdWithPopulate(
    id: string,
    populate: string,
  ): Promise<OrderDocument | null>;
  countAll(): Promise<number>;
  findAllWithPagination(
    page: number,
    pageSize: number,
  ): Promise<{ orders: OrderDocument[]; totalItems: number }>;
  findByUserWithPagination(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{ orders: OrderDocument[]; totalItems: number }>;
  update(
    id: string,
    updateData: Partial<OrderDocument>,
  ): Promise<OrderDocument | null>;
  save(order: OrderDocument): Promise<OrderDocument>;
}

export class OrderRepository implements IOrderRepository {
  constructor() {
    // Ensure database connection
    connectToDatabase();
  }

  async findAll(): Promise<OrderDocument[]> {
    return (await OrderModel.find().exec()) as OrderDocument[];
  }

  async findById(id: string): Promise<OrderDocument | null> {
    try {
      return (await OrderModel.findById(id).exec()) as OrderDocument | null;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("Order to ObjectId failed") ||
          error.message.includes("Cast to ObjectId failed"))
      ) {
        return null;
      }
      throw error;
    }
  }

  async create(orderData: Partial<OrderDocument>): Promise<OrderDocument> {
    const order = new OrderModel(orderData);
    return await order.save();
  }

  async findByUser(userId: string): Promise<OrderDocument[]> {
    return await OrderModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  async findByIdWithPopulate(
    id: string,
    populate: string,
  ): Promise<OrderDocument | null> {
    try {
      return await OrderModel.findById(id).populate(populate).exec();
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("Order to ObjectId failed") ||
          error.message.includes("Cast to ObjectId failed"))
      ) {
        return null;
      }
      throw error;
    }
  }

  async countAll(): Promise<number> {
    return await OrderModel.countDocuments({});
  }

  async findByUserWithPagination(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{ orders: OrderDocument[]; totalItems: number }> {
    const totalItems = await OrderModel.countDocuments({ user: userId });
    const orders = await OrderModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .exec();
    return { orders, totalItems };
  }

  async findAllWithPagination(
    page: number,
    pageSize: number,
  ): Promise<{ orders: OrderDocument[]; totalItems: number }> {
    const totalItems = await OrderModel.countDocuments({});
    const orders = await OrderModel.find({})
      .populate("user", "id name")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .exec();
    return { orders, totalItems };
  }

  async update(
    id: string,
    updateData: Partial<OrderDocument>,
  ): Promise<OrderDocument | null> {
    return await OrderModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).exec();
  }

  async save(order: OrderDocument): Promise<OrderDocument> {
    return await order.save();
  }
}
