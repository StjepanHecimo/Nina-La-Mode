import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/checkout/", "/cart/", "/admin/"] },
    sitemap: "https://www.ninilamode.com/sitemap.xml",
    host: "https://www.ninilamode.com",
  };
}
