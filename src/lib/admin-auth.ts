import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "nini_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

type SessionPayload = { email: string; exp: number };

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_SECRET || process.env.FIREBASE_PRIVATE_KEY || "";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createAdminSessionToken(email: string) {
  if (!secret()) throw new Error("ADMIN_SESSION_SECRET_NOT_CONFIGURED");
  const payload = Buffer.from(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS } satisfies SessionPayload)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(token: string | undefined): SessionPayload | null {
  if (!token || !secret()) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    if (!decoded.email || decoded.exp <= Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch { return null; }
}

export async function getAdminSession() {
  const store = await cookies();
  return verifyAdminSessionToken(store.get(COOKIE_NAME)?.value);
}

export async function setAdminSession(email: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, createAdminSessionToken(email), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_SECONDS });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
}

export const adminUserId = (email: string) => createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
