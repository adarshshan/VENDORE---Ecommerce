import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";

export class ProductController {
  constructor(private productService: ProductService) {}

  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const filters = {
        category: req.query.category as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        search: req.query.search as string,
        sort: req.query.sort as string,
        limit,
        page,
      };

      const { products, totalItems } =
        await this.productService.getAllProducts(filters);
      res.json({
        products,
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
      });
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
      const products = await this.productService.getRelatedProducts(
        productId,
        limit,
      );
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching related products" });
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = { ...req.body };

      const product = await this.productService.createProduct({
        ...productData,
        hasSizes: productData.hasSizes === "true",
        images: productData.images ? JSON.parse(productData.images) : [],
        sizes: productData.sizes ? JSON.parse(productData.sizes) : [],
      });
      res.status(201).json(product);
    } catch (error) {
      console.log("Error in createProduct:", error);
      res.status(500).json({ message: "Error creating product" });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      console.log("Updating product ID:", req.params.id);
      console.log("Update data:", req.body);
      const productData = { ...req.body };
      
      // Remove _id from data if it exists to prevent Mongoose error
      if (productData._id) delete productData._id;

      const product = await this.productService.updateProduct(req.params.id, {
        ...productData,
        hasSizes: productData.hasSizes === "true",
        images: productData.images ? JSON.parse(productData.images) : [],
        sizes: productData.sizes ? JSON.parse(productData.sizes) : [],
        sellerId: 
          productData.sellerId === "" || 
          productData.sellerId === "null" || 
          productData.sellerId === "[object Object]" 
            ? undefined : productData.sellerId,
        category: 
          productData.category === "" || 
          productData.category === "null" || 
          productData.category === "[object Object]" 
            ? undefined : productData.category,
      });

      if (!product) {
        console.log("Product not found with ID:", req.params.id);
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error) {
      console.log("Error in updateProduct:", error);
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
