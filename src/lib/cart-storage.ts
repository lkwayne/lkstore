import type { CartLine } from "@/types/cart";

const STORAGE_KEY = "senduu_cart_v1";

/**
 * Persistance côté client uniquement (localStorage). Pour un client
 * connecté, la synchronisation vers une table Supabase `carts` sera
 * ajoutée avec le module Authentification — voir README.
 */
export function readCartFromStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is CartLine =>
        typeof line?.productId === "string" &&
        typeof line?.quantity === "number" &&
        line.quantity > 0
    );
  } catch {
    return [];
  }
}

export function writeCartToStorage(lines: CartLine[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Stockage indisponible (navigation privée, quota atteint...) — le
    // panier reste fonctionnel en mémoire pour la session en cours.
  }
}
