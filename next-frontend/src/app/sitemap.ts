import { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/src/services/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://threadco.online";

  // Fetch all products
  const productsData = await getProducts({ limit: 1000 });
  const productUrls =
    productsData.products?.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || [];

  // Fetch all categories
  const categoriesData = await getCategories(undefined, 1, 100);
  const categoryUrls =
    categoriesData.categories?.map((category: any) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })) || [];

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/return-and-exchange`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  return [...staticPages, ...categoryUrls, ...productUrls];
}
