import type { Metadata } from "next";
import { ShopCatalog } from "@/components/shop-catalog";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Shop", description: "Istraži Nina La Mode kolekciju." };

export const revalidate = 300;

export default async function ShopPage() {
  const products = await getProducts();
  return <main className="page-main"><header className="page-hero"><p className="kicker">Classic Tall</p><h1>Jedan kroj.<br/><em>Toliko mogućnosti.</em></h1><p>Hlače osmišljene posebno za visoke žene — udobne, prozračne i dovoljno svestrane za svaki dio dana.</p></header><ShopCatalog products={products} /></main>;
}
