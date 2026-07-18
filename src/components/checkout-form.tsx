"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/data/products";

type OrderResult = {
  orderNumber: string;
  emailSent: boolean;
  paymentStatus: string;
};

export function CheckoutForm() {
  const { items, subtotalCents, hydrated, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<OrderResult | null>(null);
  const [paypalReady, setPaypalReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const paypalRendered = useRef(false);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("Complete the payment using the PayPal button below.");
  }

  useEffect(() => {
    if (!paypalReady || paypalRendered.current || !window.paypal || !formRef.current || !items.length) return;
    paypalRendered.current = true;
    window.paypal.Buttons({
      style: { layout: "vertical", shape: "rect", label: "paypal" },
      createOrder: async () => {
        const form = formRef.current;
        if (!form || !form.reportValidity()) throw new Error("Please complete your contact and delivery details.");
        setSubmitting(true);
        setError("");
        const values = new FormData(form);
        const customer = Object.fromEntries(values.entries());
        const response = await fetch("/api/paypal/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer, items: items.map(({ productId, size, colour, quantity }) => ({ productId, size, colour, quantity })) }) });
        const data = await response.json() as { id?: string; error?: string };
        if (!response.ok || !data.id) { setSubmitting(false); throw new Error(data.error || "PayPal could not start the payment."); }
        return data.id;
      },
      onApprove: async (data) => {
        const response = await fetch(`/api/paypal/orders/${encodeURIComponent(data.orderID)}/capture`, { method: "POST" });
        const capture = await response.json() as OrderResult & { error?: string };
        if (!response.ok) throw new Error(capture.error || "PayPal could not complete the payment.");
        setResult(capture);
        clearCart();
        setSubmitting(false);
      },
      onCancel: () => { setSubmitting(false); setError("PayPal payment was cancelled. Your order has not been charged."); },
      onError: (caught) => { console.error("PayPal checkout failed", caught); setSubmitting(false); setError(caught instanceof Error ? caught.message : "PayPal could not complete the payment. Please try again."); },
    }).render("#paypal-button-container").catch(caught => { paypalRendered.current = false; setError(caught instanceof Error ? caught.message : "PayPal could not load."); });
  }, [paypalReady, items, clearCart]);

  if (!hydrated)
    return (
      <main className="checkout-page">
        <div className="checkout-empty">Loading checkout…</div>
      </main>
    );
  if (result)
    return (
      <main className="checkout-page">
        <section className="order-confirmation">
          <span>✓</span>
          <p className="kicker">Order received</p>
          <h1>Thank you.</h1>
          <p>
            Your order reference is <strong>{result.orderNumber}</strong>.
          </p>
          <p>Your payment is complete. We have emailed your order confirmation and receipt.</p>
          <Link className="button" href="/shop">
            Return to shop
          </Link>
        </section>
      </main>
    );
  if (!items.length)
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <p className="kicker">Checkout</p>
          <h1>Your bag is empty.</h1>
          <Link className="button" href="/shop">
            Return to shop
          </Link>
        </div>
      </main>
    );

  return (
    <main className="checkout-page">
      {clientId && <Script src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=GBP&intent=capture&components=buttons`} strategy="afterInteractive" onLoad={() => setPaypalReady(true)} onError={() => setError("PayPal could not load. Please refresh the page.")} />}
      <section className="checkout-heading">
        <p className="kicker">Secure checkout</p>
        <h1>Complete your order.</h1>
        <p>UK delivery details and PayPal payment.</p>
      </section>
      <form ref={formRef} className="checkout-layout" onSubmit={submit}>
        <div className="checkout-fields">
          <fieldset>
            <legend>Contact</legend>
            <div className="field-row">
              <label>
                First name
                <input name="firstName" autoComplete="given-name" required />
              </label>
              <label>
                Last name
                <input name="lastName" autoComplete="family-name" required />
              </label>
            </div>
            <label>
              Email address
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Phone number
              <input name="phone" type="tel" autoComplete="tel" required />
            </label>
          </fieldset>
          <fieldset>
            <legend>UK delivery address</legend>
            <label>
              Address line 1
              <input name="address1" autoComplete="address-line1" required />
            </label>
            <label>
              Address line 2 <small>(optional)</small>
              <input name="address2" autoComplete="address-line2" />
            </label>
            <div className="field-row">
              <label>
                Town or city
                <input name="city" autoComplete="address-level2" required />
              </label>
              <label>
                County <small>(optional)</small>
                <input name="county" autoComplete="address-level1" />
              </label>
            </div>
            <label>
              Postcode
              <input name="postcode" autoComplete="postal-code" required />
            </label>
            <input type="hidden" name="country" value="United Kingdom" />
          </fieldset>
          <fieldset>
            <legend>Payment</legend>
            <div className="paypal-payment-panel">
              <p>Choose PayPal or an available debit or credit card option below.</p>
              {!clientId ? <p className="checkout-error">PayPal is not configured.</p> : <div className={submitting ? "paypal-buttons is-busy" : "paypal-buttons"}><div id="paypal-button-container" /></div>}
              <small>Payments are securely processed by PayPal. Nini La Mode never stores your card details.</small>
            </div>
          </fieldset>
          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <aside className="checkout-summary">
          <p className="kicker">Your order</p>
          {items.map((item) => (
            <div
              className="checkout-summary-item"
              key={`${item.productId}-${item.size}-${item.colour}`}
            >
              <div>
                <Image src={item.image} alt="" width={70} height={90} />
                <span>{item.quantity}</span>
              </div>
              <p>
                <strong>{item.name}</strong>
                <small>
                  {item.colour} · {item.size}
                </small>
              </p>
              <strong>{formatPrice(item.priceCents * item.quantity)}</strong>
            </div>
          ))}
          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(subtotalCents)}</strong>
          </div>
        </aside>
      </form>
    </main>
  );
}
