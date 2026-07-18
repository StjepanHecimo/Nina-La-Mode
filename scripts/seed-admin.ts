import { createHash, randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const scrypt = promisify(scryptCallback);

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) throw new Error("Firebase Admin credentials are missing.");

  const app = getApps()[0] ?? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const db = getFirestore(app);
  const email = (process.env.SEED_ADMIN_EMAIL || "info@ninilamode.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "test123!";
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64) as Buffer;
  const passwordHash = `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
  const userId = createHash("sha256").update(email).digest("hex");

  await db.collection("adminUsers").doc(userId).set({
    email, passwordHash, active: true, failedAttempts: 0, lockedUntil: null,
    updatedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  console.log(`Admin user ready: ${email}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
