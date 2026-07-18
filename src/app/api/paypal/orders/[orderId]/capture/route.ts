import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { capturePaypalOrder } from "@/lib/paypal";
import { sendOrderEmails } from "@/lib/order-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  if (!/^[A-Z0-9]+$/i.test(orderId)) return NextResponse.json({ error: "Invalid PayPal order." }, { status: 400 });
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "Order storage is not configured." }, { status: 503 });
  try {
    const pointer = await db.collection("paypalOrders").doc(orderId).get();
    const orderNumber = pointer.data()?.orderNumber;
    if (!pointer.exists || typeof orderNumber !== "string") return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const orderRef = db.collection("orders").doc(orderNumber);
    const before = await orderRef.get();
    if (!before.exists) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (before.data()?.payment?.status === "completed") {
      let emailSent = before.data()?.confirmationEmailSent === true;
      if (!emailSent) {
        try {
          emailSent = await sendOrderEmails(before.data() as Parameters<typeof sendOrderEmails>[0]);
          if (emailSent) await orderRef.set({ confirmationEmailSent: true, confirmationEmailSentAt: FieldValue.serverTimestamp() }, { merge: true });
        } catch (emailError) { console.error("Paid order email failed", emailError); }
      }
      return NextResponse.json({ orderNumber, paymentStatus: "completed", emailSent });
    }

    const paypal = await capturePaypalOrder(orderId);
    const capture = paypal.purchase_units?.flatMap(unit => unit.payments?.captures ?? [])[0];
    const expectedCents = Number(before.data()?.totalCents);
    const receivedCents = Math.round(Number(capture?.amount?.value) * 100);
    if (paypal.status !== "COMPLETED" || capture?.status !== "COMPLETED" || capture.amount?.currency_code !== "GBP" || receivedCents !== expectedCents || !capture.id) {
      throw new Error("PAYPAL_CAPTURE_MISMATCH");
    }

    await db.runTransaction(async transaction => {
      const current = await transaction.get(orderRef);
      if (current.data()?.payment?.status === "completed") return;
      transaction.update(orderRef, { status: "paid", payment: { provider: "paypal", environment: process.env.PAYPAL_ENV === "live" ? "live" : "sandbox", status: "completed", paypalOrderId: orderId, paypalCaptureId: capture.id, payerEmail: paypal.payer?.email_address ?? null, capturedAt: FieldValue.serverTimestamp() }, updatedAt: FieldValue.serverTimestamp() });
      transaction.set(db.collection("transactions").doc(capture.id), { provider: "paypal", orderNumber, paypalOrderId: orderId, captureId: capture.id, status: "completed", currency: "GBP", amountCents: receivedCents, environment: process.env.PAYPAL_ENV === "live" ? "live" : "sandbox", createdAt: FieldValue.serverTimestamp() });
      transaction.set(pointer.ref, { status: "completed", captureId: capture.id, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    });

    const paidOrder = (await orderRef.get()).data()!;
    let emailSent = paidOrder.confirmationEmailSent === true;
    if (!emailSent) {
      try {
        emailSent = await sendOrderEmails(paidOrder as Parameters<typeof sendOrderEmails>[0]);
        if (emailSent) await orderRef.set({ confirmationEmailSent: true, confirmationEmailSentAt: FieldValue.serverTimestamp() }, { merge: true });
      } catch (emailError) { console.error("Paid order email failed", emailError); }
    }
    return NextResponse.json({ orderNumber, paymentStatus: "completed", emailSent });
  } catch (error) {
    console.error("PayPal capture failed", error);
    return NextResponse.json({ error: "PayPal could not complete the payment. You have not been charged twice. Please try again." }, { status: 502 });
  }
}
