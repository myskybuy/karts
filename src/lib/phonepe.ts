import crypto from "crypto";

// PhonePe Payment Gateway — Standard Checkout (API v2, OAuth).
// Env: PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, PHONEPE_CLIENT_VERSION, PHONEPE_ENV ("SANDBOX" | "PRODUCTION").
// Optional webhook auth: PHONEPE_WEBHOOK_USERNAME, PHONEPE_WEBHOOK_PASSWORD (same values set in the PhonePe dashboard).

const isProduction = () => (process.env.PHONEPE_ENV || "SANDBOX").toUpperCase() === "PRODUCTION";

const urls = () =>
  isProduction()
    ? {
        token: "https://api.phonepe.com/apis/identity-manager/v1/oauth/token",
        pg: "https://api.phonepe.com/apis/pg",
      }
    : {
        token: "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token",
        pg: "https://api-preprod.phonepe.com/apis/pg-sandbox",
      };

export function isPhonePeConfigured() {
  return !!(process.env.PHONEPE_CLIENT_ID && process.env.PHONEPE_CLIENT_SECRET && process.env.PHONEPE_CLIENT_VERSION);
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt - 60 > now) return cachedToken.token;

  const res = await fetch(urls().token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.PHONEPE_CLIENT_ID || "",
      client_version: process.env.PHONEPE_CLIENT_VERSION || "",
      client_secret: process.env.PHONEPE_CLIENT_SECRET || "",
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PhonePe token failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_at?: number };
  cachedToken = { token: data.access_token, expiresAt: data.expires_at || now + 600 };
  return data.access_token;
}

/** Starts a PhonePe checkout. Amount is in rupees. Returns the PhonePe page URL to send the customer to. */
export async function createPhonePePayment(opts: { merchantOrderId: string; amountRupees: number; redirectUrl: string; orderId: number }) {
  const token = await getAccessToken();
  const res = await fetch(`${urls().pg}/checkout/v2/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `O-Bearer ${token}` },
    body: JSON.stringify({
      merchantOrderId: opts.merchantOrderId,
      amount: Math.round(opts.amountRupees * 100),
      expireAfter: 1200,
      metaInfo: { udf1: String(opts.orderId) },
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: `Karts order #${opts.orderId}`,
        merchantUrls: { redirectUrl: opts.redirectUrl },
      },
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PhonePe pay failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { orderId: string; state: string; redirectUrl: string };
  if (!data.redirectUrl) throw new Error("PhonePe pay returned no redirectUrl: " + JSON.stringify(data));
  return data;
}

export type PhonePeStatus = {
  orderId: string;
  state: "PENDING" | "FAILED" | "COMPLETED";
  amount: number; // paise
  paymentDetails?: { transactionId: string; paymentMode: string; state: string }[];
};

/** Asks PhonePe for the real status of an order. Always trust this, never the browser redirect. */
export async function getPhonePeStatus(merchantOrderId: string) {
  const token = await getAccessToken();
  const res = await fetch(`${urls().pg}/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status?details=false`, {
    headers: { "Content-Type": "application/json", Authorization: `O-Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PhonePe status failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as PhonePeStatus;
}

/** PhonePe sends Authorization: SHA256(username:password) on webhooks. */
export function verifyPhonePeWebhookAuth(header: string | null) {
  const user = process.env.PHONEPE_WEBHOOK_USERNAME;
  const pass = process.env.PHONEPE_WEBHOOK_PASSWORD;
  if (!user || !pass || !header) return false;
  const expected = crypto.createHash("sha256").update(`${user}:${pass}`).digest("hex");
  const got = header.replace(/^SHA256\s*/i, "").trim().toLowerCase();
  const a = Buffer.from(expected);
  const b = Buffer.from(got);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
