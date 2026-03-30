import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";

export class ProductController {
  constructor(private productService: ProductService) {}

  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        category: req.query.category as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        search: req.query.search as string,
        sort: req.query.sort as string,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      };
      
      const products = await this.productService.getAllProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const product = await this.productService.getProductById(req.params.id);
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
    }
  }

  async getRelatedProducts(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const products = await this.productService.getRelatedProducts(productId, limit);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching related products" });
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = { ...req.body };
      console.log("...productData...");
      console.log(productData);

      const product = await this.productService.createProduct({
        ...productData,
        images: JSON.parse(productData.images),
      });
      res.status(201).json(product);
    } catch (error) {
      console.log("this is the error getting...");
      console.log(error);
      res.status(500).json({ message: "Error creating product" });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = { ...req.body };

      const product = await this.productService.updateProduct(req.params.id, {
        ...productData,
        images: JSON.parse(productData.images),
      });

      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error updating product" });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const success = await this.productService.deleteProduct(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.status(204).json({ message: "Product deleted Successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting product" });
    }
  }
}
