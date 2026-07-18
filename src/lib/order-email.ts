import "server-only";

import { formatPrice } from "@/data/products";
import { escapeHtml, isSmtpConfigured, mailShell, sendMail, shopEmail } from "@/lib/mailer";

type EmailOrder = {
  orderNumber: string;
  customer: { firstName: string; lastName: string; email: string; phone: string; address1: string; address2: string; city: string; county: string; postcode: string; country: string };
  items: { name: string; size: string; colour: string; quantity: number; unitPriceCents: number; lineTotalCents: number }[];
  totalCents: number;
};

function rows(order: EmailOrder) {
  return order.items.map((item) => `<tr><td style="padding:12px 0;border-bottom:1px solid #e5ddd3"><strong>${escapeHtml(item.name)}</strong><br><span style="color:#69707d">${escapeHtml(item.colour)} · ${escapeHtml(item.size)} · Qty ${item.quantity}</span></td><td style="padding:12px 0;border-bottom:1px solid #e5ddd3;text-align:right">${formatPrice(item.lineTotalCents)}</td></tr>`).join("");
}

export async function sendOrderEmails(order: EmailOrder) {
  if (!isSmtpConfigured()) return false;
  const recipient = shopEmail();
  const customerName = `${order.customer.firstName} ${order.customer.lastName}`;
  const itemRows = rows(order);

  await Promise.all([
    sendMail({
      to: order.customer.email,
      replyTo: recipient,
      subject: `We received your Nini La Mode order ${order.orderNumber}`,
      html: mailShell(`<p style="color:#a56d71;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Order ${escapeHtml(order.orderNumber)}</p><h1 style="font-family:Georgia,serif;font-weight:normal">Thank you, ${escapeHtml(order.customer.firstName)}.</h1><p>We have received your order and will send payment and delivery confirmation shortly.</p><table style="width:100%;border-collapse:collapse">${itemRows}<tr><td style="padding-top:18px"><strong>Order subtotal</strong></td><td style="padding-top:18px;text-align:right"><strong>${formatPrice(order.totalCents)}</strong></td></tr></table><p style="margin-top:28px"><strong>Delivery address</strong><br>${escapeHtml(order.customer.address1)}${order.customer.address2 ? `<br>${escapeHtml(order.customer.address2)}` : ""}<br>${escapeHtml(order.customer.city)}${order.customer.county ? `, ${escapeHtml(order.customer.county)}` : ""}<br>${escapeHtml(order.customer.postcode)}<br>United Kingdom</p>`, "If you have any questions, simply reply to this email."),
    }),
    sendMail({
      to: recipient,
      replyTo: order.customer.email,
      subject: `New order ${order.orderNumber} — ${customerName}`,
      html: mailShell(`<p style="color:#a56d71;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">New order ${escapeHtml(order.orderNumber)}</p><h1 style="font-family:Georgia,serif;font-weight:normal">New order received.</h1><p><strong>Customer:</strong> ${escapeHtml(customerName)}<br><strong>Email:</strong> ${escapeHtml(order.customer.email)}<br><strong>Phone:</strong> ${escapeHtml(order.customer.phone)}</p><table style="width:100%;border-collapse:collapse">${itemRows}<tr><td style="padding-top:18px"><strong>Order subtotal</strong></td><td style="padding-top:18px;text-align:right"><strong>${formatPrice(order.totalCents)}</strong></td></tr></table><p style="margin-top:28px"><strong>Delivery address</strong><br>${escapeHtml(order.customer.address1)}${order.customer.address2 ? `<br>${escapeHtml(order.customer.address2)}` : ""}<br>${escapeHtml(order.customer.city)}${order.customer.county ? `, ${escapeHtml(order.customer.county)}` : ""}<br>${escapeHtml(order.customer.postcode)}<br>United Kingdom</p>`, "Reply directly to this email to contact the customer."),
    }),
  ]);
  return true;
}
