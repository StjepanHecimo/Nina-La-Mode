"use client";

import { FormEvent, useState } from "react";
import { ArrowIcon } from "./icons";

export function Newsletter() {
  const [sent, setSent] = useState(false);
  function submit(e: FormEvent) { e.preventDefault(); setSent(true); }
  return <section className="newsletter"><div><p className="kicker light">Nina novosti</p><h2>Prva saznaj što stiže.</h2></div>{sent ? <p className="success">Hvala! Vidimo se u inboxu.</p> : <form onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">Email adresa</label><input id="newsletter-email" type="email" placeholder="Tvoja email adresa" required/><button aria-label="Prijavi se"><ArrowIcon /></button></form>}</section>;
}
