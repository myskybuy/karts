"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ProductCard, { Product } from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const saleOnly = searchParams.get("sale");
  const q = searchParams.get("q");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (saleOnly) params.set("sale", "1");
    if (q) params.set("q", q);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then(setProducts);
  }, [category, saleOnly, q]);

  let eyebrow = "All products";
  let title = "Everything at Karts";
  if (category) {
    eyebrow = category;
    title = category;
  } else if (saleOnly) {
    eyebrow = "Price drops";
    title = "Best deals right now";
  } else if (q) {
    eyebrow = "Search results";
    title = `"${q}"`;
  }

  return (
    <StoreShell>
      <SiteHeader />
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow" id="page-eyebrow">
                {eyebrow}
              </div>
              <h2 id="page-title">{title}</h2>
            </div>
          </div>
          <div className="chips" style={{ marginBottom: 26 }}>
            <Link className="chip" href="/shop">
              All
            </Link>
            {categories.map((c) => (
              <Link key={c.id} className="chip" href={`/shop?category=${encodeURIComponent(c.name)}`}>
                {c.name}
              </Link>
            ))}
          </div>
          <div className="product-grid">
            {products.length ? products.map((p) => <ProductCard key={p.id} product={p} />) : "No products found."}
          </div>
        </div>
      </section>
      <SiteFooter />
    </StoreShell>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  );
}
