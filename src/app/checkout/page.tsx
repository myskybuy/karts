"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import AuthModal from "@/components/AuthModal";
import PageLoader from "@/components/PageLoader";
import ProductImage from "@/components/ProductImage";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { useCart } from "@/components/CartProvider";
import { INDIA_STATES, DeliveryAddress, matchState, validateDeliveryAddress } from "@/lib/india-states";
import { COMPANY } from "@/lib/policies";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: () => void) => void };
  }
}

type User = { id: number; name: string; email: string; phone?: string };

type SavedAddress = {
  isDefault: boolean;
  fullName?: string;
  phone?: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
};

const EMPTY_ADDRESS: DeliveryAddress = { house: "", area: "", landmark: "", city: "", state: "", pincode: "" };

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addr, setAddr] = useState<DeliveryAddress>(EMPTY_ADDRESS);
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [successId, setSuccessId] = useState<number | null>(null);
  const [placing, setPlacing] = useState(false);
  const razorpayEnabled = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">(razorpayEnabled ? "RAZORPAY" : "COD");

  function setField(field: keyof DeliveryAddress, value: string) {
    setAddr((prev) => ({ ...prev, [field]: value }));
  }

  async function loadUser(u: User) {
    setUser(u);
    setName(u.name || "");
    setEmail(u.email || "");
    if (u.phone) setPhone(u.phone);
    const addrs: SavedAddress[] = await fetch("/api/account/addresses").then((r) => r.json());
    if (Array.isArray(addrs) && addrs.length) {
      const def = addrs.find((a) => a.isDefault) || addrs[0];
      if (!u.phone && def.phone) setPhone(def.phone);
      setAddr({
        house: def.line1 || "",
        area: "",
        landmark: "",
        city: def.city || "",
        state: matchState(def.state),
        pincode: def.pincode || "",
      });
    }
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (d) => {
        if (d.user) await loadUser(d.user);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const subtotal = cartTotal;
  const total = Math.max(0, subtotal - discount);
  const showAuthModal = authChecked && !user;

  async function applyCoupon() {
    setCouponMsg("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon, orderTotal: subtotal }),
    });
    const data = await res.json();
    if (data.success) {
      setDiscount(data.discount);
      setAppliedCode(data.code);
      setCouponMsg(`Coupon applied: -₹${data.discount}`);
    } else {
      setDiscount(0);
      setAppliedCode("");
      setCouponMsg(data.error || "Invalid coupon");
    }
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!user || placing) return;
    if (!cart.length) {
      toast.error("Cart is empty");
      return;
    }
    if (!name.trim() || !phone.trim() || !email.trim()) {
      toast.error("Please fill all required contact details");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10))) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    const addrError = validateDeliveryAddress(addr);
    if (addrError) {
      toast.error(addrError);
      return;
    }
    if (paymentMethod === "RAZORPAY" && !razorpayEnabled) {
      toast.error("Online payment is currently unavailable. Please choose Cash on Delivery.");
      return;
    }

    setPlacing(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart,
        customerName: name,
        phone,
        email,
        deliveryAddress: addr,
        couponCode: appliedCode,
        discount,
        paymentMethod,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPlacing(false);
      toast.error(data.error || "Order failed");
      return;
    }

    if (paymentMethod === "RAZORPAY" && data.razorpayOrderId && data.key) {
      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount * 100,
        currency: "INR",
        name: COMPANY.name,
        description: `${COMPANY.brand} order #${data.orderId}`,
        order_id: data.razorpayOrderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verify = await fetch("/api/orders", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verify.json();
          setPlacing(false);
          if (verify.ok) {
            clearCart();
            setSuccessId(verifyData.orderId);
          } else {
            toast.error(verifyData.error || "Payment verification failed");
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
        prefill: { name, email, contact: `+91${phone.replace(/\D/g, "").slice(-10)}` },
        notes: { merchant: COMPANY.name },
        theme: { color: "#0b40e0" },
      });
      rzp.open();
      return;
    }

    setPlacing(false);
    clearCart();
    setSuccessId(data.orderId);
  }

  if (successId) {
    return (
      <StoreShell>
        <SiteHeader showSearch={false} />
        <div className="cart-page" style={{ textAlign: "center", padding: "40px 0" }}>
          <h2 style={{ color: "var(--color-primary)", justifyContent: "center" }}>Your order is successfully completed</h2>
          <p>
            Your order id is <strong>{successId}</strong>. We&apos;ve emailed you a confirmation.
          </p>
          <Link href="/shop" className="btn btn-accent">
            Continue shopping
          </Link>
        </div>
        <SiteFooter />
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <SiteHeader showSearch={false} />
      <AuthModal
        open={showAuthModal}
        title="Login to checkout"
        message="You must be logged in before placing an order. Sign in or create an account below."
        onSuccess={loadUser}
      />

      <div className={`cart-page ${showAuthModal ? "checkout-locked" : ""}`}>
        <h2>Checkout</h2>

        {!cart.length ? (
          <p>
            Cart empty. <Link href="/shop">Shop now →</Link>
          </p>
        ) : user ? (
          <form className="cart-layout checkout-layout" onSubmit={placeOrder} noValidate>
            <div className="checkout-main">
              <section className="checkout-section">
                <h3>
                  <span className="checkout-step">1</span> Contact details
                </h3>
                <div className="checkout-grid">
                  <div className="form-group">
                    <label>
                      Full name <span className="req">*</span>
                    </label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required autoComplete="name" />
                  </div>
                  <div className="form-group">
                    <label>
                      Mobile number <span className="req">*</span>
                    </label>
                    <input type="tel" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile number" required autoComplete="tel-national" />
                  </div>
                  <div className="form-group checkout-span-2">
                    <label>
                      Email <span className="req">*</span>
                    </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Order confirmation will be sent here" required autoComplete="email" />
                  </div>
                </div>
              </section>

              <section className="checkout-section">
                <h3>
                  <span className="checkout-step">2</span> Delivery address
                </h3>
                <div className="checkout-grid">
                  <div className="form-group checkout-span-2">
                    <label>
                      House / Flat / Building <span className="req">*</span>
                    </label>
                    <input type="text" value={addr.house} onChange={(e) => setField("house", e.target.value)} placeholder="e.g. Flat 12B, Sunrise Apartments" required autoComplete="address-line1" />
                  </div>
                  <div className="form-group checkout-span-2">
                    <label>
                      Area / Street / Locality <span className="req">*</span>
                    </label>
                    <input type="text" value={addr.area} onChange={(e) => setField("area", e.target.value)} placeholder="e.g. MG Road, Sector 14" required autoComplete="address-line2" />
                  </div>
                  <div className="form-group checkout-span-2">
                    <label>Landmark (optional)</label>
                    <input type="text" value={addr.landmark} onChange={(e) => setField("landmark", e.target.value)} placeholder="e.g. Near City Mall" />
                  </div>
                  <div className="form-group">
                    <label>
                      City / District <span className="req">*</span>
                    </label>
                    <input type="text" value={addr.city} onChange={(e) => setField("city", e.target.value)} placeholder="City" required autoComplete="address-level2" />
                  </div>
                  <div className="form-group">
                    <label>
                      Pincode <span className="req">*</span>
                    </label>
                    <input type="text" inputMode="numeric" maxLength={6} value={addr.pincode} onChange={(e) => setField("pincode", e.target.value.replace(/\D/g, ""))} placeholder="6-digit pincode" required autoComplete="postal-code" />
                  </div>
                  <div className="form-group checkout-span-2">
                    <label>
                      State <span className="req">*</span>
                    </label>
                    <select value={addr.state} onChange={(e) => setField("state", e.target.value)} required autoComplete="address-level1">
                      <option value="">Select state</option>
                      {INDIA_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className="checkout-section">
                <h3>
                  <span className="checkout-step">3</span> Payment method
                </h3>
                <div className="payment-options">
                  <label className={`payment-option ${paymentMethod === "RAZORPAY" ? "active" : ""} ${razorpayEnabled ? "" : "disabled"}`}>
                    <input type="radio" name="pay" checked={paymentMethod === "RAZORPAY"} disabled={!razorpayEnabled} onChange={() => setPaymentMethod("RAZORPAY")} />
                    <span>
                      <strong>Pay Online</strong>
                      <small>
                        {razorpayEnabled
                          ? "UPI, Debit / Credit Card, Netbanking & Wallets — secured by Razorpay"
                          : "UPI, Cards, Netbanking & Wallets — currently unavailable"}
                      </small>
                    </span>
                  </label>
                  <label className={`payment-option ${paymentMethod === "COD" ? "active" : ""}`}>
                    <input type="radio" name="pay" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                    <span>
                      <strong>Cash on Delivery</strong>
                      <small>Pay in cash when your order arrives</small>
                    </span>
                  </label>
                </div>
                <p className="checkout-legal">
                  Payments are collected by <strong>{COMPANY.name}</strong>, the company operating {COMPANY.brand}.
                </p>
              </section>
            </div>

            <aside className="cart-summary-card">
              <h3>Order summary</h3>
              <ul className="checkout-items">
                {cart.map((item) => (
                  <li key={item.id}>
                    <ProductImage src={item.image} alt={item.name} />
                    <span className="checkout-item-info">
                      <span className="checkout-item-name">{item.name}</span>
                      <small>Qty {item.qty}</small>
                    </span>
                    <span>{inr(item.salePrice * item.qty)}</span>
                  </li>
                ))}
              </ul>

              <label className="checkout-coupon-label">Have a coupon code?</label>
              <div className="checkout-coupon">
                <input type="text" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Enter coupon code" />
                <button type="button" className="btn btn-outline" onClick={applyCoupon}>
                  Apply
                </button>
              </div>
              {couponMsg ? <p className="checkout-coupon-msg">{couponMsg}</p> : null}

              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>{inr(subtotal)}</span>
              </div>
              {discount > 0 ? (
                <div className="cart-summary-row" style={{ color: "var(--color-sale)" }}>
                  <span>Coupon discount</span>
                  <span>-{inr(discount)}</span>
                </div>
              ) : null}
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>{inr(total)}</span>
              </div>
              <button type="submit" className="btn btn-accent cart-checkout-btn" disabled={placing}>
                {placing ? "Processing…" : paymentMethod === "RAZORPAY" ? `Pay ${inr(total)}` : "Place order (Cash on Delivery)"}
              </button>
              <p className="checkout-terms">
                By placing this order you agree to our <Link href="/terms-of-use">Terms</Link>,{" "}
                <Link href="/refund-policy">Refund</Link> and <Link href="/privacy-policy">Privacy</Link> policies.
              </p>
            </aside>
          </form>
        ) : authChecked ? (
          <p style={{ color: "var(--color-muted)" }}>Complete login in the popup above to continue checkout.</p>
        ) : (
          <PageLoader message="Loading checkout…" />
        )}
      </div>
      <SiteFooter />
    </StoreShell>
  );
}
