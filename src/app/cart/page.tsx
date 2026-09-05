"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartLineItem } from "@/components/CartLineItem";
import { useCart } from "@/components/CartProvider";
import { fetchCartProductData } from "@/app/actions/cart.actions";
import { formatPrice } from "@/lib/format-price";
import type { CartProductData } from "@/types/cart";

export default function CartPage() {
  const { lines, isHydrated, setQuantity, removeItem } = useCart();
  const [products, setProducts] = useState<CartProductData[]>([]);
  const [isPending, startTransition] = useTransition();
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;

    if (lines.length === 0) {
      // Panier vide : pas d'appel serveur nécessaire, on synchronise
      // directement l'état local des produits affichés.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProducts([]);
      return;
    }

    startTransition(async () => {
      try {
        setLoadError(null);
        const data = await fetchCartProductData(lines.map((l) => l.productId));
        setProducts(data);
      } catch {
        setLoadError(
          "Impossible de charger votre panier pour le moment. Réessayez dans un instant."
        );
      }
    });
    // On ne relit que lorsque la liste des produits (pas leur quantité) change,
    // pour éviter un aller-retour serveur à chaque clic +/-.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, lines.map((l) => l.productId).join(",")]);

  const removedProductIds = new Set(
    lines
      .filter((line) => !products.some((p) => p.id === line.productId))
      .map((line) => line.productId)
  );
  const hasRemovedProducts = isHydrated && !isPending && removedProductIds.size > 0;

  const validLines = lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return null;
      const clampedQuantity =
        product.stockQuantity > 0
          ? Math.min(line.quantity, product.stockQuantity)
          : line.quantity;
      return { product, quantity: clampedQuantity };
    })
    .filter((line): line is { product: CartProductData; quantity: number } => line !== null);

  const purchasableLines = validLines.filter(
    (line) => line.product.stockQuantity > 0
  );
  const subtotal = purchasableLines.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0
  );
  const canCheckout =
    purchasableLines.length > 0 && purchasableLines.length === validLines.length;

  if (!isHydrated || isPending) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-neutral-400 sm:px-6">
            Chargement de votre panier…
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
            Votre panier
          </h1>

          {loadError ? (
            <p className="mt-6 text-sm text-brand-red">{loadError}</p>
          ) : validLines.length === 0 ? (
            <div className="mt-10 text-center">
              <p className="text-sm text-neutral-500">
                Votre panier est vide pour le moment.
              </p>
              <Link
                href="/categories"
                className="bg-brand-gradient mt-6 inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white"
              >
                Découvrir le catalogue
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
              <div>
                {hasRemovedProducts ? (
                  <p className="mb-4 rounded-lg bg-brand-surface px-4 py-3 text-xs text-neutral-600">
                    Un ou plusieurs articles de votre panier ne sont plus
                    disponibles et ont été retirés automatiquement.
                  </p>
                ) : null}

                {validLines.map(({ product, quantity }) => (
                  <CartLineItem
                    key={product.id}
                    product={product}
                    quantity={quantity}
                    onQuantityChange={(next) => setQuantity(product.id, next)}
                    onRemove={() => removeItem(product.id)}
                  />
                ))}
              </div>

              <aside className="h-fit rounded-2xl border border-neutral-100 bg-brand-surface p-5">
                <h2 className="text-sm font-semibold text-brand-navy">
                  Résumé
                </h2>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Sous-total</span>
                  <span className="font-semibold text-brand-navy">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-400">
                  Frais de livraison calculés à l&rsquo;étape suivante selon
                  votre zone.
                </p>

                {canCheckout ? (
                  <Link
                    href="/checkout"
                    className="bg-brand-gradient mt-5 flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-orange/25"
                  >
                    Passer la commande
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="bg-brand-gradient mt-5 w-full rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-orange/25 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Passer la commande
                  </button>
                )}
                {!canCheckout && validLines.length > 0 ? (
                  <p className="mt-2 text-center text-xs text-brand-red">
                    Retirez les articles indisponibles pour continuer.
                  </p>
                ) : null}
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
