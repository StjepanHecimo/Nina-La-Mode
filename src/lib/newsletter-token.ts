import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

type TokenPayload = { email: string };

function secret() {
  const value = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_SECRET;
  if (!value) throw new Error("NEWSLETTER_UNSUBSCRIBE_SECRET_NOT_CONFIGURED");
  return value;
}

export function createUnsubscribeToken(email: string) {
  const payload = Buffer.from(JSON.stringify({ email } satisfies TokenPayload)).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readUnsubscribeToken(token: string) {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest();
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as TokenPayload;
    return typeof parsed.email === "string" && parsed.email.includes("@") ? parsed.email.toLowerCase() : null;
  } catch {
    return null;
  }
}
