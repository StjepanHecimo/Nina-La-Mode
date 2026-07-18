import "server-only";

import nodemailer, { type SendMailOptions } from "nodemailer";

export const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!);

export function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM_EMAIL);
}

export function mailShell(content: string, footer = "Sent by Nini La Mode.") {
  return `<div style="margin:0;background:#f2e8dc;padding:32px 16px;color:#1c2230;font-family:Arial,sans-serif"><div style="max-width:640px;margin:auto;background:#fffdf9;padding:36px"><p style="margin:0 0 28px;font-family:Georgia,serif;font-size:24px;letter-spacing:3px">NINI LA MODE</p>${content}<p style="margin:32px 0 0;padding-top:20px;border-top:1px solid #e5ddd3;color:#69707d;font-size:12px">${escapeHtml(footer)}</p></div></div>`;
}

export async function sendMail(options: Omit<SendMailOptions, "from">) {
  if (!isSmtpConfigured()) return false;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  await transporter.sendMail({
    ...options,
    from: { name: process.env.SMTP_FROM_NAME || "Nini La Mode", address: process.env.SMTP_FROM_EMAIL! },
  });
  return true;
}

export const shopEmail = () => process.env.CONTACT_TO_EMAIL || process.env.SMTP_FROM_EMAIL || "info@ninilamode.com";

