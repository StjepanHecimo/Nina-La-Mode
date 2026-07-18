"use client";

import { useState, type FormEvent } from "react";
import { ArrowIcon } from "./icons";

export function Newsletter() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "We could not complete your subscription.");
      form.reset();
      setStatus("sent");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not complete your subscription.");
      setStatus("idle");
    }
  }

  return <section className="newsletter"><div><p className="kicker light">Nini notes</p><h2>Be the first to know what is happening.</h2>{error && <p className="newsletter-error" role="alert">{error}</p>}</div>{status === "sent" ? <p className="success">Thank you. Check your inbox.</p> : <div className="newsletter-signup"><form onSubmit={submit}><div className="form-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div><div className="newsletter-email-row"><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="Your email address" required/><button aria-label="Subscribe" disabled={status === "sending"}>{status === "sending" ? "…" : <ArrowIcon />}</button></div><label className="newsletter-consent"><input name="consent" type="checkbox" value="yes" required/><span>I agree to receive Nini La Mode news and product updates by email. I can unsubscribe at any time.</span></label></form></div>}</section>;
}
