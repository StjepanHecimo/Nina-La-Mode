"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Login failed.");
      router.replace("/admin/products/new");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed.");
    } finally { setLoading(false); }
  }

  return <form className="admin-login-form" onSubmit={submit}>
    <label>Email address<input name="email" type="email" autoComplete="username" defaultValue="info@ninilamode.com" required /></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
    {error && <p className="checkout-error" role="alert">{error}</p>}
    <button className="button" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
    <p className="admin-security-note">For security, access is temporarily locked after five unsuccessful attempts.</p>
  </form>;
}

