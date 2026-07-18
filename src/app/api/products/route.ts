import { timingSafeEqual } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAdminSession } from "@/lib/admin-auth";
import { isBrevoApiConfigured, sendNewProductCampaign, syncBrevoContact } from "@/lib/brevo-api";
import type { Product } from "@/data/products";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ products });
}

async function authorised(request: Request) {
  if (await getAdminSession()) return true;
  const expected = process.env.ADMIN_API_SECRET || "";
  const received = request.headers.get("x-admin-secret") || "";
  if (!expected || expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

function productFrom(value: unknown): Product | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const id = typeof input.id === "string" ? input.id.trim() : "";
  const name = typeof input.name === "string" ? input.name.trim().slice(0, 120) : "";
  const category = input.category;
  const priceCents = Number(input.priceCents);
  const image = typeof input.image === "string" ? input.image.trim() : "";
  const images = Array.isArray(input.images) ? input.images.filter((item): item is string => typeof item === "string").slice(0, 12) : [];
  const color = typeof input.color === "string" ? input.color.trim().slice(0, 60) : "";
  const colors = Array.isArray(input.colors) ? input.colors.filter((item): item is { name: string; hex: string } => Boolean(item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string" && typeof (item as { hex?: unknown }).hex === "string")).slice(0, 12) : [];
  const material = typeof input.material === "string" ? input.material.trim().slice(0, 120) : "";
  const description = typeof input.description === "string" ? input.description.trim().slice(0, 2000) : "";
  const sizes = Array.isArray(input.sizes) ? input.sizes.filter((item): item is string => typeof item === "string").slice(0, 20) : [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !name || !["Dresses", "Blouses", "Trousers"].includes(String(category)) || !Number.isInteger(priceCents) || priceCents < 1 || !image || !images.length || !color || !colors.length || !material || description.length < 20 || !sizes.length) return null;
  return { id, name, category: category as Product["category"], priceCents, image, images, color, colors, material, description, sizes, inseam: typeof input.inseam === "string" ? input.inseam.trim().slice(0, 60) : undefined, fit: typeof input.fit === "string" ? input.fit.trim().slice(0, 160) : undefined, isNew: input.isNew !== false };
}

export async function POST(request: Request) {
  if (!await authorised(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  try {
    const body = await request.json() as Record<string, unknown>;
    const action = body.action === "draft" ? "draft" : body.action === "publish" ? "publish" : null;
    const inputProduct = productFrom(body);
    if (!action) return NextResponse.json({ error: "Choose Save draft or Publish." }, { status: 400 });
    if (!inputProduct) return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
    const { id, ...productData } = inputProduct;
    const productRef = db.collection("products").doc(id);
    const existing = await productRef.get();
    const alreadySent = existing.data()?.newsletterNotification?.status === "sent";
    if (existing.exists && alreadySent) return NextResponse.json({ error: "This product is already published and its newsletter has been sent." }, { status: 409 });

    const currentProducts = !existing.exists ? await db.collection("products").get() : null;
    const baseData = { ...productData, updatedAt: FieldValue.serverTimestamp(), ...(!existing.exists ? { order: currentProducts!.size, createdAt: FieldValue.serverTimestamp() } : {}) };
    if (action === "draft") {
      await productRef.set({ ...baseData, active: false, newsletterNotification: { status: "draft", updatedAt: FieldValue.serverTimestamp() } }, { merge: true });
      return NextResponse.json({ productId: id, saved: "draft" }, { status: existing.exists ? 200 : 201 });
    }

    await productRef.set({ ...baseData, active: true, newsletterNotification: { status: "pending", updatedAt: FieldValue.serverTimestamp() } }, { merge: true });

    if (!isBrevoApiConfigured()) {
      await productRef.set({ newsletterNotification: { status: "waiting_for_brevo", updatedAt: FieldValue.serverTimestamp() } }, { merge: true });
      return NextResponse.json({ productId: id, created: !existing.exists, newsletter: "waiting_for_brevo" }, { status: 202 });
    }

    const subscribers = await db.collection("newsletterSubscribers").where("status", "==", "subscribed").get();
    const unsynced = subscribers.docs.filter((document) => document.data().brevoSynced !== true);
    for (let index = 0; index < unsynced.length; index += 10) {
      await Promise.all(unsynced.slice(index, index + 10).map(async (document) => {
        const email = document.data().email;
        if (typeof email !== "string") return;
        await syncBrevoContact(email);
        await document.ref.set({ brevoSynced: true, brevoSyncedAt: FieldValue.serverTimestamp() }, { merge: true });
      }));
    }

    if (subscribers.empty) {
      await productRef.set({ newsletterNotification: { status: "no_subscribers", updatedAt: FieldValue.serverTimestamp() } }, { merge: true });
      return NextResponse.json({ productId: id, created: !existing.exists, newsletter: "no_subscribers" }, { status: 201 });
    }

    const campaignId = await sendNewProductCampaign(inputProduct);
    await productRef.set({ newsletterNotification: { status: "sent", campaignId, sentAt: FieldValue.serverTimestamp() }, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return NextResponse.json({ productId: id, created: !existing.exists, newsletter: "sent", campaignId, subscribers: subscribers.size }, { status: 201 });
  } catch (error) {
    console.error("Product creation or newsletter failed", error);
    return NextResponse.json({ error: "The product or newsletter could not be completed." }, { status: 500 });
  }
}
