import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyPaypalWebhook } from "@/lib/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaypalEvent = { id?: string; event_type?: string; resource?: { id?: string; status?: string; amount?: { value?: string; currency_code?: string }; supplementary_data?: { related_ids?: { order_id?: string } } } };

export async function POST(request: Request) {
  try {
    const event = await request.json() as PaypalEvent;
    if (!await verifyPaypalWebhook(request.headers, event)) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    const db = getAdminDb();
    if (!db) return NextResponse.json({ received: true });
    const eventRef = event.id ? db.collection("paypalWebhookEvents").doc(event.id) : null;
    if (eventRef && (await eventRef.get()).exists) return NextResponse.json({ received: true, duplicate: true });
    const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
    if (orderId && event.event_type?.startsWith("PAYMENT.CAPTURE.")) {
      const pointer = await db.collection("paypalOrders").doc(orderId).get();
      const orderNumber = pointer.data()?.orderNumber;
      if (typeof orderNumber === "string") {
        const status = event.event_type === "PAYMENT.CAPTURE.COMPLETED" ? "completed" : event.event_type === "PAYMENT.CAPTURE.REFUNDED" ? "refunded" : "failed";
        const orderRef = db.collection("orders").doc(orderNumber);
        const order = await orderRef.get();
        if (!order.exists) throw new Error("PAYPAL_WEBHOOK_ORDER_NOT_FOUND");
        if (status === "completed") {
          const receivedCents = Math.round(Number(event.resource?.amount?.value) * 100);
          if (event.resource?.amount?.currency_code !== "GBP" || receivedCents !== Number(order.data()?.totalCents)) throw new Error("PAYPAL_WEBHOOK_AMOUNT_MISMATCH");
        }
        await orderRef.update({ status: status === "completed" ? "paid" : status, "payment.status": status, "payment.paypalCaptureId": event.resource?.id ?? null, updatedAt: FieldValue.serverTimestamp() });
        await pointer.ref.set({ status, captureId: event.resource?.id ?? null, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      }
    }
    if (eventRef) await eventRef.set({ type: event.event_type ?? "unknown", processedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook failed", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
