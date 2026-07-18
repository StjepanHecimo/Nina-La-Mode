"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "We could not send your message.");
      form.reset();
      setStatus("sent");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not send your message.");
      setStatus("idle");
    }
  }

  if (status === "sent") return <div className="contact-form form-success"><span>✓</span><h2>Your message has been sent.</h2><p>A confirmation is on its way to your inbox. Nini La Mode will get back to you as soon as possible.</p><button className="button" onClick={() => setStatus("idle")}>Send another message</button></div>;

  return <form className="contact-form" onSubmit={submit}>
    <div className="form-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="field-row"><label>Full name<input name="name" autoComplete="name" required placeholder="Your name"/></label><label>Email address<input name="email" type="email" autoComplete="email" required placeholder="name@email.com"/></label></div>
    <label>Subject<select name="subject" defaultValue="" required><option value="" disabled>Select a subject</option><option>Product and sizing</option><option>Order and delivery</option><option>Returns and exchanges</option><option>Collaboration</option></select></label>
    <label>Message<textarea name="message" required minLength={10} maxLength={3000} rows={6} placeholder="How can we help?"/></label>
    {error && <p className="checkout-error" role="alert">{error}</p>}
    <button className="button" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send message"}</button>
  </form>;
}

