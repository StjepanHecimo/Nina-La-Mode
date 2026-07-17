import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Nina La Mode for product, sizing, delivery or order support.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact Nina La Mode", description: "We are here to help with sizing, products and orders.", url: "/contact" },
};

export default function ContactPage() {
  return <main className="page-main"><section className="contact-layout"><div className="contact-copy"><p className="kicker">Here for you</p><h1>Have a question?<br/><em>Let&apos;s talk.</em></h1><p>For questions about our product, sizing, orders or collaborations, send us a message and we will get back to you as soon as possible.</p><div className="contact-details"><div><span>Email</span><a href="mailto:info@ninilamode.com">info@ninilamode.com</a></div><div><span>Opening hours</span><p>Monday — Friday, 9:00 — 17:00</p></div></div></div><ContactForm /></section></main>;
}
