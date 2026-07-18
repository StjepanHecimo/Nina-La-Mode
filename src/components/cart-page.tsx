"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "./icons";
import { useCart } from "./cart-provider";
import { cartItemKey } from "@/lib/cart";
import { formatPrice } from "@/data/products";

export function CartPage() {
  const { items, subtotalCents, hydrated, updateQuantity, removeItem } = useCart();

  if (!hydrated) return <main className="checkout-page"><div className="checkout-empty">Loading your bag…</div></main>;
  if (!items.length) return <main className="checkout-page"><div className="checkout-empty"><p className="kicker">Your bag</p><h1>Your bag is empty.</h1><p>Discover trousers designed to fit your height beautifully.</p><Link className="button" href="/shop">Continue shopping <ArrowIcon /></Link></div></main>;

  return <main className="checkout-page">
    <section className="checkout-heading"><p className="kicker">Your selection</p><h1>Shopping bag.</h1><p>{items.reduce((sum, item) => sum + item.quantity, 0)} item{items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? "" : "s"}</p></section>
    <div className="cart-layout">
      <section className="cart-items" aria-label="Shopping bag items">{items.map((item) => {
        const key = cartItemKey(item);
        return <article className="cart-item" key={key}>
          <Link className="cart-item-image" href={`/shop/${item.productId}`}><Image src={item.image} alt={item.name} fill sizes="140px" /></Link>
          <div className="cart-item-copy"><p className="kicker">{item.preorder ? "Pre-order · " : ""}{item.colour} · {item.size}</p><Link href={`/shop/${item.productId}`}><h2>{item.name}</h2></Link><p>{formatPrice(item.priceCents)}</p><div className="quantity-control"><button type="button" onClick={() => updateQuantity(key, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}>−</button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(key, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}>+</button></div><button className="remove-item" type="button" onClick={() => removeItem(key)}>Remove</button></div>
          <strong>{formatPrice(item.priceCents * item.quantity)}</strong>
        </article>;
      })}</section>
      <aside className="order-summary"><p className="kicker">Order summary</p><div><span>Subtotal</span><strong>{formatPrice(subtotalCents)}</strong></div><div><span>Delivery</span><span>Calculated at payment</span></div><div className="summary-total"><span>Order subtotal</span><strong>{formatPrice(subtotalCents)}</strong></div><Link className="button" href="/checkout">Proceed to checkout <ArrowIcon /></Link><Link className="text-link" href="/shop">Continue shopping</Link></aside>
    </div>
  </main>;
}
