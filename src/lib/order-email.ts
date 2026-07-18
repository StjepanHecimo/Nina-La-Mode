import "server-only";

import nodemailer from "nodemailer";
import { formatPrice } from "@/data/products";

type EmailOrder = {
  orderNumber: string;
  customer: { firstName: string; lastName: string; email: string; phone: string; address1: string; address2: string; city: string; county: string; postcode: string; country: string };
  items: { name: string; size: string; colour: string; quantity: number; unitPriceCents: number; lineTotalCents: number }[];
  totalCents: number;
};

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!);

export function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM_EMAIL);
}

function rows(order: EmailOrder) {
  return order.items.map((item) => `<tr><td style="padding:12px 0;border-bottom:1px solid #e5ddd3"><strong>${escapeHtml(item.name)}</strong><br><span style="color:#69707d">${escapeHtml(item.colour)} · ${escapeHtml(item.size)} · Qty ${item.quantity}</span></td><td style="padding:12px 0;border-bottom:1px solid #e5ddd3;text-align:right">${formatPrice(item.lineTotalCents)}</td></tr>`).join("");
}

function shell(content: string) {
  return `<div style="margin:0;background:#f2e8dc;padding:32px 16px;color:#1c2230;font-family:Arial,sans-serif"><div style="max-width:640px;margin:auto;background:#fffdf9;padding:36px"><p style="margin:0 0 28px;font-family:Georgia,serif;font-size:24px;letter-spacing:3px">NINI LA MODE</p>${content}<p style="margin:32px 0 0;padding-top:20px;border-top:1px solid #e5ddd3;color:#69707d;font-size:12px">This is a test checkout confirmation. PayPal payment has not yet been captured.</p></div></div>`;
}

export async function sendOrderEmails(order: EmailOrder) {
  if (!isSmtpConfigured()) return false;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  const from = { name: process.env.SMTP_FROM_NAME || "Nini La Mode", address: process.env.SMTP_FROM_EMAIL! };
  const shopEmail = process.env.CONTACT_TO_EMAIL || process.env.SMTP_FROM_EMAIL!;
  const customerName = `${order.customer.firstName} ${order.customer.lastName}`;
  const itemRows = rows(order);

  await Promise.all([
    transporter.sendMail({
      from,
      to: order.customer.email,
      replyTo: shopEmail,
      subject: `We received your Nini La Mode order ${order.orderNumber}`,
      html: shell(`<p style="color:#a56d71;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Order ${escapeHtml(order.orderNumber)}</p><h1 style="font-family:Georgia,serif;font-weight:normal">Thank you, ${escapeHtml(order.customer.firstName)}.</h1><p>We have received your test order. No payment has been taken yet.</p><table style="width:100%;border-collapse:collapse">${itemRows}<tr><td style="padding-top:18px"><strong>Total</strong></td><td style="padding-top:18px;text-align:right"><strong>${formatPrice(order.totalCents)}</strong></td></tr></table><p style="margin-top:28px"><strong>Delivery address</strong><br>${escapeHtml(order.customer.address1)}${order.customer.address2 ? `<br>${escapeHtml(order.customer.address2)}` : ""}<br>${escapeHtml(order.customer.city)}${order.customer.county ? `, ${escapeHtml(order.customer.county)}` : ""}<br>${escapeHtml(order.customer.postcode)}<br>United Kingdom</p>`),
    }),
    transporter.sendMail({
      from,
      to: shopEmail,
      replyTo: order.customer.email,
      subject: `New test order ${order.orderNumber} — ${customerName}`,
      html: shell(`<p style="color:#a56d71;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">New order ${escapeHtml(order.orderNumber)}</p><h1 style="font-family:Georgia,serif;font-weight:normal">New test order received.</h1><p><strong>Customer:</strong> ${escapeHtml(customerName)}<br><strong>Email:</strong> ${escapeHtml(order.customer.email)}<br><strong>Phone:</strong> ${escapeHtml(order.customer.phone)}</p><table style="width:100%;border-collapse:collapse">${itemRows}<tr><td style="padding-top:18px"><strong>Total</strong></td><td style="padding-top:18px;text-align:right"><strong>${formatPrice(order.totalCents)}</strong></td></tr></table><p style="margin-top:28px"><strong>Delivery address</strong><br>${escapeHtml(order.customer.address1)}${order.customer.address2 ? `<br>${escapeHtml(order.customer.address2)}` : ""}<br>${escapeHtml(order.customer.city)}${order.customer.county ? `, ${escapeHtml(order.customer.county)}` : ""}<br>${escapeHtml(order.customer.postcode)}<br>United Kingdom</p>`),
    }),
  ]);
  return true;
}

