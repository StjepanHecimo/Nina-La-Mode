export type Product = {
  id: string;
  name: string;
  category: "Haljine" | "Bluze" | "Hlače";
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
};

export const products: Product[] = [
  {
    id: "classic-tall-trousers",
    name: "Classic Tall Hlače",
    category: "Hlače",
    priceCents: 4000,
    image: "/images/classic-tall-trousers.png",
    images: [
      "/images/classic-tall-trousers.png",
      "/images/classic-1.jpeg",
      "/images/classic2.jpeg",
      "/images/classic-3.jpeg",
    ],
    color: "Zelena",
    colors: [{ name: "Zelena", hex: "#173f48" }],
    material: "100% pamuk",
    sizes: ["UK 12", "UK 14", "UK 16", "UK 18", "UK 20"],
    inseam: "88 cm",
    fit: "Klasičan visoki struk i široke nogavice",
    description:
      "Klasične hlače visokog struka, posebno dizajnirane za visoke žene. Izrađene su od 100% pamuka pa su udobne, prozračne i prikladne za sva godišnja doba. Bezvremenska široka silueta lako se prilagođava svakodnevnim, poslovnim i posebnim prilikama.",
    isNew: true,
  },
];

export const formatPrice = (priceCents: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(priceCents / 100);
