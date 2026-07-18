import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { escapeHtml, mailShell, sendMail, shopEmail } from "@/lib/mailer";
import { syncBrevoContact } from "@/lib/brevo-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ subscribed: true });
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : "";
    if (!emailPattern.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

    const db = getAdminDb();
    const subscriberId = createHash("sha256").update(email).digest("hex");
    const subscriberRef = db?.collection("newsletterSubscribers").doc(subscriberId);
    if (subscriberRef) await subscriberRef.set({ email, status: "subscribed", source: "website", updatedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() }, { merge: true });
    let brevoSynced = false;
    try {
      brevoSynced = await syncBrevoContact(email);
      if (subscriberRef && brevoSynced) await subscriberRef.set({ brevoSynced: true, brevoSyncedAt: FieldValue.serverTimestamp() }, { merge: true });
    } catch (syncError) {
      console.error("Brevo contact sync failed", syncError);
    }
    const recipient = shopEmail();
    const [shopSent, customerSent] = await Promise.all([
      sendMail({ to: recipient, replyTo: email, subject: `New newsletter subscriber — ${email}`, html: mailShell(`<p style="color:#a56d71;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">New subscriber</p><h1 style="font-family:Georgia,serif;font-weight:normal">Someone wants to know what is happening.</h1><p><strong>Email:</strong> ${escapeHtml(email)}</p>`, "Newsletter signup from ninilamode.com.") }),
      sendMail({ to: email, replyTo: recipient, subject: "Welcome to Nini La Mode", html: mailShell(`<p style="color:#a56d71;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">You are on the list</p><h1 style="font-family:Georgia,serif;font-weight:normal">Be the first to know what is happening.</h1><p>Thank you for joining Nini La Mode. We will keep you updated with new pieces and news.</p>`, "You received this because you subscribed at ninilamode.com.") }),
    ]);
    return NextResponse.json({ subscribed: true, emailSent: shopSent && customerSent, savedToFirestore: Boolean(db), brevoSynced });
  } catch (error) {
    console.error("Newsletter signup failed", error);
    return NextResponse.json({ error: "We could not complete your subscription. Please try again." }, { status: 500 });
  }
}
