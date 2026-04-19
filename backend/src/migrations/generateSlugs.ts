import * as dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

import { ProductModel } from "../models/productsSchema";
import { CategoryModel } from "../models/CategorySchema";
import { connectToDatabase } from "../config/database";

const migrate = async () => {
  try {
    await connectToDatabase();
    console.log("Connected to database for slug generation migration...");

    // Function to generate slug from name
    const generateSlug = (name: string) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    };

    // Migrate Categories
    const categories = await CategoryModel.find({
      $or: [{ slug: { $exists: false } }, { slug: "" }, { slug: null }],
    });
    console.log(`Found ${categories.length} categories to migrate.`);
    for (const category of categories) {
      const slug = generateSlug(category.name) || `category-${Date.now()}`;
      await CategoryModel.updateOne({ _id: category._id }, { $set: { slug } });
      console.log(`Generated slug for category: ${category.name} -> ${slug}`);
    }

    // Migrate Products
    const products = await ProductModel.find({
      $or: [{ slug: { $exists: false } }, { slug: "" }, { slug: null }],
    });
    console.log(`Found ${products.length} products to migrate.`);
    for (const product of products) {
      const slug = generateSlug(product.name) || `product-${Date.now()}`;
      await ProductModel.updateOne({ _id: product._id }, { $set: { slug } });
      console.log(`Generated slug for product: ${product.name} -> ${slug}`);
    }

    console.log("Slug generation migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Slug generation migration failed:", error);
    process.exit(1);
  }
};

migrate();
