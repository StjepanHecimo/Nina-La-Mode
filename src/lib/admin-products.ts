import "server-only";

import type { Product } from "@/data/products";
import { getAdminDb } from "@/lib/firebase-admin";

export type AdminProduct = Product & { active: boolean; order: number; newsletterStatus: string; campaignId?: number };

function mapAdminProduct(id: string, data: FirebaseFirestore.DocumentData): AdminProduct {
  const notification = data.newsletterNotification ?? {};
  return {
    id, name: data.name, category: data.category, priceCents: data.priceCents, image: data.image, images: data.images ?? [data.image], color: data.color,
    colors: data.colors ?? [], material: data.material, description: data.description, sizes: data.sizes ?? [], inseam: data.inseam, fit: data.fit, isNew: data.isNew,
    active: data.active === true, order: Number(data.order ?? 0), newsletterStatus: String(notification.status ?? "none"), campaignId: typeof notification.campaignId === "number" ? notification.campaignId : undefined,
  };
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const db = getAdminDb();
  if (!db) return [];
  const snapshot = await db.collection("products").get();
  return snapshot.docs.map(doc => mapAdminProduct(doc.id, doc.data())).sort((a, b) => a.order - b.order);
}

export async function getAdminProductById(id: string): Promise<AdminProduct | null> {
  const db = getAdminDb();
  if (!db) return null;
  const snapshot = await db.collection("products").doc(id).get();
  return snapshot.exists ? mapAdminProduct(snapshot.id, snapshot.data()!) : null;
}

