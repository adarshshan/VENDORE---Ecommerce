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
        categories: req.query.categories ? (req.query.categories as string).split(",") : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        search: req.query.search as string,
        sort: req.query.sort as string,
        limit,
        page,
      };

      const { products, totalItems } =
        await this.productService.getAllProducts(filters);
      const totalPages = Math.ceil(totalItems / limit);
      res.json({
        products,
        totalItems,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages,
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

  async getProductBySlug(req: Request, res: Response): Promise<void> {
    try {
      const product = await this.productService.getProductBySlug(req.params.slug);
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product by slug" });
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

      // Handle categories array parsing
      let categories = [];
      if (productData.categories) {
        try {
          categories = JSON.parse(productData.categories);
        } catch (e) {
          categories = Array.isArray(productData.categories) ? productData.categories : [productData.categories];
        }
      } else if (productData.category) {
        categories = [productData.category];
      }

      const product = await this.productService.createProduct({
        ...productData,
        hasSizes: productData.hasSizes === "true",
        images: productData.images ? JSON.parse(productData.images) : [],
        sizes: productData.sizes ? JSON.parse(productData.sizes) : [],
        categories,
      });
      res.status(201).json(product);
    } catch (error) {
      console.log("Error in createProduct:", error);
      res.status(500).json({ message: "Error creating product" });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = { ...req.body };
      
      if (productData._id) delete productData._id;

      // Handle categories array parsing
      if (productData.categories) {
        try {
          productData.categories = JSON.parse(productData.categories);
        } catch (e) {
          productData.categories = Array.isArray(productData.categories) ? productData.categories : [productData.categories];
        }
      } else if (productData.category) {
        productData.categories = [productData.category];
      }

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
      });

      if (!product) {
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
