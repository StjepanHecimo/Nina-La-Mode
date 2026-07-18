"use client";

import { useState } from "react";
import { ProductCard } from "./product-card";
import type { Product } from "@/data/products";

export function ShopCatalog({ products }: { products: Product[] }) {
  const filters = ["All", "Trousers", "Dresses", "Blouses", "Outdoor"];
  const [active, setActive] = useState("All");
  const visible = active === "All" ? products : products.filter(product => product.category === active);

  return <><section className="shop-toolbar"><p>{visible.length} {visible.length === 1 ? "product" : "products"}</p><div>{filters.map(filter => <button key={filter} type="button" className={active === filter ? "active" : ""} onClick={() => setActive(filter)}>{filter}</button>)}</div></section>{visible.length ? <section className="product-grid shop-grid">{visible.map(product => <ProductCard key={product.id} product={product}/>)}</section> : <p className="shop-empty">No products in this category yet.</p>}</>;
}
