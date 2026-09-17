"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type WishlistItem = {
  id: number;
  name: string;
  image: string;
  salePrice: number;
};

type WishlistContextValue = {
  wishlist: WishlistItem[];
  toggleWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  wishlistCount: number;
};

const WISHLIST_KEY = "dharmakart_wishlist";
const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      if (raw) setWishlist(JSON.parse(raw));
    } catch {
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const value = useMemo<WishlistContextValue>(() => {
    const toggleWishlist = (product: WishlistItem) => {
      setWishlist((prev) => {
        if (prev.some((i) => i.id === product.id)) return prev.filter((i) => i.id !== product.id);
        return [...prev, product];
      });
    };
    const removeFromWishlist = (id: number) => setWishlist((prev) => prev.filter((i) => i.id !== id));
    const isInWishlist = (id: number) => wishlist.some((i) => i.id === id);
    return { wishlist, toggleWishlist, removeFromWishlist, isInWishlist, wishlistCount: wishlist.length };
  }, [wishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
