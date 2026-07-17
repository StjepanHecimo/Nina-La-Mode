"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  function submit(e: FormEvent) { e.preventDefault(); setSent(true); }
  if (sent) return <div className="contact-form form-success"><span>✓</span><h2>Poruka je spremna.</h2><p>Forma je trenutačno u UI načinu rada. Povezat ćemo je s Brevo SMTP servisom u sljedećem koraku.</p><button className="button" onClick={() => setSent(false)}>Pošalji novu poruku</button></div>;
  return <form className="contact-form" onSubmit={submit}><div className="field-row"><label>Ime i prezime<input name="name" required placeholder="Tvoje ime"/></label><label>Email adresa<input name="email" type="email" required placeholder="ime@email.com"/></label></div><label>Tema<select name="subject" defaultValue=""><option value="" disabled>Odaberi temu</option><option>Proizvod i veličina</option><option>Narudžba i dostava</option><option>Povrat i zamjena</option><option>Suradnja</option></select></label><label>Poruka<textarea name="message" required rows={6} placeholder="Kako ti možemo pomoći?"/></label><button className="button" type="submit">Pošalji poruku</button></form>;
}
