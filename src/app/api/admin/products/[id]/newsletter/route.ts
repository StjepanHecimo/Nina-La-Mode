import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { sendNewProductCampaign, syncBrevoContact } from "@/lib/brevo-api";
import { getAdminDb } from "@/lib/firebase-admin";
import { parseProductInput } from "@/lib/product-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  const { id } = await params;
  const ref = db.collection("products").doc(id);
  try {
    const snapshot = await ref.get();
    if (!snapshot.exists) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    const data = snapshot.data()!;
    if (data.active !== true) return NextResponse.json({ error: "Publish the product before sending its newsletter." }, { status: 400 });
    if (data.newsletterNotification?.status === "sent") return NextResponse.json({ error: "The newsletter for this product has already been sent." }, { status: 409 });
    const product = parseProductInput({ id, ...data });
    if (!product) return NextResponse.json({ error: "The saved product data is incomplete." }, { status: 400 });

    const subscribers = await db.collection("newsletterSubscribers").where("status", "==", "subscribed").get();
    if (subscribers.empty) return NextResponse.json({ error: "There are currently no subscribed contacts." }, { status: 400 });
    for (const document of subscribers.docs) {
      const email = document.data().email;
      if (typeof email !== "string" || document.data().brevoSynced === true) continue;
      await syncBrevoContact(email);
      await document.ref.set({ brevoSynced: true, brevoSyncedAt: FieldValue.serverTimestamp() }, { merge: true });
    }

    const campaignId = await sendNewProductCampaign(product);
    await ref.set({ newsletterNotification: { status: "sent", campaignId, sentAt: FieldValue.serverTimestamp() }, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return NextResponse.json({ sent: true, campaignId, subscribers: subscribers.size });
  } catch (error) {
    console.error("Newsletter retry failed", error);
    await ref.set({ newsletterNotification: { status: "failed", updatedAt: FieldValue.serverTimestamp() } }, { merge: true }).catch(() => undefined);
    const details = error instanceof Error && error.message.startsWith("BREVO_API_ERROR:")
      ? error.message.split(":").slice(2).join(":").slice(0, 400)
      : "Check the Brevo API key, list ID and verified sender.";
    return NextResponse.json({ error: `Newsletter could not be sent. ${details}` }, { status: 502 });
  }
}
