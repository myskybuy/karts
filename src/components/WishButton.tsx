"use client";

import { WishlistItem, useWishlist } from "./WishlistProvider";

export default function WishButton({ product }: { product: WishlistItem }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const on = isInWishlist(product.id);

  return (
    <button
      type="button"
      className={`wish-btn ${on ? "active" : ""}`}
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      title={on ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M12 21s-7-4.5-9.5-9C.7 8.3 2.3 5 5.6 5c1.9 0 3.4 1 4.4 2.4C11 6 12.5 5 14.4 5c3.3 0 4.9 3.3 3.1 7-2.5 4.5-9.5 9-9.5 9z"
          fill={on ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </button>
  );
}
