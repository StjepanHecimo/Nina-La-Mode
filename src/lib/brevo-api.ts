import "server-only";

import type { Product } from "@/data/products";
import { escapeHtml } from "@/lib/mailer";

const API_URL = "https://api.brevo.com/v3";

function configuration() {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!apiKey || !Number.isInteger(listId) || listId < 1) return null;
  return { apiKey, listId };
}

async function brevoRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const config = configuration();
  if (!config) throw new Error("BREVO_API_NOT_CONFIGURED");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { accept: "application/json", "content-type": "application/json", "api-key": config.apiKey, ...options.headers },
    cache: "no-store",
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`BREVO_API_ERROR:${response.status}:${details.slice(0, 300)}`);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const isBrevoApiConfigured = () => Boolean(configuration());

export async function syncBrevoContact(email: string) {
  const config = configuration();
  if (!config) return false;
  await brevoRequest("/contacts", {
    method: "POST",
    body: JSON.stringify({ email, listIds: [config.listId], updateEnabled: true }),
  });
  return true;
}

export async function unsubscribeBrevoContact(email: string) {
  const config = configuration();
  if (!config) return false;
  await brevoRequest(`/contacts/lists/${config.listId}/contacts/remove`, {
    method: "POST",
    body: JSON.stringify({ emails: [email] }),
  });
  return true;
}

export async function syncBrevoContacts(emails: string[]) {
  if (!configuration()) return false;
  for (let index = 0; index < emails.length; index += 10) {
    await Promise.all(emails.slice(index, index + 10).map(syncBrevoContact));
  }
  return true;
}

function productCampaignHtml(product: Product) {
  const siteUrl = "https://www.ninilamode.com";
  const productUrl = `${siteUrl}/shop/${encodeURIComponent(product.id)}`;
  const imageUrl = product.image.startsWith("http") ? product.image : `${siteUrl}${product.image}`;
  return `<!doctype html><html><body style="margin:0;background:#f2e8dc;color:#1c2230;font-family:Arial,sans-serif"><div style="max-width:680px;margin:auto;padding:32px 16px"><div style="background:#fffdf9;padding:36px"><p style="margin:0 0 28px;font-family:Georgia,serif;font-size:24px;letter-spacing:3px">NINI LA MODE</p><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}" style="display:block;width:100%;max-height:680px;object-fit:cover"><p style="margin:30px 0 10px;color:#a56d71;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">New arrival</p><h1 style="margin:0;font-family:Georgia,serif;font-size:42px;font-weight:normal">${escapeHtml(product.name)}</h1><p style="line-height:1.8;color:#59606d">${escapeHtml(product.description)}</p><p style="margin:28px 0"><a href="${escapeHtml(productUrl)}" style="display:inline-block;padding:17px 25px;background:#1c2230;color:#f2e8dc;text-decoration:none;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Discover the new piece</a></p><p style="margin:32px 0 0;padding-top:20px;border-top:1px solid #e5ddd3;color:#777b84;font-size:11px;line-height:1.6">You are receiving this email because you subscribed to Nini La Mode updates.<br><a href="{{ unsubscribe }}" style="color:#777b84">Unsubscribe</a></p></div></div></body></html>`;
}

export async function sendNewProductCampaign(product: Product) {
  const config = configuration();
  if (!config) throw new Error("BREVO_API_NOT_CONFIGURED");
  const senderEmail = process.env.SMTP_FROM_EMAIL || "info@ninilamode.com";
  const senderName = process.env.SMTP_FROM_NAME || "Nini La Mode";
  const campaign = await brevoRequest<{ id: number }>("/emailCampaigns", {
    method: "POST",
    body: JSON.stringify({
      name: `New product — ${product.name} — ${new Date().toISOString()}`,
      subject: `New at Nini La Mode: ${product.name}`,
      sender: { name: senderName, email: senderEmail },
      replyTo: senderEmail,
      recipients: { listIds: [config.listId] },
      htmlContent: productCampaignHtml(product),
      previewText: `${product.name} has arrived at Nini La Mode.`,
      tag: `new-product-${product.id}`,
    }),
  });
  await brevoRequest(`/emailCampaigns/${campaign.id}/sendNow`, { method: "POST" });
  return campaign.id;
}
