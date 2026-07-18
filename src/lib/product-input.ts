import type { Product } from "@/data/products";

export function parseProductInput(value: unknown): Product | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const id = typeof input.id === "string" ? input.id.trim() : "";
  const name = typeof input.name === "string" ? input.name.trim().slice(0, 120) : "";
  const category = input.category;
  const priceCents = Number(input.priceCents);
  const image = typeof input.image === "string" ? input.image.trim() : "";
  const images = Array.isArray(input.images) ? input.images.filter((item): item is string => typeof item === "string").slice(0, 12) : [];
  const color = typeof input.color === "string" ? input.color.trim().slice(0, 60) : "";
  const colors = Array.isArray(input.colors) ? input.colors.filter((item): item is { name: string; hex: string } => Boolean(item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string" && typeof (item as { hex?: unknown }).hex === "string")).slice(0, 12) : [];
  const material = typeof input.material === "string" ? input.material.trim().slice(0, 120) : "";
  const description = typeof input.description === "string" ? input.description.trim().slice(0, 2000) : "";
  const sizes = Array.isArray(input.sizes) ? input.sizes.filter((item): item is string => typeof item === "string").slice(0, 20) : [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !name || !["Dresses", "Blouses", "Trousers", "Outdoor"].includes(String(category)) || !Number.isInteger(priceCents) || priceCents < 1 || !image || !images.length || !color || !colors.length || !material || description.length < 20 || !sizes.length) return null;
  return { id, name, category: category as Product["category"], priceCents, image, images, color, colors, material, description, sizes, inseam: typeof input.inseam === "string" ? input.inseam.trim().slice(0, 60) : undefined, fit: typeof input.fit === "string" ? input.fit.trim().slice(0, 160) : undefined, isNew: input.isNew !== false, availability: input.availability === "coming_soon" ? "coming_soon" : "available" };
}
