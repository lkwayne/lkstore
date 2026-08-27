"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/types/cart";
import { readCartFromStorage, writeCartToStorage } from "@/lib/cart-storage";

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  isHydrated: boolean;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  // Évite un flash de contenu incohérent entre le rendu serveur (panier
  // vide) et l'hydratation client (panier lu depuis localStorage).
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Lecture de localStorage après montage : nécessaire pour éviter un
    // mismatch d'hydratation SSR/client (le serveur ne connaît pas le
    // panier stocké côté navigateur). Pattern recommandé par React pour
    // ce cas précis — voir react.dev/reference/react/useState#avoiding-hydration-mismatches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(readCartFromStorage());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) writeCartToStorage(lines);
  }, [lines, isHydrated]);

  const addItem = useCallback((productId: string, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (existing) {
        return current.map((line) =>
          line.productId === productId
            ? { ...line, quantity: line.quantity + quantity }
            : line
        );
      }
      return [...current, { productId, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setLines((current) => current.filter((line) => line.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) => {
      if (quantity <= 0) {
        return current.filter((line) => line.productId !== productId);
      }
      return current.map((line) =>
        line.productId === productId ? { ...line, quantity } : line
      );
    });
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines]
  );

  const value = useMemo(
    () => ({ lines, itemCount, isHydrated, addItem, removeItem, setQuantity, clear }),
    [lines, itemCount, isHydrated, addItem, removeItem, setQuantity, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé à l'intérieur de <CartProvider>");
  }
  return context;
}
