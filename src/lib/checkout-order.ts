import "server-only";

import { randomBytes } from "node:crypto";
import { getProductById } from "@/lib/products";

type RequestItem = { productId?: unknown; size?: unknown; colour?: unknown; quantity?: unknown };
type CustomerInput = Record<string, unknown>;

const clean = (value: unknown, max = 120) => typeof value === "string" ? value.trim().slice(0, max) : "";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const postcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export class CheckoutValidationError extends Error {}

export async function buildCheckoutOrder(body: { customer?: CustomerInput; items?: RequestItem[] }) {
  const input = body.customer ?? {};
  const customer = {
    firstName: clean(input.firstName, 60), lastName: clean(input.lastName, 60), email: clean(input.email, 160).toLowerCase(), phone: clean(input.phone, 40),
    address1: clean(input.address1, 120), address2: clean(input.address2, 120), city: clean(input.city, 80), county: clean(input.county, 80), postcode: clean(input.postcode, 12).toUpperCase(), country: "United Kingdom",
  };
  if (!customer.firstName || !customer.lastName || !emailPattern.test(customer.email) || !customer.phone || !customer.address1 || !customer.city || !postcodePattern.test(customer.postcode)) {
    throw new CheckoutValidationError("Please check your contact details and enter a valid UK delivery address.");
  }
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 20) throw new CheckoutValidationError("Your bag is empty or contains too many items.");

  const items = await Promise.all(body.items.map(async (item) => {
    const productId = clean(item.productId, 100);
    const size = clean(item.size, 30);
    const colour = clean(item.colour, 60);
    const quantity = Number(item.quantity);
    const product = await getProductById(productId);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 10 || !product.sizes.includes(size) || !product.colors.some(option => option.name === colour)) {
      throw new CheckoutValidationError("One of the selected products, colours or UK sizes is no longer available.");
    }
    return { productId: product.id, name: product.name, image: product.image, size, colour, quantity, unitPriceCents: product.priceCents, lineTotalCents: product.priceCents * quantity, preorder: product.availability === "coming_soon" };
  }));
  const subtotalCents = items.reduce((sum, item) => sum + item.lineTotalCents, 0);
  const shippingCents = 0;
  return {
    orderNumber: `NLM-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`,
    customer, items, currency: "GBP" as const, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents,
  };
}
