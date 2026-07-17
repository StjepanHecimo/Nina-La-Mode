import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Kontakt", description: "Javi se Nina La Mode timu." };

export default function ContactPage() {
  return <main className="page-main"><section className="contact-layout"><div className="contact-copy"><p className="kicker">Tu smo za tebe</p><h1>Imaš pitanje?<br/><em>Javi nam se.</em></h1><p>Za pitanja o proizvodima, veličinama, narudžbi ili suradnji — odgovorit ćemo ti u najkraćem roku.</p><div className="contact-details"><div><span>Email</span><a href="mailto:info@ninalamode.hr">info@ninalamode.hr</a></div><div><span>Radno vrijeme</span><p>Pon — Pet, 09:00 — 17:00</p></div></div></div><ContactForm /></section></main>;
}
