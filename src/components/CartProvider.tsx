"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const MAX_CART_QTY = 10;

export type CartItem = {
  id: number;
  name: string;
  image: string;
  salePrice: number;
  qty: number;
};

type CartContextValue = {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, "qty">, qty?: number) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isInCart: (id: number) => boolean;
  hydrated: boolean;
};

const CART_KEY = "dharmakart_cart";
const CartContext = createContext<CartContextValue | null>(null);

function clampQty(n: number) {
  return Math.min(MAX_CART_QTY, Math.max(1, n));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {
      setCart([]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const addToCart = (product: Omit<CartItem, "qty">, qty = 1) => {
      const existing = cart.find((i) => i.id === product.id);
      const current = existing?.qty || 0;
      if (current >= MAX_CART_QTY) {
        toast.error("Maximum 10 pieces per item");
        return;
      }
      const next = current + qty;
      if (next > MAX_CART_QTY) toast.error("Maximum 10 pieces per item");
      const finalQty = Math.min(MAX_CART_QTY, next);
      setCart((prev) => {
        if (prev.some((i) => i.id === product.id)) {
          return prev.map((i) => (i.id === product.id ? { ...i, qty: finalQty } : i));
        }
        return [...prev, { ...product, qty: finalQty }];
      });
    };

    const removeFromCart = (id: number) => setCart((prev) => prev.filter((i) => i.id !== id));
    const updateQty = (id: number, qty: number) => {
      if (qty > MAX_CART_QTY) toast.error("Maximum 10 pieces per item");
      setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: clampQty(qty) } : i)));
    };
    const clearCart = () => setCart([]);
    const cartTotal = cart.reduce((sum, i) => sum + i.salePrice * i.qty, 0);
    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
    const isInCart = (id: number) => cart.some((i) => i.id === id);

    return { cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount, isInCart, hydrated };
  }, [cart, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
