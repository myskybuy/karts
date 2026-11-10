"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageLoader from "@/components/PageLoader";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { useCart } from "@/components/CartProvider";

type State = "CHECKING" | "COMPLETED" | "FAILED" | "PENDING" | "ERROR";

const MAX_TRIES = 20; // ~1 minute at 3 s

export default function PhonePeResult({ orderId }: { orderId: number }) {
  const { clearCart, hydrated } = useCart();
  const [state, setState] = useState<State>(orderId ? "CHECKING" : "ERROR");
  const [error, setError] = useState("");

  // Clear the cart only after it has loaded from localStorage, otherwise the saved cart would come back.
  useEffect(() => {
    if (state === "COMPLETED" && hydrated) clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, hydrated]);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let tries = 0;

    async function check() {
      tries += 1;
      try {
        const res = await fetch(`/api/orders/phonepe/status?order=${orderId}`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Could not check payment");
          setState("ERROR");
          return;
        }
        if (data.state === "COMPLETED") {
          setState("COMPLETED");
          return;
        }
        if (data.state === "FAILED") {
          setState("FAILED");
          return;
        }
      } catch {
        // network blip: keep polling
      }
      if (cancelled) return;
      if (tries >= MAX_TRIES) setState("PENDING");
      else setTimeout(check, 3000);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  let body: React.ReactNode;
  if (state === "CHECKING") {
    body = <PageLoader message="Confirming your payment with PhonePe…" />;
  } else if (state === "COMPLETED") {
    body = (
      <>
        <h2 style={{ color: "var(--color-primary)", justifyContent: "center" }}>Your order is successfully completed</h2>
        <p>
          Payment received. Your order id is <strong>{orderId}</strong>. We&apos;ve emailed you a confirmation.
        </p>
        <Link href="/shop" className="btn btn-accent">
          Continue shopping
        </Link>
      </>
    );
  } else if (state === "FAILED") {
    body = (
      <>
        <h2 style={{ justifyContent: "center" }}>Payment failed</h2>
        <p>No money was taken, or it will be refunded automatically by your bank. Your cart is still saved.</p>
        <Link href="/checkout" className="btn btn-accent">
          Try again
        </Link>
      </>
    );
  } else if (state === "PENDING") {
    body = (
      <>
        <h2 style={{ justifyContent: "center" }}>Payment is being processed</h2>
        <p>
          We haven&apos;t received the final status yet for order <strong>{orderId}</strong>. If money was debited, the order will be confirmed
          automatically and you&apos;ll get an email. Please don&apos;t pay again for the same order.
        </p>
        <Link href="/profile" className="btn btn-accent">
          View my orders
        </Link>
      </>
    );
  } else {
    body = (
      <>
        <h2 style={{ justifyContent: "center" }}>Something went wrong</h2>
        <p>{error || "We couldn't find this order."}</p>
        <Link href="/profile" className="btn btn-accent">
          View my orders
        </Link>
      </>
    );
  }

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <div className="cart-page" style={{ textAlign: "center", padding: "40px 0" }}>
        {body}
      </div>
      <SiteFooter />
    </StoreShell>
  );
}
