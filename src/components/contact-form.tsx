"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  function submit(e: FormEvent) { e.preventDefault(); setSent(true); }
  if (sent) return <div className="contact-form form-success"><span>✓</span><h2>Your message is ready.</h2><p>The form is currently in UI preview mode. We will connect it to Brevo SMTP in the next implementation step.</p><button className="button" onClick={() => setSent(false)}>Send another message</button></div>;
  return <form className="contact-form" onSubmit={submit}><div className="field-row"><label>Full name<input name="name" autoComplete="name" required placeholder="Your name"/></label><label>Email address<input name="email" type="email" autoComplete="email" required placeholder="name@email.com"/></label></div><label>Subject<select name="subject" defaultValue=""><option value="" disabled>Select a subject</option><option>Product and sizing</option><option>Order and delivery</option><option>Returns and exchanges</option><option>Collaboration</option></select></label><label>Message<textarea name="message" required rows={6} placeholder="How can we help?"/></label><button className="button" type="submit">Send message</button></form>;
}
