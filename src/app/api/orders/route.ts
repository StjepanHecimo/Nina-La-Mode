import { randomBytes } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getProductById } from "@/lib/products";
import { sendOrderEmails } from "@/lib/order-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestItem = { productId?: unknown; size?: unknown; colour?: unknown; quantity?: unknown };
type CustomerInput = Record<string, unknown>;

const clean = (value: unknown, max = 120) => typeof value === "string" ? value.trim().slice(0, max) : "";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const postcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { customer?: CustomerInput; items?: RequestItem[]; paymentMethod?: unknown };
    const input = body.customer ?? {};
    const customer = {
      firstName: clean(input.firstName, 60), lastName: clean(input.lastName, 60), email: clean(input.email, 160).toLowerCase(), phone: clean(input.phone, 40),
      address1: clean(input.address1, 120), address2: clean(input.address2, 120), city: clean(input.city, 80), county: clean(input.county, 80), postcode: clean(input.postcode, 12).toUpperCase(), country: "United Kingdom",
    };
    if (!customer.firstName || !customer.lastName || !emailPattern.test(customer.email) || !customer.phone || !customer.address1 || !customer.city || !postcodePattern.test(customer.postcode)) {
      return NextResponse.json({ error: "Please check your contact details and enter a valid UK delivery address." }, { status: 400 });
    }
    if (body.paymentMethod !== "paypal") return NextResponse.json({ error: "Please select PayPal." }, { status: 400 });
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 20) return NextResponse.json({ error: "Your bag is empty or contains too many items." }, { status: 400 });

    const orderItems = await Promise.all(body.items.map(async (item) => {
      const productId = clean(item.productId, 100);
      const size = clean(item.size, 30);
      const colour = clean(item.colour, 60);
      const quantity = Number(item.quantity);
      const product = await getProductById(productId);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 10 || !product.sizes.includes(size) || !product.colors.some(option => option.name === colour)) throw new Error("INVALID_ITEM");
      return { productId: product.id, name: product.name, image: product.image, size, colour, quantity, unitPriceCents: product.priceCents, lineTotalCents: product.priceCents * quantity };
    }));

    const subtotalCents = orderItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
    const shippingCents = 0;
    const totalCents = subtotalCents + shippingCents;
    const orderNumber = `NLM-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const order = {
      orderNumber, customer, items: orderItems, currency: "GBP", subtotalCents, shippingCents, totalCents,
      payment: { provider: "paypal", status: "pending_integration", paypalOrderId: null, paypalCaptureId: null },
      status: "test_order_received", source: "web_checkout_test",
    };

    const db = getAdminDb();
    if (db) await db.collection("orders").doc(orderNumber).set({ ...order, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });

    let emailSent = false;
    try { emailSent = await sendOrderEmails(order); } catch (emailError) { console.error("Order email failed", emailError); }

    // Future PayPal flow: create a PayPal order before this confirmation, then update
    // payment.paypalOrderId. A separate capture endpoint will verify and mark it paid.
    return NextResponse.json({ orderNumber, paymentStatus: order.payment.status, emailSent, savedToFirestore: Boolean(db) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ITEM") return NextResponse.json({ error: "One of the selected products, colours or UK sizes is no longer available." }, { status: 400 });
    console.error("Order creation failed", error);
    return NextResponse.json({ error: "We could not create the order. Please try again." }, { status: 500 });
  }
}

