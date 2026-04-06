import { CategoryDocument, CategoryModel } from "../models/CategorySchema";

export interface ICategoryRepository {
  findAll(status?: "Active" | "Inactive"): Promise<CategoryDocument[]>;
  findById(id: string): Promise<CategoryDocument | null>;
  findByName(name: string): Promise<CategoryDocument | null>;
  create(category: Partial<CategoryDocument>): Promise<CategoryDocument>;
  update(
    id: string,
    category: Partial<CategoryDocument>,
  ): Promise<CategoryDocument | null>;
  delete(id: string): Promise<boolean>;
}

export class CategoryRepository implements ICategoryRepository {
  async findAll(status?: "Active" | "Inactive"): Promise<CategoryDocument[]> {
    const query: any = {};
    if (status) query.status = status;
    return await CategoryModel.find(query).sort({ name: 1 }).exec();
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
