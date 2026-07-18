import { NextResponse } from "next/server";
import { escapeHtml, mailShell, sendMail, shopEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const subjects = new Set(["Product and sizing", "Order and delivery", "Returns and exchanges", "Collaboration"]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (clean(body.website, 100)) return NextResponse.json({ sent: true });
    const name = clean(body.name, 100);
    const email = clean(body.email, 160).toLowerCase();
    const subject = clean(body.subject, 80);
    const message = clean(body.message, 3000);
    if (!name || !emailPattern.test(email) || !subjects.has(subject) || message.length < 10) {
      return NextResponse.json({ error: "Please complete every field with valid details." }, { status: 400 });
    }
    const recipient = shopEmail();
    const [shopSent, customerSent] = await Promise.all([
      sendMail({
        to: recipient,
        replyTo: email,
        subject: `Website enquiry: ${subject} — ${name}`,
        html: mailShell(`<p style="color:#a56d71;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">New website enquiry</p><h1 style="font-family:Georgia,serif;font-weight:normal">${escapeHtml(subject)}</h1><p><strong>From:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(email)}</p><div style="margin-top:24px;padding:20px;background:#f2e8dc;line-height:1.7;white-space:pre-wrap">${escapeHtml(message)}</div>`, "Reply directly to this email to contact the customer."),
      }),
      sendMail({
        to: email,
        replyTo: recipient,
        subject: "We received your message — Nini La Mode",
        html: mailShell(`<p style="color:#a56d71;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Message received</p><h1 style="font-family:Georgia,serif;font-weight:normal">Thank you, ${escapeHtml(name)}.</h1><p>We have received your message about <strong>${escapeHtml(subject)}</strong> and will get back to you as soon as possible.</p>`, "Please reply to this email if you need to add anything."),
      }),
    ]);
    return NextResponse.json({ sent: shopSent && customerSent });
  } catch (error) {
    console.error("Contact email failed", error);
    return NextResponse.json({ error: "We could not send your message. Please email info@ninilamode.com directly." }, { status: 500 });
  }
}

