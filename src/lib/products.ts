import "server-only";

import { getAdminDb, isFirebaseAdminConfigured } from "./firebase-admin";
import { products as fallbackProducts, type Product } from "@/data/products";

const collectionName = "products";

function mapProduct(id: string, data: Omit<Product, "id">): Product {
  return { id, ...data };
}

export async function getProducts(): Promise<Product[]> {
  const db = getAdminDb();
  if (!db || !isFirebaseAdminConfigured) return fallbackProducts;

  const snapshot = await db
    .collection(collectionName)
    .where("active", "==", true)
    .get();

  return snapshot.docs.sort((a, b) => (a.data().order ?? 0) - (b.data().order ?? 0)).map((doc) => {
    const { active: _active, order: _order, createdAt: _createdAt, updatedAt: _updatedAt, ...product } = doc.data();
    void _active; void _order; void _createdAt; void _updatedAt;
    return mapProduct(doc.id, product as Omit<Product, "id">);
  });
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = getAdminDb();
  if (!db || !isFirebaseAdminConfigured) {
    return fallbackProducts.find((product) => product.id === id) ?? null;
  }

  const snapshot = await db.collection(collectionName).doc(id).get();
  if (!snapshot.exists || snapshot.data()?.active !== true) return null;

  const { active: _active, order: _order, createdAt: _createdAt, updatedAt: _updatedAt, ...product } = snapshot.data()!;
  void _active; void _order; void _createdAt; void _updatedAt;
  return mapProduct(snapshot.id, product as Omit<Product, "id">);
}
