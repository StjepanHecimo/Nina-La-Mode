import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminProductForm } from "@/components/admin-product-form";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Add product", robots: { index: false, follow: false } };

export default async function NewProductPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <main className="admin-page"><section className="admin-heading"><p className="kicker">Product administration</p><h1>Add a new product.</h1><p>Save privately as a draft or publish it to the shop and notify subscribers.</p></section><AdminProductForm email={session.email} /></main>;
}

