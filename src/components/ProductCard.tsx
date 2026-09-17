"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import ProductImage from "./ProductImage";
import WishButton from "./WishButton";

export type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  salePrice: number;
  image: string;
  image2?: string;
  image3?: string;
  sizeOptions?: string;
  stock: number;
  description: string;
};

export function productDiscount(product: Product) {
  return product.price > 0 ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
}

export function formatInr(n: number) {
  return n.toLocaleString("en-IN");
}

export function StarRating({ count = 0 }: { count?: number }) {
  if (!count) return null;
  return (
    <div className="star-row">
      <span className="stars" aria-label={`${count} ratings`}>
        ★★★★★
      </span>
      <span className="rating-count">({count})</span>
    </div>
  );
}

export default function ProductCard({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "default" | "compact";
}) {
  const { addToCart, isInCart } = useCart();
  const [feedback, setFeedback] = useState<"idle" | "added">("idle");
  const inCart = isInCart(product.id);
  const discount = productDiscount(product);

  useEffect(() => {
    if (feedback !== "added") return;
    const t = setTimeout(() => setFeedback("idle"), 2500);
    return () => clearTimeout(t);
  }, [feedback]);

  function handleAdd() {
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      salePrice: product.salePrice,
    });
    setFeedback("added");
  }

  if (variant === "compact") {
    return (
      <div className="product-card compact">
        <div className="thumb-wrap">
          <Link href={`/product/${product.id}`} className="thumb">
            <ProductImage src={product.image} alt={product.name} />
          </Link>
          <WishButton product={{ id: product.id, name: product.name, image: product.image, salePrice: product.salePrice }} />
        </div>
        <div className="info">
          <Link href={`/product/${product.id}`}>
            <h3 className="name">{product.name}</h3>
          </Link>
          <StarRating />
          <div className="price-row">
            <span className="price-now">₹{formatInr(product.salePrice)}</span>
            {discount > 0 ? (
              <>
                <span className="price-old">₹{formatInr(product.price)}</span>
                <span className="price-discount">{discount}% Off</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const btnLabel =
    feedback === "added" ? "Item added to cart" : inCart ? "In cart" : "Add to cart";

  return (
    <div className="product-card">
      <div className="thumb-wrap">
        <Link href={`/product/${product.id}`} className="thumb">
          {discount > 0 ? <span className="badge-sale">{discount}% OFF</span> : null}
          <ProductImage src={product.image} alt={product.name} />
        </Link>
        <WishButton product={{ id: product.id, name: product.name, image: product.image, salePrice: product.salePrice }} />
      </div>
      <div className="info">
        <span className="pshape">{product.category}</span>
        <Link href={`/product/${product.id}`}>
          <h3 className="name">{product.name}</h3>
        </Link>
        <div className="price-row">
          <span className="price-now">₹{formatInr(product.salePrice)}</span>
          {product.price > product.salePrice ? (
            <span className="price-old">₹{formatInr(product.price)}</span>
          ) : null}
        </div>
        <button
          className={`add-btn ${feedback === "added" ? "added" : ""} ${inCart && feedback === "idle" ? "in-cart" : ""}`}
          onClick={handleAdd}
          type="button"
        >
          {btnLabel}
        </button>
      </div>
    </div>
  );
}
