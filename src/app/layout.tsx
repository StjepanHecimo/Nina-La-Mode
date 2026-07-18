import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { CartProvider } from "@/components/cart-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ninilamode.com"),
  title: {
    default: "Tall Women's Trousers | Nini La Mode",
    template: "%s | Nini La Mode",
  },
  description: "Premium high-waisted, wide-leg trousers designed specifically for tall women. Shop UK sizes 12–20 with an 88 cm inseam in breathable 100% cotton.",
  applicationName: "Nini La Mode",
  keywords: ["tall women's trousers", "long leg trousers women", "high waisted trousers tall women", "wide leg trousers UK", "88 cm inseam trousers", "tall fashion UK", "cotton trousers women"],
  authors: [{ name: "Nini La Mode", url: "https://www.ninilamode.com" }],
  creator: "Nini La Mode",
  publisher: "Nini La Mode",
  alternates: { canonical: "/", languages: { "en-GB": "/" } },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: "Nini La Mode",
    title: "Tall Women's Trousers | Nini La Mode",
    description: "Classic high-waisted, wide-leg trousers made for tall women in UK sizes 12–20.",
    images: [{ url: "/images/hero-tall-trousers.png", width: 1535, height: 1025, alt: "Nini La Mode Classic Tall trousers" }],
  },
  twitter: { card: "summary_large_image", title: "Tall Women's Trousers | Nini La Mode", description: "High-waisted, wide-leg cotton trousers designed for tall women.", images: ["/images/hero-tall-trousers.png"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-GB">
      <body><CartProvider><Header />{children}<Footer /></CartProvider></body>
    </html>
  );
}
