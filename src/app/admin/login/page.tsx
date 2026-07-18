import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin/products/new");
  return <main className="admin-page"><section className="admin-login"><p className="kicker">Nini La Mode administration</p><h1>Welcome back.</h1><p>Sign in to manage products and publish new arrivals.</p><AdminLoginForm /></section></main>;
}

