import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { products } from "../src/data/products";

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Nedostaju FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL ili FIREBASE_PRIVATE_KEY u .env.local datoteci.");
  }

  if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----") || !privateKey.trimEnd().endsWith("-----END PRIVATE KEY-----")) {
    throw new Error("FIREBASE_PRIVATE_KEY nije potpun. Kopiraj cijelu vrijednost polja private_key iz Service Account JSON-a, uključujući BEGIN PRIVATE KEY i END PRIVATE KEY retke.");
  }

  const app = getApps()[0] ?? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const db = getFirestore(app);
  const batch = db.batch();

  const existingProducts = await db.collection("products").get();
  existingProducts.docs.forEach((document) => {
    batch.update(document.ref, { active: false, updatedAt: FieldValue.serverTimestamp() });
  });

  products.forEach(({ id, ...product }, order) => {
    const reference = db.collection("products").doc(id);
    batch.set(reference, {
      ...product,
      active: true,
      featured: order < 3,
      order,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });

  await batch.commit();
  console.log(`Uspješno zapisano ${products.length} proizvoda u Firestore kolekciju "products".`);
}

main().catch((error: unknown) => {
  console.error("Seed proizvoda nije uspio:", error);
  process.exitCode = 1;
});
