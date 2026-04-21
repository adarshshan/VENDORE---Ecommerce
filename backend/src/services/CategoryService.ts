import { CategoryDocument } from "../models/CategorySchema";
import { ICategoryRepository } from "../repositories/CategoryRepository";

export class CategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async getAllCategories(
    status?: "Active" | "Inactive",
    page?: number,
    limit?: number,
  ): Promise<{ categories: CategoryDocument[]; totalItems: number }> {
    return this.categoryRepository.findAll(status, page, limit);
  }

  async getCategoryById(id: string): Promise<CategoryDocument | null> {
    return this.categoryRepository.findById(id);
  }

  async getCategoryBySlug(slug: string): Promise<CategoryDocument | null> {
    return this.categoryRepository.findBySlug(slug);
  }

  async createCategory(
    categoryData: Partial<CategoryDocument>,
  ): Promise<CategoryDocument> {
    const existing = await this.categoryRepository.findByName(
      categoryData.name!,
    );
    if (existing) {
      throw new Error("Category already exists");
    }
    return this.categoryRepository.create(categoryData);
  }

  async updateCategory(
    id: string,
    categoryData: Partial<CategoryDocument>,
  ): Promise<CategoryDocument | null> {
    const existing = await this.categoryRepository.findByName(
      categoryData.name!,
    );
    if (existing && existing?._id?.toString() !== id) {
      throw new Error("Category name already exists");
    }
    return this.categoryRepository.update(id, categoryData);
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categoryRepository.delete(id);
  }
}
