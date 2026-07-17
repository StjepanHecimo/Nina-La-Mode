import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.ninilamode.com";
  const products = await getProducts();

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((product) => ({ url: `${baseUrl}/shop/${product.id}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
