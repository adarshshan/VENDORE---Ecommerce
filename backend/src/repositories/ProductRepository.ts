import { connectToDatabase } from "../config/database";
import { ProductDocument, ProductModel } from "../models/productsSchema";

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
}

export interface IProductRepository {
  findAll(filters?: ProductFilters): Promise<ProductDocument[]>;
  findById(id: string): Promise<ProductDocument | null>;
  create(product: Omit<ProductDocument, "_id">): Promise<ProductDocument>;
  update(
    id: string,
    product: Partial<ProductDocument>
  ): Promise<ProductDocument | null>;
  delete(id: string): Promise<boolean>;
}

export class ProductRepository implements IProductRepository {
  constructor() {
    // Ensure database connection
    connectToDatabase();
  }

  async findAll(filters: ProductFilters = {}): Promise<ProductDocument[]> {
    const query: any = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    let sortOption: any = { createdAt: -1 };
    if (filters.sort) {
      switch (filters.sort) {
        case "price_asc":
          sortOption = { price: 1 };
          break;
        case "price_desc":
          sortOption = { price: -1 };
          break;
        case "newest":
          sortOption = { createdAt: -1 };
          break;
      }
    }

    return await ProductModel.find(query)
      .populate("category")
      .sort(sortOption)
      .exec() as ProductDocument[];
  }

  async findById(id: string): Promise<ProductDocument | null> {
    try {
      return (await ProductModel.findById(id)
        .populate("category")
        .exec()) as ProductDocument | null;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Cast to ObjectId failed")
      ) {
        return null; // Handle invalid ObjectId gracefully
      }
      throw error;
    }
  }

  async create(product: ProductDocument): Promise<ProductDocument> {
    const newProduct = new ProductModel(product);
    const savedProduct = await newProduct.save();
    return (await savedProduct.populate("category")) as ProductDocument;
  }

  async update(
    id: string,
    productData: Partial<ProductDocument>
  ): Promise<ProductDocument | null> {
    try {
      return (await ProductModel.findByIdAndUpdate(
        id,
        { $set: productData },
        { new: true }
      )
        .populate("category")
        .exec()) as ProductDocument | null;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Cast to ObjectId failed")
      ) {
        return null; // Handle invalid ObjectId gracefully
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await ProductModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Cast to ObjectId failed")
      ) {
        return false; // Handle invalid ObjectId gracefully
      }
      throw error;
    }
  }
}
