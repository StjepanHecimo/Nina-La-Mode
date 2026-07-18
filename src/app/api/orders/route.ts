import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Legacy pre-payment endpoint. Orders must now be created and paid through
// /api/paypal/orders so confirmation emails are never sent before capture.
export async function POST() {
  return NextResponse.json({ error: "Please complete your order through PayPal checkout." }, { status: 410 });
}
