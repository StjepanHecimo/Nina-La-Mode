"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { cartItemKey, type CartItem } from "@/lib/cart";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "nina-la-mode-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setItems(JSON.parse(stored) as CartItem[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    });
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      const key = cartItemKey(item);
      const existing = current.find((entry) => cartItemKey(entry) === key);
      if (!existing) return [...current, item];
      return current.map((entry) => cartItemKey(entry) === key
        ? { ...entry, quantity: Math.min(entry.quantity + item.quantity, 10) }
        : entry);
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) => current.map((item) => cartItemKey(item) === key
      ? { ...item, quantity: Math.max(1, Math.min(quantity, 10)) }
      : item));
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => cartItemKey(item) !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const value = useMemo(() => ({
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalCents: items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    hydrated,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }), [items, hydrated, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
