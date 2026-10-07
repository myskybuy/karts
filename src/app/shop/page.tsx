"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const sort = searchParams.get("sort") || "relevance";
  const router = useRouter();
  const pathname = usePathname();

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
    if (sort !== "relevance") params.set("sort", sort);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then(setProducts);
  }, [category, saleOnly, q, sort]);

  function changeSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "relevance") params.delete("sort");
    else params.set("sort", value);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

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
            <label className="sort-select">
              <span>Sort by</span>
              <select value={sort} onChange={(e) => changeSort(e.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </label>
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
