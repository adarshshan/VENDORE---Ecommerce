import { Request, Response } from "express";
import { ProductModel } from "../models/productsSchema";
import { CategoryModel } from "../models/CategorySchema";

export class SearchController {
  async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== "string" || q.trim().length < 2) {
        res.json({ products: [], categories: [], brands: [] });
        return;
      }

      const keyword = q.trim();
      // Sanitize regex to prevent regex injection
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedKeyword, "i");

      const [products, categories, brands] = await Promise.all([
        // Search Products by name
        ProductModel.find({ name: regex, isActive: true })
          .select("name images price")
          .limit(8)
          .lean(),

        // Search Categories by name
        CategoryModel.find({ name: regex, status: "Active" })
          .select("name slug")
          .limit(5)
          .lean(),

        // Search Brands (unique brands from ProductModel matching regex)
        ProductModel.distinct("brand", { brand: regex, isActive: true }).then(
          (brands) => brands.filter((b) => b).slice(0, 5),
        ), // Limit to 5 unique brands
      ]);

      res.json({
        products,
        categories,
        brands: brands.map((brand) => ({ name: brand })),
      });
    } catch (error) {
      console.error("Search suggestions error:", error);
      res.status(500).json({ message: "Error fetching search suggestions" });
    }
  }
}
