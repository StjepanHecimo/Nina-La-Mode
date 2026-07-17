"use client";

import { FormEvent, useState } from "react";
import { ArrowIcon } from "./icons";

export function Newsletter() {
  const [sent, setSent] = useState(false);
  function submit(e: FormEvent) { e.preventDefault(); setSent(true); }
  return <section className="newsletter"><div><p className="kicker light">Nina notes</p><h2>Be first to know what is next.</h2></div>{sent ? <p className="success">Thank you. See you in your inbox.</p> : <form onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" placeholder="Your email address" required/><button aria-label="Subscribe"><ArrowIcon /></button></form>}</section>;
}
