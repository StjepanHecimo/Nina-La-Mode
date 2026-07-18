"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const customer = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          paymentMethod: "paypal",
          items: items.map(({ productId, size, colour, quantity }) => ({
            productId,
            size,
            colour,
            quantity,
          })),
        }),
      });
      const data = (await response.json()) as OrderResult & { error?: string };
      if (!response.ok)
        throw new Error(data.error || "We could not create your order.");
      setResult(data);
      clearCart();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We could not create your order.",
      );
    } finally {
      setSubmitting(false);
    }
  }

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
          <p>We have received your order and will send payment and delivery confirmation by email.</p>
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
      <section className="checkout-heading">
        <p className="kicker">Secure checkout</p>
        <h1>Complete your order.</h1>
        <p>UK delivery details and PayPal payment.</p>
      </section>
      <form className="checkout-layout" onSubmit={submit}>
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
            <label className="payment-option">
              <input
                name="paymentMethodDisplay"
                type="radio"
                value="paypal"
                defaultChecked
                required
              />
              <span>
                <strong>PayPal</strong>
                <small>Pay securely with your PayPal account.</small>
              </span>
              <Image
                className="paypal-logo"
                src="/images/paypal.png"
                alt="PayPal"
                width={46}
                height={46}
              />
            </label>
          </fieldset>
          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button checkout-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
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
