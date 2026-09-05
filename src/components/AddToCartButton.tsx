"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";

export function AddToCartButton({
  productId,
  stockQuantity,
}: {
  productId: string;
  stockQuantity: number;
}) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const isAvailable = stockQuantity > 0;

  useEffect(() => {
    if (!justAdded) return;
    const timeout = setTimeout(() => setJustAdded(false), 2000);
    return () => clearTimeout(timeout);
  }, [justAdded]);

  return (
    <>
      <button
        type="button"
        disabled={!isAvailable}
        onClick={() => {
          addItem(productId, 1);
          setJustAdded(true);
        }}
        className="bg-brand-gradient mt-8 w-full rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/25 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {!isAvailable ? "Indisponible" : justAdded ? "Ajouté au panier ✓" : "Ajouter au panier"}
      </button>
      <p className="mt-2 text-center text-xs text-neutral-400">
        Le paiement se règle à la livraison ou en magasin.
      </p>
    </>
  );
}
