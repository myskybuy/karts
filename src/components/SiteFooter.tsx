"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { COMPANY } from "@/lib/policies";
import SiteLogo from "./SiteLogo";

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function onSubscribe(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  }

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link href="/" className="footer-logo" aria-label="Karts home">
            <SiteLogo />
          </Link>
          <p>
            {COMPANY.brand} is your one-stop shop for fashion, footwear &amp; accessories, operated by{" "}
            {COMPANY.name}.
          </p>
        </div>
        <div>
          <h4>SPECIAL</h4>
          <Link href="/shop">Featured Products</Link>
          <Link href="/shop">Latest Products</Link>
          <Link href="/shop?sale=1">Best Selling Products</Link>
          <Link href="/shop?sale=1">Top Rated Products</Link>
        </div>
        <div>
          <h4>ACCOUNT &amp; SHIPPING</h4>
          <Link href="/about">About us</Link>
          <Link href="/profile">Profile Info</Link>
          <Link href="/wishlist">Wish List</Link>
          <Link href="/account">Track Order</Link>
          <Link href="/refund-policy">Refund Policy</Link>
          <Link href="/return-policy">Return Policy</Link>
          <Link href="/cancellation-policy">Cancellation Policy</Link>
          <Link href="/shipping-delivery-policy">Shipping &amp; Delivery Policy</Link>
        </div>
        <div>
          <h4>NEWSLETTER</h4>
          <p>Get updates on new arrivals &amp; offers.</p>
          <form className="newsletter-form" onSubmit={onSubscribe}>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-accent">
              Subscribe
            </button>
          </form>
          {subscribed ? <p className="newsletter-ok">Thanks — you're subscribed!</p> : null}
          <p className="footer-company">
            <strong>{COMPANY.name}</strong>
            <br />
            {COMPANY.address}
            <br />
            <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}>{COMPANY.phone}</a>
            <br />
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 {COMPANY.brand}. All rights reserved.</span>
        <span>
          <Link href="/terms-of-use">Terms &amp; Conditions</Link> · <Link href="/privacy-policy">Privacy Policy</Link> ·{" "}
          <Link href="/shipping-delivery-policy">Shipping &amp; Delivery Policy</Link>
        </span>
      </div>
    </footer>
  );
}
