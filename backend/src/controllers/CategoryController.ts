import { Request, Response } from "express";
import { CategoryService } from "../services/CategoryService";

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as "Active" | "Inactive" | undefined;
      const categories = await this.categoryService.getAllCategories(status);
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const category = await this.categoryService.getCategoryById(req.params.id);
      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = await this.categoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = await this.categoryService.updateCategory(
        req.params.id,
        req.body
      );
      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      // Note: Add logic to check if products exist in this category if desired
      const success = await this.categoryService.deleteCategory(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
