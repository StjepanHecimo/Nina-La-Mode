"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowIcon } from "./icons";
import { useCart } from "./cart-provider";
import type { Product } from "@/data/products";

export function ProductPurchase({ product }: { product: Product }) {
  const [size, setSize] = useState("");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();
  const colour = product.colors[0]?.name ?? product.color;

  function addToBag() {
    if (!size) return;
    addItem({ productId: product.id, name: product.name, image: product.image, size, colour, quantity: 1, priceCents: product.priceCents });
    setAdded(true);
  }

  return <>
    <div className="detail-block"><p className="detail-label">Available colour</p><div className="color-options">{product.colors.map((option, index) => <span key={option.name} className={index === 0 ? "selected" : ""}><i style={{ backgroundColor: option.hex }} />{option.name}</span>)}</div></div>
    <div className="detail-specs"><div className="detail-block"><p className="detail-label">Material</p><p>{product.material}</p></div>{product.inseam && <div className="detail-block"><p className="detail-label">Inseam</p><p>{product.inseam}</p></div>}{product.fit && <div className="detail-block"><p className="detail-label">Fit</p><p>{product.fit}</p></div>}</div>
    <div className="detail-block"><p className="detail-label">UK size {size && <span>— {size}</span>}</p><div className="sizes">{product.sizes.map(option => <button key={option} className={size === option ? "selected" : ""} type="button" onClick={() => { setSize(option); setAdded(false); }}>{option}</button>)}</div>{!size && <p className="size-hint">Please select a UK size.</p>}</div>
    <button className="button detail-cta" type="button" disabled={!size} onClick={addToBag}>{added ? "Added to bag" : "Add to bag"} <ArrowIcon /></button>
    {added && <button className="text-link checkout-shortcut" type="button" onClick={() => router.push("/cart")}>View bag and checkout <ArrowIcon /></button>}
    <p className="delivery-note">Free UK delivery over £100 · Returns within 14 days</p>
  </>;
}

