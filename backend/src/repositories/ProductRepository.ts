import { connectToDatabase } from "../config/database";
import { ProductDocument, ProductModel } from "../models/productsSchema";

export interface ProductFilters {
  category?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  limit?: number;
  page?: number;
  sellerId?: string | any;
}

export interface IProductRepository {
  findAll(
    filters?: ProductFilters,
  ): Promise<{ products: ProductDocument[]; totalItems: number }>;
  findById(id: string): Promise<ProductDocument | null>;
  findBySlug(slug: string): Promise<ProductDocument | null>;
  findRelatedProducts(
    productId: string,
    limit?: number,
  ): Promise<ProductDocument[]>;
  create(product: Omit<ProductDocument, "_id">): Promise<ProductDocument>;
  update(
    id: string,
    product: Partial<ProductDocument>,
  ): Promise<ProductDocument | null>;
  delete(id: string): Promise<boolean>;
  countAll(filters?: ProductFilters): Promise<number>;
}

export class ProductRepository implements IProductRepository {
  constructor() {
    // Ensure database connection
    connectToDatabase();
  }

  private normalizeProduct(product: any): ProductDocument | null {
    if (!product) return null;
    if (product.images && Array.isArray(product.images)) {
      product.images = product.images.map((img: any) => {
        if (typeof img === "string") {
          return { url: img, public_id: "" };
        }
        return img;
      });
    }
    return product as ProductDocument;
  }

  async findRelatedProducts(
    productId: string,
    limit: number = 10,
  ): Promise<ProductDocument[]> {
    const product = await ProductModel.findById(productId)
      .select("category categories")
      .lean();
    if (!product) return [];

    const query: any = {
      _id: { $ne: productId },
      isActive: true,
    };

    if (product.categories && product.categories.length > 0) {
      query.categories = { $in: product.categories };
    } else if (product.category) {
      query.category = product.category;
    } else {
      return [];
    }

    const products = await ProductModel.find(query)
      .limit(limit)
      .populate("category", "name")
      .populate("categories", "name")
      .select(
        "_id name brand price description slug stock hasSizes category categories subCategory sizes images variants tags isFeatured isActive sellerId weight createdAt updatedAt",
      )
      .lean()
      .exec();

    return (
      products.map((p) => this.normalizeProduct(p)) as ProductDocument[]
    ).filter(Boolean);
  }

  async countAll(filters: ProductFilters = {}): Promise<number> {
    const query: any = { isActive: true };

    if (filters.category) {
      query.$or = [
        { category: filters.category },
        { categories: filters.category },
      ];
    }
    if (filters.categories && filters.categories.length > 0) {
      if (query.$or) {
        // If both are provided, we should probably merge them or prioritize categories
        // For simplicity, let's just add it to the $or if it exists or use $in
        query.categories = { $in: filters.categories };
      } else {
        query.categories = { $in: filters.categories };
      }
    }
    if (filters.sellerId) query.sellerId = filters.sellerId;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }
    if (filters.search) query.$text = { $search: filters.search };

    return await ProductModel.countDocuments(query);
  }

  async findAll(
    filters: ProductFilters = {},
  ): Promise<{ products: ProductDocument[]; totalItems: number }> {
    const query: any = { isActive: true };

    if (filters.category) {
      query.$or = [
        { category: filters.category },
        { categories: filters.category },
      ];
    }
    if (filters.categories && filters.categories.length > 0) {
      query.categories = { $in: filters.categories };
    }
    if (filters.sellerId) query.sellerId = filters.sellerId;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }
    if (filters.search) query.$text = { $search: filters.search };

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

    const totalItems = await ProductModel.countDocuments(query);

    const findQuery = ProductModel.find(query)
      .populate("category", "name")
      .populate("categories", "name")
      .populate("sellerId", "name email")
      .select(
        "_id name brand price description slug stock hasSizes category categories subCategory sizes images variants tags isFeatured isActive sellerId weight createdAt updatedAt",
      )
      .sort(sortOption)
      .lean();

    if (filters.limit) {
      const page = filters.page || 1;
      const skip = (page - 1) * filters.limit;
      findQuery.skip(skip).limit(filters.limit);
    }

    const products = await findQuery.exec();
    return {
      products: (
        products.map((p) => this.normalizeProduct(p)) as ProductDocument[]
      ).filter(Boolean),
      totalItems,
    };
  }

  async findById(id: string): Promise<ProductDocument | null> {
    try {
      const product = await ProductModel.findById(id)
        .populate("category", "name")
        .populate("categories", "name")
        .lean()
        .exec();
      return this.normalizeProduct(product);
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

  async findBySlug(slug: string): Promise<ProductDocument | null> {
    try {
      const query: any = { slug };

      // Fallback: If slug looks like an ObjectId, check if there's a product with that ID
      // but only if no product is found by slug, or if we want to be more permissive.
      const product = await ProductModel.findOne(query)
        .populate("category", "name")
        .populate("categories", "name")
        .lean()
        .exec();

      if (product) return this.normalizeProduct(product);

      // Try finding by ID if it's a valid ObjectId
      if (slug.match(/^[0-9a-fA-F]{24}$/)) {
        const productById = await ProductModel.findById(slug)
          .populate("category", "name")
          .populate("categories", "name")
          .lean()
          .exec();
        return this.normalizeProduct(productById);
      }

      return null;
    } catch (error) {
      throw error;
    }
  }

  async create(product: ProductDocument): Promise<ProductDocument> {
    const newProduct = new ProductModel(product);
    const savedProduct = await newProduct.save();
    const populatedProduct = await savedProduct.populate([
      { path: "category", select: "name" },
      { path: "categories", select: "name" },
    ]);
    return this.normalizeProduct(
      populatedProduct.toObject(),
    ) as ProductDocument;
  }

  async update(
    id: string,
    productData: Partial<ProductDocument>,
  ): Promise<ProductDocument | null> {
    try {
      console.log("Repository updating product with ID:", id);
      console.log("Repository update data:", productData);

      const updatedProduct = await ProductModel.findByIdAndUpdate(
        id,
        { $set: productData },
        { new: true },
      )
        .populate("category", "name")
        .populate("categories", "name")
        .lean()
        .exec();

      if (!updatedProduct) {
        console.log("No product found in DB for ID:", id);
        return null;
      } else {
        console.log("Product updated successfully in DB");
      }

      return this.normalizeProduct(updatedProduct);
    } catch (error) {
      console.error("Error in Repository update:", error);
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
