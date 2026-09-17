import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { COMPANY } from "@/lib/policies";

const stats = [
  { num: "130+", label: "curated fashion picks" },
  { num: "7", label: "product categories" },
  { num: "COD", label: "available pan-India" },
  { num: "₹", label: "transparent INR pricing" },
];

const offers = [
  {
    n: "01",
    title: "Shoes & Footwear",
    text: "Sneakers, sandals, formal shoes and heels with proper UK size options for the whole family.",
  },
  {
    n: "02",
    title: "Men's & Women's Clothing",
    text: "Shirts, kurtas, dresses, ethnic and western wear in sizes S to XL.",
  },
  {
    n: "03",
    title: "Bags, Wallets & Luggage",
    text: "Handbags, wallets, backpacks and travel bags for everyday and travel use.",
  },
  {
    n: "04",
    title: "Jewellery & Accessories",
    text: "Necklaces, earrings, bracelets, belts and eyewear to complete every outfit.",
  },
  {
    n: "05",
    title: "Kids & Others",
    text: "Comfortable clothing and footwear picks for kids, plus a few everyday essentials.",
  },
];

const process = [
  { step: "01", title: "Browse the catalogue", text: "Filter by category, size or price and find something that fits." },
  { step: "02", title: "Add to cart", text: "See rupee pricing up front — no surprise charges added at the last step." },
  { step: "03", title: "Checkout your way", text: "Pay with Cash on Delivery when your order arrives." },
  { step: "04", title: "Track & receive", text: "We confirm stock and dispatch details before your order ships to you." },
];

const reasons = [
  { num: "01", title: "Real product photography", text: "What you see is what ships — every listing is reviewed for accurate presentation before it goes live." },
  { num: "02", title: "Transparent pricing", text: "Clear regular and sale prices in ₹, with nothing hidden until checkout." },
  { num: "03", title: "Cash on Delivery", text: "Order with confidence — pay when your order actually arrives at your door." },
  { num: "04", title: "Responsive support", text: "Order status, delivery, cancellation, return or refund help — one email or call away." },
];

const checks = ["Accurate product photos", "INR prices shown up front", "Dispatch confirmed before ship", "Support after you order"];

export default function AboutPage() {
  return (
    <StoreShell>
      <SiteHeader />
      <div className="about-page">
        <section className="about-hero">
          <div className="container about-hero-inner">
            <p className="about-eyebrow">About us</p>
            <Link href="/" className="about-wordmark">
              <span>KARTS</span>
            </Link>
            <h1>Fashion, footwear &amp; accessories, done properly.</h1>
            <p className="about-lead">
              Karts is an Indian ecommerce store operated by <strong>{COMPANY.name}</strong>. We help
              customers discover and purchase footwear, clothing, bags, jewellery and accessories through
              a clear, secure and convenient online shopping experience.
            </p>
            <Link href="/shop" className="btn btn-accent">
              Explore our collection
            </Link>
          </div>
        </section>

        <section className="about-stats-strip">
          <div className="container about-stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="about-stat">
                <strong>{s.num}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="about-who">
          <div className="container about-who-grid">
            <div className="about-copy">
              <p className="about-eyebrow">Our business</p>
              <h2>Every order is checked before it ships.</h2>
              <p>
                We focus on accurate product presentation, transparent INR pricing, straightforward
                checkout and responsive post-order support. Product descriptions, images, prices and stock
                status are reviewed as part of our catalogue and order-management process.
              </p>
              <p>
                Orders are processed by Karts, and dispatch details are confirmed before shipment — so
                what lands on your doorstep matches what you picked, every time.
              </p>
            </div>
            <aside className="about-check-panel">
              <p className="about-check-kicker">Before dispatch</p>
              <ul>
                {checks.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="about-offer">
          <div className="container">
            <div className="about-center-head">
              <p className="about-eyebrow">Departments</p>
              <h2>Shop by need, not just by category</h2>
              <p className="about-sub">
                From everyday footwear to festive occasion wear — curated so you can find the right fit faster.
              </p>
            </div>
            <div className="about-offer-grid">
              {offers.map((item) => (
                <article key={item.title} className="about-offer-card">
                  <span className="about-badge">{item.n}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-process">
          <div className="container">
            <div className="about-center-head">
              <p className="about-eyebrow">How it works</p>
              <h2>From browsing to your doorstep</h2>
            </div>
            <div className="about-process-grid">
              {process.map((p) => (
                <article key={p.step} className="about-process-card">
                  <span className="about-badge">{p.step}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-why">
          <div className="container">
            <div className="about-center-head">
              <p className="about-eyebrow">Why Karts</p>
              <h2>Why choose us?</h2>
            </div>
            <div className="about-why-grid">
              {reasons.map((r) => (
                <article key={r.num} className="about-why-item">
                  <span className="about-badge">{r.num}</span>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-mission">
          <div className="container about-mission-inner">
            <p className="about-eyebrow light">Our mission</p>
            <h2>Making everyday fashion a little more accessible.</h2>
            <p>
              Our mission is to make quality fashion, footwear and accessories accessible to everyone in
              India — with a shopping experience built around clarity, trust and customer satisfaction, from
              discovery on Karts to delivery at your doorstep.
            </p>
          </div>
        </section>

        <section className="about-business">
          <div className="container">
            <p className="about-eyebrow">Business information</p>
            <div className="about-business-grid">
              <div className="about-biz-card">
                <span>Legal business name</span>
                <strong>{COMPANY.name}</strong>
              </div>
              <div className="about-biz-card">
                <span>GST principal place of business</span>
                <strong>{COMPANY.address}</strong>
              </div>
              <div className="about-biz-card">
                <span>Email</span>
                <strong>
                  <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                </strong>
              </div>
              <div className="about-biz-card">
                <span>Phone</span>
                <strong>
                  <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}>{COMPANY.phone}</a>
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className="about-bottom-cta">
          <div className="container">
            <div className="about-cta-banner">
              <h2>Find your next favourite fit</h2>
              <p>Explore the full catalogue — fashion, footwear and accessories for every occasion.</p>
              <Link href="/shop" className="btn btn-accent">
                Shop now
              </Link>
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </StoreShell>
  );
}
