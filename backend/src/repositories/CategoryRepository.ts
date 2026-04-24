import { CategoryDocument, CategoryModel } from "../models/CategorySchema";

export interface ICategoryRepository {
  findAll(
    status?: "Active" | "Inactive",
    page?: number,
    limit?: number,
  ): Promise<{ categories: CategoryDocument[]; totalItems: number }>;
  findById(id: string): Promise<CategoryDocument | null>;
  findBySlug(slug: string): Promise<CategoryDocument | null>;
  findByName(name: string): Promise<CategoryDocument | null>;
  create(category: Partial<CategoryDocument>): Promise<CategoryDocument>;
  update(
    id: string,
    category: Partial<CategoryDocument>,
  ): Promise<CategoryDocument | null>;
  delete(id: string): Promise<boolean>;
}

export class CategoryRepository implements ICategoryRepository {
  async findAll(
    status?: "Active" | "Inactive",
    page?: number,
    limit?: number,
  ): Promise<{ categories: CategoryDocument[]; totalItems: number }> {
    const query: any = {};
    if (status) query.status = status;

    const totalItems = await CategoryModel.countDocuments(query);
    let categoriesQuery = CategoryModel.find(query).sort({ name: 1 });

    if (page && limit) {
      const skip = (page - 1) * limit;
      categoriesQuery = categoriesQuery.skip(skip).limit(limit);
    }

    const categories = await categoriesQuery.exec();
    return { categories, totalItems };
  }

  async findBySlug(slug: string): Promise<CategoryDocument | null> {
    return await CategoryModel.findOne({ slug, status: "Active" }).exec();
  }

  async findById(id: string): Promise<CategoryDocument | null> {
    try {
      return await CategoryModel.findById(id).exec();
    } catch (error) {
      return null;
    }
  }

  async findByName(name: string): Promise<CategoryDocument | null> {
    return await CategoryModel.findOne({ name }).exec();
  }

  async create(category: Partial<CategoryDocument>): Promise<CategoryDocument> {
    const newCategory = new CategoryModel(category);
    return await newCategory.save();
  }

  async update(
    id: string,
    categoryData: Partial<CategoryDocument>,
  ): Promise<CategoryDocument | null> {
    try {
      return await CategoryModel.findByIdAndUpdate(
        id,
        { $set: categoryData },
        { new: true },
      ).exec();
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await CategoryModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      return false;
    }
  }
}
