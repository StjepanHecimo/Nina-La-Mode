import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import { ArrowIcon } from "./icons";

export function ProductCard({ product }: { product: Product }) {
  return <article className="product-card">
    <Link href={`/shop/${product.id}`} className="product-image">
      {product.availability === "coming_soon" ? <span className="badge coming-soon">Coming soon · Pre-order</span> : product.isNew && <span className="badge">New</span>}
      <Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 100vw, 33vw" />
      <span className="quick-view">View details <ArrowIcon /></span>
    </Link>
    <div className="product-info"><div><p>{product.category}</p><h3>{product.name}</h3></div><strong>{formatPrice(product.priceCents)}</strong></div>
  </article>;
}
