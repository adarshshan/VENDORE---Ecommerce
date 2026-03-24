import { ProductDocument } from "../models/productsSchema";
import { IProductRepository, ProductFilters } from "../repositories/ProductRepository";

export class ProductService {
  constructor(private productRepository: IProductRepository) {}

  async getAllProducts(filters?: ProductFilters): Promise<ProductDocument[]> {
    return this.productRepository.findAll(filters);
  }

  async getProductById(id: string): Promise<ProductDocument | null> {
    return this.productRepository.findById(id);
  }

  async createProduct(
    productData: Omit<ProductDocument, "_id">
  ): Promise<ProductDocument> {
    const product: Omit<ProductDocument, "_id"> = {
      ...productData,
    };
    return this.productRepository.create(product);
  }

  async updateProduct(
    id: string,
    productData: Partial<ProductDocument>
  ): Promise<ProductDocument | null> {
    return this.productRepository.update(id, productData);
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.productRepository.delete(id);
  }
}
