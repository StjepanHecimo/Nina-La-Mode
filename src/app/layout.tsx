import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nina La Mode",
    template: "%s | Nina La Mode",
  },
  description: "Nina La Mode — bezvremenski krojevi i pažljivo odabrana ženska odjeća.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="hr">
      <body><Header />{children}<Footer /></body>
    </html>
  );
}
