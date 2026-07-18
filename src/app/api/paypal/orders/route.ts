import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { buildCheckoutOrder, CheckoutValidationError } from "@/lib/checkout-order";
import { getAdminDb } from "@/lib/firebase-admin";
import { createPaypalOrder } from "@/lib/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { customer?: Record<string, unknown>; items?: Array<Record<string, unknown>> };
    const order = await buildCheckoutOrder(body);
    const paypal = await createPaypalOrder(order);
    if (!paypal.id) throw new Error("PAYPAL_ORDER_ID_MISSING");
    const db = getAdminDb();
    if (!db) return NextResponse.json({ error: "Order storage is not configured." }, { status: 503 });
    await db.runTransaction(async transaction => {
      transaction.set(db.collection("orders").doc(order.orderNumber), {
        ...order,
        payment: { provider: "paypal", environment: process.env.PAYPAL_ENV === "live" ? "live" : "sandbox", status: "created", paypalOrderId: paypal.id, paypalCaptureId: null },
        status: "awaiting_payment", source: "web_checkout", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.set(db.collection("paypalOrders").doc(paypal.id), { orderNumber: order.orderNumber, status: "created", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    });
    return NextResponse.json({ id: paypal.id, orderNumber: order.orderNumber });
  } catch (error) {
    if (error instanceof CheckoutValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("PayPal order creation failed", error);
    return NextResponse.json({ error: "PayPal could not start the payment. Please try again." }, { status: 502 });
  }
}
