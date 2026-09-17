"use client";

import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <div className="cart-page">
        <h2>My Wishlist</h2>
        {!wishlist.length ? (
          <p style={{ color: "var(--color-muted)" }}>
            Your wishlist is empty. <Link href="/shop">Continue shopping →</Link>
          </p>
        ) : (
          wishlist.map((item) => {
            const inCart = isInCart(item.id);
            return (
              <div key={item.id} className="cart-item">
                <Link href={`/product/${item.id}`} className="cart-item-thumb">
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className="cart-item-info">
                  <Link href={`/product/${item.id}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  <div>₹{item.salePrice.toLocaleString("en-IN")}</div>
                </div>
                <div className="wish-item-actions">
                  <button
                    type="button"
                    className="add-btn"
                    onClick={() =>
                      addToCart({
                        id: item.id,
                        name: item.name,
                        image: item.image,
                        salePrice: item.salePrice,
                      })
                    }
                  >
                    {inCart ? "In cart" : "Add to cart"}
                  </button>
                  <button type="button" className="remove-btn" onClick={() => removeFromWishlist(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <SiteFooter />
    </StoreShell>
  );
}
