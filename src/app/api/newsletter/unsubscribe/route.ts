import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { unsubscribeBrevoContact } from "@/lib/brevo-api";
import { getAdminDb } from "@/lib/firebase-admin";
import { readUnsubscribeToken } from "@/lib/newsletter-token";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { token?: unknown };
    const email = typeof body.token === "string" ? readUnsubscribeToken(body.token) : null;
    if (!email) return NextResponse.json({ error: "This unsubscribe link is invalid." }, { status: 400 });

    const db = getAdminDb();
    if (db) {
      const subscriberId = createHash("sha256").update(email).digest("hex");
      await db.collection("newsletterSubscribers").doc(subscriberId).set({
        email,
        status: "unsubscribed",
        brevoSynced: false,
        unsubscribedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    try {
      await unsubscribeBrevoContact(email);
    } catch (error) {
      console.error("Brevo unsubscribe failed", error);
      return NextResponse.json({ error: "We could not complete your request. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ unsubscribed: true });
  } catch (error) {
    console.error("Newsletter unsubscribe failed", error);
    return NextResponse.json({ error: "We could not complete your request. Please try again." }, { status: 500 });
  }
}
