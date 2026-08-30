"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/components/CartProvider";
import { checkoutSchema, type CheckoutInput } from "@/schemas/order.schema";
import { formatPrice } from "@/lib/format-price";
import { fetchCartProductData } from "@/app/actions/cart.actions";
import { getCheckoutOptions, placeOrder } from "@/app/actions/order.actions";
import type { CartProductData } from "@/types/cart";
import type { ShippingZone, Store } from "@/types/shipping";
import type { CreateOrderResult } from "@/services/order.service";

export default function CheckoutPage() {
  const { lines, isHydrated, clear } = useCart();

  const [products, setProducts] = useState<CartProductData[]>([]);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<CreateOrderResult | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      receptionMethod: "DELIVERY",
      paymentMethod: "CASH_ON_DELIVERY",
    },
  });

  const receptionMethod = watch("receptionMethod");
  const shippingZoneId = watch("shippingZoneId");

  useEffect(() => {
    if (!isHydrated) return;

    async function load() {
      try {
        setLoadError(null);
        const [productData, options] = await Promise.all([
          lines.length > 0
            ? fetchCartProductData(lines.map((l) => l.productId))
            : Promise.resolve([]),
          getCheckoutOptions(),
        ]);
        setProducts(productData);
        setZones(options.zones);
        setStores(options.stores);
      } catch {
        setLoadError(
          "Impossible de charger la page de commande pour le moment. Réessayez dans un instant."
        );
      } finally {
        setIsLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  const cartWithProducts = lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      return product ? { product, quantity: line.quantity } : null;
    })
    .filter((l): l is { product: CartProductData; quantity: number } => l !== null);

  const hasUnavailableItems =
    lines.length !== cartWithProducts.length ||
    cartWithProducts.some((l) => l.quantity > l.product.stockQuantity);

  const subtotal = cartWithProducts.reduce(
    (sum, l) => sum + l.product.price * l.quantity,
    0
  );

  const selectedZone = useMemo(
    () => zones.find((z) => z.id === shippingZoneId) ?? null,
    [zones, shippingZoneId]
  );
  const shippingFee = receptionMethod === "DELIVERY" ? (selectedZone?.fee ?? 0) : 0;
  const estimatedTotal = subtotal + shippingFee;

  function handleReceptionChange(method: "DELIVERY" | "STORE_PICKUP") {
    setValue("receptionMethod", method);
    setValue("paymentMethod", method === "DELIVERY" ? "CASH_ON_DELIVERY" : "PAY_IN_STORE");
  }

  async function onSubmit(data: CheckoutInput) {
    setSubmitError(null);
    const result = await placeOrder(
      data,
      lines.map((l) => ({ productId: l.productId, quantity: l.quantity }))
    );
    if (result.success) {
      setOrderResult(result.order);
      clear();
    } else {
      setSubmitError(result.error);
    }
  }

  if (orderResult) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
            <span className="bg-brand-gradient inline-flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white">
              ✓
            </span>
            <h1 className="mt-5 text-2xl font-bold text-brand-navy">
              Commande confirmée
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Votre numéro de commande :
            </p>
            <p className="text-brand-gradient mt-1 text-xl font-extrabold">
              {orderResult.orderNumber}
            </p>
            <p className="mt-4 text-sm text-neutral-500">
              Total : <strong className="text-brand-navy">{formatPrice(orderResult.total)}</strong>
            </p>
            <p className="mt-6 text-xs text-neutral-400">
              Conservez ce numéro — le suivi de commande par numéro arrive
              avec le module Authentification. Notre équipe vous contactera
              au numéro fourni pour confirmer la suite.
            </p>
            <Link
              href="/categories"
              className="bg-brand-gradient mt-8 inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white"
            >
              Continuer mes achats
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!isHydrated || isLoading) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-neutral-400 sm:px-6">
            Chargement…
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-brand-red sm:px-6">
            {loadError}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (lines.length === 0) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
            <p className="text-sm text-neutral-500">Votre panier est vide.</p>
            <Link
              href="/categories"
              className="bg-brand-gradient mt-6 inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white"
            >
              Découvrir le catalogue
            </Link>
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
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
            Finaliser la commande
          </h1>

          {hasUnavailableItems ? (
            <p className="mt-4 rounded-lg bg-brand-red/10 px-4 py-3 text-sm text-brand-red">
              Certains articles de votre panier ne sont plus disponibles ou
              en quantité insuffisante.{" "}
              <Link href="/cart" className="underline">
                Retournez au panier
              </Link>{" "}
              pour les ajuster avant de continuer.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]"
            >
              <div className="space-y-8">
                {/* Coordonnées */}
                <fieldset>
                  <legend className="text-sm font-semibold text-brand-navy">
                    Vos coordonnées
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <input
                        {...register("customerFirstName")}
                        placeholder="Prénom"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                      />
                      {errors.customerFirstName ? (
                        <p className="mt-1 text-xs text-brand-red">
                          {errors.customerFirstName.message}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <input
                        {...register("customerLastName")}
                        placeholder="Nom"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                      />
                      {errors.customerLastName ? (
                        <p className="mt-1 text-xs text-brand-red">
                          {errors.customerLastName.message}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <input
                        {...register("customerPhone")}
                        placeholder="Téléphone (ex : 6XX XXX XXX)"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                      />
                      {errors.customerPhone ? (
                        <p className="mt-1 text-xs text-brand-red">
                          {errors.customerPhone.message}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <input
                        {...register("customerEmail")}
                        placeholder="Email (optionnel)"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                      />
                      {errors.customerEmail ? (
                        <p className="mt-1 text-xs text-brand-red">
                          {errors.customerEmail.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </fieldset>

                {/* Réception */}
                <fieldset>
                  <legend className="text-sm font-semibold text-brand-navy">
                    Comment souhaitez-vous être servi ?
                  </legend>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleReceptionChange("DELIVERY")}
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                        receptionMethod === "DELIVERY"
                          ? "border-brand-orange bg-brand-surface text-brand-navy"
                          : "border-neutral-200 text-neutral-500"
                      }`}
                    >
                      Livraison
                      <span className="block text-xs font-normal text-neutral-400">
                        Paiement à la livraison
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReceptionChange("STORE_PICKUP")}
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                        receptionMethod === "STORE_PICKUP"
                          ? "border-brand-orange bg-brand-surface text-brand-navy"
                          : "border-neutral-200 text-neutral-500"
                      }`}
                    >
                      Retrait en magasin
                      <span className="block text-xs font-normal text-neutral-400">
                        Paiement en magasin
                      </span>
                    </button>
                  </div>

                  {receptionMethod === "DELIVERY" ? (
                    <div className="mt-4 space-y-3">
                      <div>
                        <select
                          {...register("shippingZoneId")}
                          defaultValue=""
                          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                        >
                          <option value="" disabled>
                            Choisissez votre zone
                          </option>
                          {zones.map((zone) => (
                            <option key={zone.id} value={zone.id}>
                              {zone.city}
                              {zone.neighborhood ? ` — ${zone.neighborhood}` : ""} ·{" "}
                              {formatPrice(zone.fee)}
                            </option>
                          ))}
                        </select>
                        {errors.shippingZoneId ? (
                          <p className="mt-1 text-xs text-brand-red">
                            {errors.shippingZoneId.message}
                          </p>
                        ) : null}
                        {zones.length === 0 ? (
                          <p className="mt-1 text-xs text-neutral-400">
                            Aucune zone de livraison n&rsquo;est configurée
                            pour le moment.
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <input
                          {...register("addressLine")}
                          placeholder="Adresse précise (rue, repère...)"
                          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                        />
                        {errors.addressLine ? (
                          <p className="mt-1 text-xs text-brand-red">
                            {errors.addressLine.message}
                          </p>
                        ) : null}
                      </div>
                      <textarea
                        {...register("instructions")}
                        placeholder="Instructions de livraison (optionnel)"
                        rows={2}
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="mt-4">
                      <select
                        {...register("storeId")}
                        defaultValue=""
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                      >
                        <option value="" disabled>
                          Choisissez un magasin
                        </option>
                        {stores.map((store) => (
                          <option key={store.id} value={store.id}>
                            {store.name} — {store.address}
                          </option>
                        ))}
                      </select>
                      {errors.storeId ? (
                        <p className="mt-1 text-xs text-brand-red">
                          {errors.storeId.message}
                        </p>
                      ) : null}
                      {stores.length === 0 ? (
                        <p className="mt-1 text-xs text-neutral-400">
                          Aucun magasin n&rsquo;est disponible pour le
                          retrait actuellement.
                        </p>
                      ) : null}
                    </div>
                  )}
                </fieldset>

                {submitError ? (
                  <p className="rounded-lg bg-brand-red/10 px-4 py-3 text-sm text-brand-red">
                    {submitError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-gradient w-full rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-red/20 disabled:cursor-not-allowed disabled:opacity-60 sm:hidden"
                >
                  {isSubmitting ? "Envoi de la commande…" : "Confirmer la commande"}
                </button>
              </div>

              {/* Résumé */}
              <aside className="h-fit rounded-2xl border border-neutral-100 bg-brand-surface p-5">
                <h2 className="text-sm font-semibold text-brand-navy">
                  Résumé de la commande
                </h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {cartWithProducts.map(({ product, quantity }) => (
                    <li key={product.id} className="flex justify-between gap-2">
                      <span className="text-neutral-500">
                        {product.name} × {quantity}
                      </span>
                      <span className="shrink-0 font-medium text-brand-navy">
                        {formatPrice(product.price * quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-1.5 border-t border-neutral-200 pt-3 text-sm">
                  <div className="flex justify-between text-neutral-500">
                    <span>Sous-total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Livraison</span>
                    <span>
                      {receptionMethod === "STORE_PICKUP"
                        ? "Gratuit (retrait)"
                        : selectedZone
                          ? formatPrice(shippingFee)
                          : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 text-base font-bold text-brand-navy">
                    <span>Total estimé</span>
                    <span>{formatPrice(estimatedTotal)}</span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-neutral-400">
                  Le total définitif est recalculé et confirmé côté serveur.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-gradient mt-5 hidden w-full rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-red/20 disabled:cursor-not-allowed disabled:opacity-60 sm:block"
                >
                  {isSubmitting ? "Envoi de la commande…" : "Confirmer la commande"}
                </button>
              </aside>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
