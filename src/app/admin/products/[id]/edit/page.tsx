import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminProductForm } from "@/components/admin-product-form";
import { getAdminSession } from "@/lib/admin-auth";
import { getAdminProductById } from "@/lib/admin-products";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Edit product", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;
  const product = await getAdminProductById(id);
  if (!product) notFound();
  return <main className="admin-page"><section className="admin-heading"><p className="kicker">Product administration</p><h1>Edit product.</h1><p>Update product details and images. Published products will not send another newsletter when edited.</p></section><AdminProductForm email={session.email} initialProduct={product} /></main>;
}

