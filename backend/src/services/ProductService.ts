import { Product } from "../models/products";
import { IProductRepository } from "../repositories/ProductRepository";
import { v4 as uuidv4 } from "uuid";

export class ProductService {
  constructor(private productRepository: IProductRepository) {}

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async createProduct(productData: Omit<Product, "_id">): Promise<Product> {
    const product: Product = {
      ...productData,
    };
    return this.productRepository.create(product);
  }

  async updateProduct(
    id: string,
    productData: Partial<Product>
  ): Promise<Product | null> {
    return this.productRepository.update(id, productData);
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.productRepository.delete(id);
  }
}
