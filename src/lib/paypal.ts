import "server-only";

const environment = () => process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
const baseUrl = () => environment() === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

function credentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PAYPAL_NOT_CONFIGURED");
  return { clientId, secret };
}

async function accessToken() {
  const { clientId, secret } = credentials();
  const response = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: { authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`PAYPAL_AUTH_ERROR:${response.status}:${(await response.text()).slice(0, 500)}`);
  return (await response.json() as { access_token: string }).access_token;
}

export async function paypalRequest<T>(path: string, options: RequestInit = {}) {
  const token = await accessToken();
  const response = await fetch(`${baseUrl()}${path}`, {
    ...options,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", accept: "application/json", ...options.headers },
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`PAYPAL_API_ERROR:${response.status}:${text.slice(0, 1000)}`);
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function createPaypalOrder(order: Awaited<ReturnType<typeof import("@/lib/checkout-order").buildCheckoutOrder>>) {
  const money = (cents: number) => (cents / 100).toFixed(2);
  return paypalRequest<{ id: string; status: string }>("/v2/checkout/orders", {
    method: "POST",
    headers: { "PayPal-Request-Id": `create-${order.orderNumber}`, Prefer: "return=representation" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: order.orderNumber,
        custom_id: order.orderNumber,
        invoice_id: order.orderNumber,
        description: "Nini La Mode order",
        amount: { currency_code: "GBP", value: money(order.totalCents), breakdown: { item_total: { currency_code: "GBP", value: money(order.subtotalCents) }, shipping: { currency_code: "GBP", value: money(order.shippingCents) } } },
        items: order.items.map(item => ({ name: item.name.slice(0, 127), sku: item.productId.slice(0, 127), description: `${item.preorder ? "Pre-order · " : ""}${item.colour} · ${item.size}`.slice(0, 127), quantity: String(item.quantity), unit_amount: { currency_code: "GBP", value: money(item.unitPriceCents) }, category: "PHYSICAL_GOODS" })),
        shipping: { name: { full_name: `${order.customer.firstName} ${order.customer.lastName}` }, address: { address_line_1: order.customer.address1, ...(order.customer.address2 ? { address_line_2: order.customer.address2 } : {}), admin_area_2: order.customer.city, ...(order.customer.county ? { admin_area_1: order.customer.county } : {}), postal_code: order.customer.postcode, country_code: "GB" } },
      }],
      application_context: { brand_name: "Nini La Mode", locale: "en-GB", shipping_preference: "SET_PROVIDED_ADDRESS", user_action: "PAY_NOW" },
    }),
  });
}

export const capturePaypalOrder = (orderId: string) => paypalRequest<PaypalCaptureResponse>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, { method: "POST", headers: { "PayPal-Request-Id": `capture-${orderId}`, Prefer: "return=representation" }, body: "{}" });

export type PaypalCaptureResponse = { id: string; status: string; payer?: { email_address?: string }; purchase_units?: Array<{ reference_id?: string; payments?: { captures?: Array<{ id: string; status: string; amount?: { currency_code?: string; value?: string } }> } }> };

export async function verifyPaypalWebhook(headers: Headers, event: unknown) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new Error("PAYPAL_WEBHOOK_ID_NOT_CONFIGURED");
  const result = await paypalRequest<{ verification_status: string }>("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({
      transmission_id: headers.get("paypal-transmission-id"), transmission_time: headers.get("paypal-transmission-time"), cert_url: headers.get("paypal-cert-url"), auth_algo: headers.get("paypal-auth-algo"), transmission_sig: headers.get("paypal-transmission-sig"), webhook_id: webhookId, webhook_event: event,
    }),
  });
  return result.verification_status === "SUCCESS";
}
