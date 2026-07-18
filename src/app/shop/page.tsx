import type { Metadata } from "next";
import { ShopCatalog } from "@/components/shop-catalog";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop Tall Women's Trousers",
  description: "Shop Nini La Mode high-waisted, wide-leg cotton trousers for tall women in UK sizes 12–20 with an 88 cm inseam.",
  alternates: { canonical: "/shop" },
  openGraph: { title: "Shop Tall Women's Trousers", description: "Full-length trousers designed for tall women.", url: "/shop", images: ["/images/classic-tall-trousers.png"] },
};

export const revalidate = 300;

export default async function ShopPage() {
  const products = await getProducts();
  return <main className="page-main"><header className="page-hero"><p className="kicker">Classic Tall</p><h1>One silhouette.<br/><em>So many possibilities.</em></h1><p>Trousers designed especially for tall women — breathable, comfortable and versatile enough for every part of your day.</p></header><ShopCatalog products={products} /></main>;
}
