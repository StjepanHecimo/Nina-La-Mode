import "server-only";

import { getAdminDb, isFirebaseAdminConfigured } from "./firebase-admin";
import { products as fallbackProducts, type Product } from "@/data/products";

const collectionName = "products";

function mapProduct(id: string, data: FirebaseFirestore.DocumentData): Product {
  return {
    id,
    name: String(data.name ?? ""),
    category: data.category as Product["category"],
    priceCents: Number(data.priceCents ?? 0),
    image: String(data.image ?? ""),
    images: Array.isArray(data.images) ? data.images.map(String) : [String(data.image ?? "")],
    color: String(data.color ?? ""),
    colors: Array.isArray(data.colors) ? data.colors.map((colour: unknown) => {
      const value = colour && typeof colour === "object" ? colour as Record<string, unknown> : {};
      return { name: String(value.name ?? ""), hex: String(value.hex ?? "") };
    }) : [],
    material: String(data.material ?? ""),
    description: String(data.description ?? ""),
    sizes: Array.isArray(data.sizes) ? data.sizes.map(String) : [],
    inseam: typeof data.inseam === "string" ? data.inseam : undefined,
    fit: typeof data.fit === "string" ? data.fit : undefined,
    isNew: data.isNew === true,
  };
}

export async function getProducts(): Promise<Product[]> {
  const db = getAdminDb();
  if (!db || !isFirebaseAdminConfigured) return fallbackProducts;

  const snapshot = await db
    .collection(collectionName)
    .where("active", "==", true)
    .get();

  return snapshot.docs.sort((a, b) => (a.data().order ?? 0) - (b.data().order ?? 0)).map((doc) => {
    return mapProduct(doc.id, doc.data());
  });
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = getAdminDb();
  if (!db || !isFirebaseAdminConfigured) {
    return fallbackProducts.find((product) => product.id === id) ?? null;
  }

  const snapshot = await db.collection(collectionName).doc(id).get();
  if (!snapshot.exists || snapshot.data()?.active !== true) return null;

  return mapProduct(snapshot.id, snapshot.data()!);
}
