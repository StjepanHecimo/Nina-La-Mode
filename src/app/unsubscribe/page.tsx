import type { Metadata } from "next";
import { UnsubscribeForm } from "@/components/unsubscribe-form";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <main className="page-main"><section className="page-hero"><p className="kicker">Email preferences</p><h1>Unsubscribe</h1>{token ? <UnsubscribeForm token={token} /> : <p>This unsubscribe link is invalid.</p>}</section></main>;
}
