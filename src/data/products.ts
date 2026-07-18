export type Product = {
  id: string;
  name: string;
  category: "Dresses" | "Blouses" | "Trousers";
  priceCents: number;
  image: string;
  images: string[];
  color: string;
  colors: { name: string; hex: string }[];
  material: string;
  description: string;
  sizes: string[];
  inseam?: string;
  fit?: string;
  isNew?: boolean;
  availability?: "available" | "coming_soon";
};

export const products: Product[] = [
  {
    id: "classic-tall-trousers",
    name: "Classic Tall Trousers",
    category: "Trousers",
    priceCents: 4000,
    image: "/images/classic-tall-trousers.png",
    images: [
      "/images/classic-tall-trousers.png",
      "/images/classic-1.jpeg",
      "/images/classic2.jpeg",
      "/images/classic-3.jpeg",
    ],
    color: "Deep Green",
    colors: [{ name: "Deep Green", hex: "#173f48" }],
    material: "100% cotton",
    sizes: ["UK 12", "UK 14", "UK 16", "UK 18", "UK 20"],
    inseam: "88 cm",
    fit: "Classic high waist with a wide-leg silhouette",
    description:
      "Classic high-waisted trousers designed especially for tall women. Made from 100% cotton, they are comfortable, breathable and ideal for every season. Their timeless wide-leg silhouette is easy to dress up or down for everyday wear, work or special occasions.",
    isNew: true,
  },
];

export const formatPrice = (priceCents: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(priceCents / 100);
