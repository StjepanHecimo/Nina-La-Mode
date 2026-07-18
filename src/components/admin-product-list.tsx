"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminProduct } from "@/lib/admin-products";
import { formatPrice } from "@/data/products";

export function AdminProductList({ products, email }: { products: AdminProduct[]; email: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");

  async function remove(product: AdminProduct) {
    const confirmation = window.prompt(`Permanently delete “${product.name}”?\n\nThis removes it from the shop and database. Type the product name to confirm.`);
    if (confirmation !== product.name) return;
    setDeleting(product.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, { method: "DELETE" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "The product could not be deleted.");
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The product could not be deleted."); }
    finally { setDeleting(""); }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return <>
    <div className="admin-toolbar"><span>Signed in as {email}</span><nav><Link href="/admin/products">Products</Link><Link href="/admin/products/new">Add product</Link><button type="button" onClick={logout}>Sign out</button></nav></div>
    {error && <p className="checkout-error" role="alert">{error}</p>}
    {!products.length ? <div className="admin-empty"><p>No products yet.</p><Link className="button" href="/admin/products/new">Add first product</Link></div> : <div className="admin-product-list">{products.map(product => <article key={product.id}>
      <div className="admin-list-image"><Image src={product.image} alt={product.name} fill sizes="110px" /></div>
      <div><span className={`admin-status ${product.active ? "published" : "draft"}`}>{product.active ? "Published" : "Draft"}</span><h2>{product.name}</h2><p>{product.category} · {formatPrice(product.priceCents)}</p>{product.campaignId && <small>Newsletter campaign #{product.campaignId}</small>}</div>
      <div className="admin-list-actions"><Link href={`/admin/products/${product.id}/edit`}>Edit</Link><button type="button" disabled={deleting === product.id} onClick={() => remove(product)}>{deleting === product.id ? "Deleting…" : "Delete"}</button></div>
    </article>)}</div>}
  </>;
}

