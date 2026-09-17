"use client";

import { useRef } from "react";
import ProductCard, { Product } from "./ProductCard";

export default function ProductCarousel({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.75, 220), behavior: "smooth" });
  }

  if (!products.length) return <p className="fk-empty">No products yet.</p>;

  return (
    <div className="fk-carousel">
      <button type="button" className="fk-carousel-btn prev" onClick={() => scroll(-1)} aria-label="Previous products">
        ‹
      </button>
      <div className="fk-carousel-track" ref={trackRef}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} variant="compact" />
        ))}
      </div>
      <button type="button" className="fk-carousel-btn next" onClick={() => scroll(1)} aria-label="Next products">
        ›
      </button>
    </div>
  );
}
