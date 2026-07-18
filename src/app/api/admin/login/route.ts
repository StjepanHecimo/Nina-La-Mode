import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminUserId, setAdminSession } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyPassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(request: Request) {
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "Login is temporarily unavailable." }, { status: 503 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : "";
    const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
    const ref = db.collection("adminUsers").doc(adminUserId(email));
    const snapshot = await ref.get();
    const data = snapshot.data();
    const lockedUntil = data?.lockedUntil?.toMillis?.() ?? 0;
    if (lockedUntil > Date.now()) return NextResponse.json({ error: "Too many attempts. Please try again in 15 minutes." }, { status: 429 });

    const valid = Boolean(data?.active === true && typeof data.passwordHash === "string" && await verifyPassword(password, data.passwordHash));
    if (!valid) {
      if (snapshot.exists) {
        const attempts = Number(data?.failedAttempts || 0) + 1;
        await ref.set({ failedAttempts: attempts >= MAX_ATTEMPTS ? 0 : attempts, lockedUntil: attempts >= MAX_ATTEMPTS ? Timestamp.fromMillis(Date.now() + LOCK_MINUTES * 60_000) : null, lastFailedLoginAt: Timestamp.now() }, { merge: true });
      }
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await ref.set({ failedAttempts: 0, lockedUntil: null, lastLoginAt: Timestamp.now() }, { merge: true });
    await setAdminSession(email);
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error("Admin login failed", error);
    return NextResponse.json({ error: "Login is temporarily unavailable." }, { status: 500 });
  }
}

