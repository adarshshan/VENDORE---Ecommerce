import { Db, ObjectId } from "mongodb";
import { connectToDatabase } from "../config/database";
import { Product } from "../models/products";

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(product: Product): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}

export class ProductRepository implements IProductRepository {
  private db: Db | null = null;

  constructor() {
    // Initialize db asynchronously
    this.init();
  }

  private async init(): Promise<void> {
    if (!this.db) {
      this.db = await connectToDatabase();
    }
  }

  private async ensureDb(): Promise<Db> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db;
  }

  async findAll(): Promise<Product[]> {
    const db = await this.ensureDb();
    return db.collection<Product>("products").find().toArray();
  }

  async findById(id: string): Promise<Product | null> {
    const db = await this.ensureDb();
    return db
      .collection<Product>("products")
      .findOne({ _id: new ObjectId(id) });
  }

  async create(product: Product): Promise<Product> {
    const db = await this.ensureDb();
    const result = await db.collection<Product>("products").insertOne(product);
    return { ...product, _id: result.insertedId };
  }

  async update(
    id: string,
    productData: Partial<Product>
  ): Promise<Product | null> {
    const db = await this.ensureDb();
    const result: any = await db
      .collection<Product>("products")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: productData },
        { returnDocument: "after" }
      );
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const db = await this.ensureDb();
    const result = await db
      .collection<Product>("products")
      .deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }
}
