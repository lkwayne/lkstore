"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Footer } from "@/components/Footer";
import { useCart } from "@/components/CartProvider";
import { checkoutSchema, type CheckoutInput } from "@/schemas/order.schema";
import { formatPrice } from "@/lib/format-price";
import { fetchCartProductData } from "@/app/actions/cart.actions";
import { getCheckoutOptions, placeOrder } from "@/app/actions/order.actions";
import { applyCoupon } from "@/app/actions/coupon.actions";
import type { CartProductData } from "@/types/cart";
import type { ShippingZone, Store } from "@/types/shipping";
import type { CreateOrderResult } from "@/services/order.service";

// Villes où la livraison est proposée. Douala est la seule desservie pour
// l'instant (voir supabase/migrations/0012_douala_shipping_zones.sql) —
// Yaoundé et Bafoussam restent sélectionnables mais afficheront qu'aucun
// quartier n'est encore configuré tant que leur grille tarifaire n'existe pas.
const AVAILABLE_CITIES = ["Douala", "Yaoundé", "Bafoussam"] as const;

export function CheckoutPageClient({ header }: { header: React.ReactNode }) {
  const { lines, isHydrated, clear } = useCart();

  const [products, setProducts] = useState<CartProductData[]>([]);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
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

  const zonesForSelectedCity = useMemo(
    () => zones.filter((z) => z.city === selectedCity),
    [zones, selectedCity]
  );
  const shippingFee = receptionMethod === "DELIVERY" ? (selectedZone?.fee ?? 0) : 0;
  // Remise recalculée à chaque changement de panier côté serveur ; ici on
  // ne l'affiche que si elle ne dépasse pas le sous-total courant.
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const estimatedTotal = subtotal - discount + shippingFee;

  async function handleApplyCoupon() {
    setCouponLoading(true);
    setCouponMessage(null);
    try {
      const res = await applyCoupon(
        couponInput,
        lines.map((l) => ({ productId: l.productId, quantity: l.quantity }))
      );
      if (res.valid) {
        setCoupon({ code: res.code, discount: res.discount });
        setCouponMessage(null);
      } else {
        setCoupon(null);
        setCouponMessage(res.message);
      }
    } catch {
      setCouponMessage("Code indisponible pour le moment.");
    } finally {
      setCouponLoading(false);
    }
  }

  function handleReceptionChange(method: "DELIVERY" | "STORE_PICKUP") {
    setValue("receptionMethod", method);
    setValue("paymentMethod", method === "DELIVERY" ? "CASH_ON_DELIVERY" : "PAY_IN_STORE");
  }

  async function onSubmit(data: CheckoutInput) {
    setSubmitError(null);
    const result = await placeOrder(
      { ...data, couponCode: coupon?.code },
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
        {header}
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
              Conservez ce numéro. Si vous n&rsquo;étiez pas connecté, un
              compte vient d&rsquo;être créé pour vous — vérifiez votre
              boîte mail pour définir votre mot de passe et suivre vos
              commandes depuis « Mon compte ». Notre équipe vous contactera
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
        {header}
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
        {header}
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
        {header}
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
      {header}
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
                        placeholder="Email (pour recevoir le suivi de votre commande)"
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
                        <label className="mb-1 block text-xs font-medium text-neutral-500">
                          Ville
                        </label>
                        <select
                          value={selectedCity}
                          onChange={(e) => {
                            setSelectedCity(e.target.value);
                            setValue("shippingZoneId", "");
                          }}
                          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                        >
                          <option value="" disabled>
                            Choisissez votre ville
                          </option>
                          {AVAILABLE_CITIES.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-500">
                          Quartier
                        </label>
                        <select
                          {...register("shippingZoneId")}
                          value={shippingZoneId ?? ""}
                          onChange={(e) => setValue("shippingZoneId", e.target.value)}
                          disabled={!selectedCity}
                          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400"
                        >
                          <option value="" disabled>
                            {selectedCity ? "Choisissez votre quartier" : "Sélectionnez d'abord une ville"}
                          </option>
                          {zonesForSelectedCity.map((zone) => (
                            <option key={zone.id} value={zone.id}>
                              {zone.neighborhood} · {formatPrice(zone.fee)}
                            </option>
                          ))}
                        </select>
                        {errors.shippingZoneId ? (
                          <p className="mt-1 text-xs text-brand-red">
                            {errors.shippingZoneId.message}
                          </p>
                        ) : null}
                        {selectedCity && zonesForSelectedCity.length === 0 ? (
                          <p className="mt-1 text-xs text-neutral-400">
                            {selectedCity} n&rsquo;est pas encore desservie —
                            contactez-nous pour une livraison sur devis.
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
                  className="bg-brand-gradient w-full rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/25 disabled:cursor-not-allowed disabled:opacity-60 sm:hidden"
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
                <div className="mt-4">
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Code promo"
                      aria-label="Code promo"
                      className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm uppercase focus:border-brand-orange focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="rounded-lg border border-brand-orange px-3 py-2 text-sm font-semibold text-brand-orange disabled:opacity-50"
                    >
                      {couponLoading ? "…" : "Appliquer"}
                    </button>
                  </div>
                  {couponMessage ? (
                    <p className="mt-1.5 text-xs text-brand-red">{couponMessage}</p>
                  ) : null}
                </div>
                <div className="mt-4 space-y-1.5 border-t border-neutral-200 pt-3 text-sm">
                  <div className="flex justify-between text-neutral-500">
                    <span>Sous-total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {coupon ? (
                    <div className="flex justify-between text-green-700">
                      <span>Code {coupon.code}</span>
                      <span>− {formatPrice(discount)}</span>
                    </div>
                  ) : null}
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
                  className="bg-brand-gradient mt-5 hidden w-full rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/25 disabled:cursor-not-allowed disabled:opacity-60 sm:block"
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
