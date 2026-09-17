"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthModal from "@/components/AuthModal";
import PageLoader from "@/components/PageLoader";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { useCart } from "@/components/CartProvider";

type User = { id: number; name: string; email: string };

function formatInr(n: number) {
  return n.toLocaleString("en-IN");
}

export default function CartPage() {
  const { cart, removeFromCart, updateQty, cartTotal, hydrated } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  function goCheckout(e: React.MouseEvent) {
    if (!user) {
      e.preventDefault();
      setShowAuth(true);
    }
  }

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <AuthModal
        open={showAuth}
        title="Login to checkout"
        message="Please log in or sign up before proceeding to checkout."
        onClose={() => setShowAuth(false)}
        onSuccess={(u) => {
          setUser(u);
          setShowAuth(false);
          window.location.href = "/checkout";
        }}
      />
      {!hydrated ? (
        <PageLoader message="Loading your cart…" />
      ) : (
        <div className="cart-page">
          <h2>My Cart {cart.length ? <span className="cart-count-label">({cart.length} item{cart.length === 1 ? "" : "s"})</span> : null}</h2>
          {!cart.length ? (
            <div className="cart-empty">
              <p>Your cart is empty.</p>
              <Link href="/shop" className="btn btn-accent">
                Continue shopping
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <Link href={`/product/${item.id}`} className="cart-item-thumb">
                      <img src={item.image} alt={item.name} />
                    </Link>
                    <div className="cart-item-info">
                      <Link href={`/product/${item.id}`} className="cart-item-name">
                        {item.name}
                      </Link>
                      <div className="cart-item-price">₹{formatInr(item.salePrice)}</div>
                      <div className="qty-controls">
                        <button type="button" onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Decrease quantity">
                          -
                        </button>
                        <span>{item.qty}</span>
                        <button type="button" onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Increase quantity">
                          +
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-side">
                      <div className="cart-item-line">₹{formatInr(item.salePrice * item.qty)}</div>
                      <button type="button" className="remove-btn" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <aside className="cart-summary-card">
                <h3>Price details</h3>
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>₹{formatInr(cartTotal)}</span>
                </div>
                <div className="cart-summary-row cart-summary-total">
                  <span>Total</span>
                  <span>₹{formatInr(cartTotal)}</span>
                </div>
                <Link href="/checkout" className="btn btn-accent cart-checkout-btn" onClick={goCheckout}>
                  Proceed to checkout
                </Link>
              </aside>
            </div>
          )}
        </div>
      )}
      <SiteFooter />
    </StoreShell>
  );
}
