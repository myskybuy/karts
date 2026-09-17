"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import SiteLogo from "./SiteLogo";
import { useWishlist } from "./WishlistProvider";

type User = { id: number; name: string; email: string };
type Category = { id: number; name: string; image: string };

export default function SiteHeader({ showSearch = true }: { showSearch?: boolean }) {
  const router = useRouter();
  const { cartCount, cartTotal } = useCart();
  const { wishlistCount } = useWishlist();
  const [user, setUser] = useState<User | null>(null);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  const cartLabel = cartTotal.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="logo" aria-label="Karts home">
          <SiteLogo />
        </Link>
        {showSearch ? (
          <form onSubmit={onSearch} className="search-wrap">
            <input
              className="search-box"
              placeholder="Search here ..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            <button className="search-btn" type="submit" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" />
              </svg>
            </button>
          </form>
        ) : null}
        <div className="header-actions">
          <div
            className="categories-dd"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              className="icon-circle"
              aria-label="Categories"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            {menuOpen ? (
              <div className="categories-menu">
                {categories.map((c) => (
                  <Link key={c.id} href={`/shop?category=${encodeURIComponent(c.name)}`} onClick={() => setMenuOpen(false)}>
                    {c.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <Link href="/wishlist" className="icon-circle wish-header" title="Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 21s-7-4.5-9.5-9C.7 8.3 2.3 5 5.6 5c1.9 0 3.4 1 4.4 2.4C11 6 12.5 5 14.4 5c3.3 0 4.9 3.3 3.1 7-2.5 4.5-9.5 9-9.5 9z" />
            </svg>
            {wishlistCount > 0 ? <span className="cart-badge">{wishlistCount}</span> : null}
          </Link>
          <Link
            href={user ? "/profile" : "/account"}
            className="icon-circle account-circle"
            title={user ? "My profile" : "Login / Sign up"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span className="profile-label">{user ? user.name.split(" ")[0] : "Account"}</span>
          </Link>
          <Link href="/cart" className="cart-block" title="My cart">
            <span className="icon-circle cart-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
                <path d="M3 4h2l2.2 11h11.3l1.8-7H7" />
              </svg>
              {cartCount > 0 ? <span className="cart-badge">{cartCount}</span> : null}
            </span>
            <span className="cart-meta">
              <span className="cart-title">My cart</span>
              <span className="cart-total">₹{cartLabel}</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
