"use client";

import { useState } from "react";
import { ProductCard } from "./product-card";
import type { Product } from "@/data/products";

export function ShopCatalog({ products }: { products: Product[] }) {
  const filters = ["Sve", ...Array.from(new Set(products.map(product => product.category)))];
  const [active, setActive] = useState("Sve");
  const visible = active === "Sve" ? products : products.filter(product => product.category === active);

  return <><section className="shop-toolbar"><p>{visible.length} {visible.length === 1 ? "proizvod" : "proizvoda"}</p><div>{filters.map(filter => <button key={filter} type="button" className={active === filter ? "active" : ""} onClick={() => setActive(filter)}>{filter}</button>)}</div></section><section className="product-grid shop-grid">{visible.map(product => <ProductCard key={product.id} product={product}/>)}</section></>;
}
