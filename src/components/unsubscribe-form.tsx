"use client";

import { useState } from "react";
import Link from "next/link";

export function UnsubscribeForm({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function unsubscribe() {
    setState("sending");
    const response = await fetch("/api/newsletter/unsubscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setState(response.ok ? "done" : "error");
  }

  if (state === "done") return <><p>Your email has been removed from Nini La Mode updates.</p><Link className="button" href="/">Return home</Link></>;
  return <><p>{state === "error" ? "We could not complete your request. Please try again." : "Confirm that you no longer wish to receive Nini La Mode news and product updates."}</p><button className="button" type="button" onClick={unsubscribe} disabled={state === "sending"}>{state === "sending" ? "Unsubscribing…" : "Unsubscribe"}</button></>;
}
