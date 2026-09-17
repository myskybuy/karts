"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CategoryProductRow from "@/components/CategoryProductRow";
import FestivePopup from "@/components/FestivePopup";
import { Product } from "@/components/ProductCard";
import ProductCarousel from "@/components/ProductCarousel";
import RankingColumn from "@/components/RankingColumn";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";

type Category = { id: number; name: string; image: string };

type PromoBanner = {
  active: boolean;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
};

const CATEGORY_ICONS: Record<string, string> = {
  "Shoes & Footwear": "👟",
  "Men's Clothing": "👔",
  "Women's Clothing": "👗",
  "Bags, Wallets & Luggage": "👜",
  Jewellery: "💍",
  "Accessories (Belts & Eyewear)": "🕶️",
  "Kids & Others": "🧸",
};

const HERO_LINES: Record<string, string> = {
  "Shoes & Footwear": "Step out in style",
  "Men's Clothing": "Everyday fashion, done right",
  "Women's Clothing": "Looks that last all day",
  "Bags, Wallets & Luggage": "Carry it in style",
  Jewellery: "Finish the look",
  "Accessories (Belts & Eyewear)": "The details that count",
  "Kids & Others": "Comfort for little ones",
};

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banner, setBanner] = useState<PromoBanner | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const heroSlides = useMemo(
    () =>
      categories
        .map((c) => {
          const p = products.find((x) => x.category === c.name);
          if (!p) return null;
          return {
            id: c.id,
            href: `/shop?category=${encodeURIComponent(c.name)}`,
            image: p.image || c.image,
            label: c.name,
            title: HERO_LINES[c.name] || `Shop ${c.name}`,
          };
        })
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [categories, products]
  );

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
    fetch("/api/banner")
      .then((r) => r.json())
      .then(setBanner);
  }, []);

  useEffect(() => {
    if (heroIndex >= heroSlides.length) setHeroIndex(0);
  }, [heroSlides.length, heroIndex]);

  useEffect(() => {
    if (heroSlides.length < 2) return;
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % heroSlides.length), 4500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const hero = heroSlides[heroIndex] || heroSlides[0];

  const saleProducts = products.filter((p) => p.salePrice < p.price).slice(0, 10);
  const newArrivals = [...products].reverse().slice(0, 10);
  const lookTiles = [
    { cat: "Men's Clothing", line: "Everyday fashion" },
    { cat: "Women's Clothing", line: "Looks that last" },
    { cat: "Shoes & Footwear", line: "Step out in style" },
  ]
    .map((t) => {
      const p = products.find((x) => x.category === t.cat);
      const c = categories.find((x) => x.name === t.cat);
      const image = p?.image || c?.image;
      if (!image) return null;
      return { ...t, image, href: `/shop?category=${encodeURIComponent(t.cat)}` };
    })
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const bestSellers = [...products]
    .sort((a, b) => {
      const aSale = a.salePrice < a.price ? 1 : 0;
      const bSale = b.salePrice < b.price ? 1 : 0;
      if (bSale !== aSale) return bSale - aSale;
      return a.id - b.id;
    })
    .slice(0, 4);
  const topRated = [...products].slice(0, 4);
  const categoryRows = categories
    .map((c) => ({ category: c, products: products.filter((p) => p.category === c.name).slice(0, 4) }))
    .filter((row) => row.products.length > 0);

  return (
    <>
      <FestivePopup />
      <StoreShell>
        <SiteHeader />

        <div className="home-page">
          <section className="fk-hero">
            {heroSlides.length > 1 ? (
              <button
                type="button"
                className="fk-hero-btn prev"
                onClick={() => setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length)}
                aria-label="Previous banner"
              >
                ‹
              </button>
            ) : null}
            <div className="fk-hero-slide">
              {hero?.image ? (
                <Link href={hero.href} className="fk-hero-visual" aria-label={hero.label}>
                  <img className="fk-hero-bg" src={hero.image} alt="" />
                </Link>
              ) : null}
              {hero ? (
                <div className="fk-hero-copy">
                  <p className="eyebrow">{hero.label}</p>
                  <h1>{hero.title}</h1>
                  <Link href={hero.href} className="btn btn-accent">
                    Explore
                  </Link>
                </div>
              ) : null}
            </div>
            {heroSlides.length > 1 ? (
              <button
                type="button"
                className="fk-hero-btn next"
                onClick={() => setHeroIndex((i) => (i + 1) % heroSlides.length)}
                aria-label="Next banner"
              >
                ›
              </button>
            ) : null}
            {heroSlides.length > 1 ? (
              <div className="fk-hero-dots">
                {heroSlides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    className={i === heroIndex ? "active" : ""}
                    onClick={() => setHeroIndex(i)}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </section>

          <div className="fk-cod">
            <span>Cash on Delivery</span>
            <span>7-day returns</span>
            <span>Pan-India dispatch</span>
          </div>

          <section className="fk-strip">
            <div className="fk-cats">
              {categories.map((c) => (
                <Link key={c.id} className="fk-cat-item" href={`/shop?category=${encodeURIComponent(c.name)}`}>
                  <div className="fk-cat-circle">
                    {c.image ? <img src={c.image} alt="" /> : <span>{CATEGORY_ICONS[c.name] || "🛍️"}</span>}
                  </div>
                  <span>{c.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {banner?.active ? (
            <Link
              href={(banner.buttonLink || "/shop").replace("/shop.html", "/shop")}
              className="fk-deal"
            >
              {banner.image ? <img className="fk-deal-bg" src={banner.image} alt="" /> : null}
              <div className="fk-deal-copy">
                <p className="eyebrow">Offer</p>
                <h2>{banner.title}</h2>
                {banner.subtitle ? <p>{banner.subtitle}</p> : null}
                <span className="fk-deal-cta">{banner.buttonText || "Shop Now"}</span>
              </div>
            </Link>
          ) : null}

          {saleProducts.length ? (
            <section className="fk-box fk-offers">
              <div className="fk-offers-head">
                <h2>On sale</h2>
                <Link href="/shop?sale=1" className="fk-link-more">
                  View all →
                </Link>
              </div>
              <ProductCarousel products={saleProducts} />
            </section>
          ) : null}

          {lookTiles.length ? (
            <section className="fk-looks">
              {lookTiles.map((t) => (
                <Link key={t.cat} href={t.href} className="fk-look-tile">
                  <img src={t.image} alt={t.cat} />
                  <div className="fk-look-copy">
                    <p>{t.cat}</p>
                    <strong>{t.line}</strong>
                    <span>Shop</span>
                  </div>
                </Link>
              ))}
            </section>
          ) : null}

          <section className="fk-box">
            <div className="fk-arrivals-head">
              <h2>
                <span className="fk-new-badge">NEW</span> ARRIVALS
              </h2>
            </div>
            <ProductCarousel products={newArrivals} />
          </section>

          <div className="fk-rank-grid">
            <RankingColumn title="Best sellers" icon="🏆" href="/shop?sale=1" products={bestSellers} />
            <RankingColumn title="Top rated" icon="⭐" href="/shop" products={topRated} />
          </div>

          {categoryRows.map(({ category, products: rowProducts }) => (
            <CategoryProductRow key={category.id} category={category} products={rowProducts} />
          ))}

          <div className="trust-strip">
            <div className="trust-item">
              <div className="icon">🚚</div>
              <b>Fast Delivery</b>
              all across the
            </div>
            <div className="trust-item">
              <div className="icon">💳</div>
              <b>Safe Payment</b>
              COD &amp; online
            </div>
            <div className="trust-item">
              <div className="icon">📦</div>
              <b>7 Days Return Policy</b>
              no questions asked
            </div>
            <div className="trust-item">
              <div className="icon">🏅</div>
              <b>100% Authentic Products</b>
              checked before dispatch
            </div>
          </div>
        </div>

        <SiteFooter />
      </StoreShell>
    </>
  );
}
