import { ProductDocument, ProductImage } from "../models/productsSchema";
import {
  IProductRepository,
  ProductFilters,
} from "../repositories/ProductRepository";
import { deleteMultipleImages } from "../utils/cloudinary";

export class ProductService {
  constructor(private productRepository: IProductRepository) {}

  async getAllProducts(
    filters?: ProductFilters,
  ): Promise<{ products: ProductDocument[]; totalItems: number }> {
    return this.productRepository.findAll(filters);
  }

  async getProductById(id: string): Promise<ProductDocument | null> {
    return this.productRepository.findById(id);
  }

  async getProductBySlug(slug: string): Promise<ProductDocument | null> {
    return this.productRepository.findBySlug(slug);
  }

  async getRelatedProducts(
    productId: string,
    limit?: number,
  ): Promise<ProductDocument[]> {
    return this.productRepository.findRelatedProducts(productId, limit);
  }

  async createProduct(
    productData: Omit<ProductDocument, "_id">,
  ): Promise<ProductDocument> {
    const product: Omit<ProductDocument, "_id"> = {
      ...productData,
    };
    return this.productRepository.create(product);
  }

  async updateProduct(
    id: string,
    productData: Partial<ProductDocument>,
  ): Promise<ProductDocument | null> {
    // If images are being updated, find and delete removed images from Cloudinary
    if (productData.images) {
      const oldProduct = await this.productRepository.findById(id);
      if (oldProduct && oldProduct.images) {
        const oldImagePublicIds = oldProduct.images.map(
          (img: ProductImage) => img.public_id,
        );
        const newImagePublicIds = productData.images.map(
          (img: ProductImage) => img.public_id,
        );

        const removedImagePublicIds = oldImagePublicIds.filter(
          (id: string) => !newImagePublicIds.includes(id),
        );

        if (removedImagePublicIds.length > 0) {
          await deleteMultipleImages(removedImagePublicIds);
        }
      }
    }

    return this.productRepository.update(id, productData);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = await this.productRepository.findById(id);
    if (!product) return false;

    // Delete all images from Cloudinary
    if (product.images && product.images.length > 0) {
      const public_ids = product.images.map(
        (img: ProductImage) => img.public_id,
      );
      await deleteMultipleImages(public_ids);
    }

    return this.productRepository.delete(id);
  }
}
