import { Request, Response } from "express";
import { ProductModel } from "../models/productsSchema";
import { CategoryModel } from "../models/CategorySchema";

export const generateSitemap = async (req: Request, res: Response) => {
  try {
    const baseUrl = "https://www.threadco.online";
    const products = await ProductModel.find({ isActive: true })
      .select("slug updatedAt")
      .lean();
    const categories = await CategoryModel.find({ status: "Active" })
      .select("slug updatedAt")
      .lean();

    const staticPages = [
      "",
      "/products",
      "/contact",
      "/return&exchange",
      "/login",
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static Pages
    staticPages.forEach((page) => {
      xml += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Product Pages
    products.forEach((product) => {
      xml += `
  <url>
    <loc>${baseUrl}/product/${product?.slug}</loc>
    <lastmod>${product?.updatedAt ? new Date(product?.updatedAt).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
    });

    // Category Pages
    categories.forEach((category) => {
      xml += `
  <url>
    <loc>${baseUrl}/category/${category?.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    xml += "\n</urlset>";

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    res.status(500).send("Error generating sitemap");
  }
};
