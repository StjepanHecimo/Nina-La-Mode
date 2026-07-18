import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminProductList } from "@/components/admin-product-list";
import { getAdminSession } from "@/lib/admin-auth";
import { getAdminProducts } from "@/lib/admin-products";

export const metadata: Metadata = { title: "Products administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const products = await getAdminProducts();
  return <main className="admin-page"><section className="admin-heading"><p className="kicker">Product administration</p><h1>Products.</h1><p>Edit published products, continue working on drafts or add something new.</p></section><AdminProductList products={products} email={session.email} /></main>;
}

