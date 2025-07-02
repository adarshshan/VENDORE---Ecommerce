import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";

export class ProductController {
  constructor(private productService: ProductService) {}

  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await this.productService.getAllProducts();
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

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Error creating product" });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      console.log("this is the product id ", req.params.id);
      const product = await this.productService.updateProduct(
        req.params.id,
        req.body
      );
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error) {
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
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting product" });
    }
  }
}
