"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productFormSchema,
  toProductInput,
  fromProductInput,
  type ProductFormInput,
} from "@/schemas/product-form.schema";
import type { ProductInput } from "@/schemas/product.schema";
import { FULFILLMENT_TYPES, PRODUCT_CONDITIONS } from "@/config/enums";
import { getProductFormOptions, type SubcategoryOption } from "@/app/actions/admin-catalog-options.actions";
import { saveNewProduct, saveExistingProduct, type AdminActionResult } from "@/app/actions/admin-product.actions";
import { formatPrice } from "@/lib/format-price";
import type { Category } from "@/types/catalog";
import type { BrandOption } from "@/services/admin-catalog.service";

const FULFILLMENT_LABELS: Record<string, string> = {
  SENDUU_STOCK: "Stock SENDUU",
  DROPSHIPPING: "Dropshipping",
  MIXED: "Mixte",
};

const CONDITION_LABELS: Record<string, string> = {
  NEUF: "Neuf",
  OCCASION: "Occasion",
};

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-neutral-500">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-brand-red">{error}</p> : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none";

export function ProductForm({
  productId,
  defaultValues,
}: {
  productId?: string;
  defaultValues?: ProductInput;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues
      ? fromProductInput(defaultValues)
      : {
          condition: "NEUF" as const,
          status: "DRAFT" as const,
          fulfillmentType: "SENDUU_STOCK" as const,
          codAvailable: true,
          storePickupAvailable: false,
          stockQuantity: 0,
          lowStockThreshold: 5,
        },
  });

  const selectedCategoryId = watch("categoryId");
  const realPrice = watch("realPrice");
  const promoPrice = watch("promoPrice");

  useEffect(() => {
    getProductFormOptions().then((options) => {
      setCategories(options.categories);
      setSubcategories(options.subcategories);
      setBrands(options.brands);
      setLoadingOptions(false);
    });
  }, []);

  async function onSubmit(data: ProductFormInput) {
    setServerError(null);
    const payload = toProductInput(data);
    const result: AdminActionResult = productId
      ? await saveExistingProduct(productId, payload)
      : await saveNewProduct(payload);

    // saveNewProduct/saveExistingProduct redirigent en cas de succès —
    // on ne traite ici que l'échec.
    if (!result.success) {
      setServerError(result.error);
    }
  }

  const filteredSubcategories = subcategories.filter(
    (s) => s.categoryId === selectedCategoryId
  );

  const hasValidPromo =
    typeof realPrice === "number" &&
    typeof promoPrice === "number" &&
    promoPrice > 0 &&
    promoPrice < realPrice;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-brand-navy">Informations générales</legend>

        <Field label="Titre de l'article" htmlFor="name" error={errors.name?.message}>
          <input id="name" {...register("name")} placeholder="Ex : Samsung Galaxy A15 128 Go" className={inputClass} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Slug (URL)" htmlFor="slug" error={errors.slug?.message}>
            <input id="slug" {...register("slug")} placeholder="samsung-galaxy-a15" className={inputClass} />
          </Field>
          <Field label="SKU" htmlFor="sku" error={errors.sku?.message}>
            <input id="sku" {...register("sku")} placeholder="TEL-SAM-A15" className={inputClass} />
          </Field>
        </div>

        <Field label="État de l'article" htmlFor="condition">
          <select id="condition" {...register("condition")} className={inputClass}>
            {PRODUCT_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {CONDITION_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description de l'article" htmlFor="description">
          <textarea
            id="description"
            {...register("description")}
            placeholder="Caractéristiques, état, ce qui est inclus…"
            rows={4}
            className={inputClass}
          />
        </Field>

        <Field label="URL d'image (optionnel)" htmlFor="imageUrl" error={errors.imageUrl?.message}>
          <input id="imageUrl" {...register("imageUrl")} placeholder="https://…" className={inputClass} />
        </Field>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-brand-navy">Classement</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Catégorie" htmlFor="categoryId">
            <select id="categoryId" {...register("categoryId")} disabled={loadingOptions} defaultValue="" className={inputClass}>
              <option value="">Catégorie…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sous-catégorie" htmlFor="subcategoryId">
            <select
              id="subcategoryId"
              {...register("subcategoryId")}
              disabled={loadingOptions || !selectedCategoryId}
              defaultValue=""
              className={inputClass}
            >
              <option value="">Sous-catégorie…</option>
              {filteredSubcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Marque" htmlFor="brandId">
          <select id="brandId" {...register("brandId")} disabled={loadingOptions} defaultValue="" className={inputClass}>
            <option value="">Marque…</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-brand-navy">Prix (FCFA)</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prix réel (FCFA)" htmlFor="realPrice" error={errors.realPrice?.message}>
            <div className="relative">
              <input
                id="realPrice"
                {...register("realPrice")}
                type="number"
                step="1"
                placeholder="Ex : 89900"
                className={`${inputClass} pr-14`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                FCFA
              </span>
            </div>
          </Field>
          <Field label="Prix promo (optionnel)" htmlFor="promoPrice" error={errors.promoPrice?.message}>
            <div className="relative">
              <input
                id="promoPrice"
                {...register("promoPrice")}
                type="number"
                step="1"
                placeholder="Laisser vide si pas de promo"
                className={`${inputClass} pr-14`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                FCFA
              </span>
            </div>
          </Field>
        </div>

        {hasValidPromo ? (
          <p className="rounded-lg bg-brand-surface px-3 py-2 text-xs text-neutral-500">
            Affiché sur la boutique :{" "}
            <span className="font-bold text-brand-navy">{formatPrice(promoPrice!)}</span>{" "}
            <span className="text-neutral-400 line-through">{formatPrice(realPrice!)}</span>
          </p>
        ) : null}

        <Field label="Coût d'achat — interne, jamais visible du client" htmlFor="costPrice">
          <input
            id="costPrice"
            {...register("costPrice")}
            type="number"
            step="1"
            placeholder="Coût d'achat (FCFA)"
            className={inputClass}
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-brand-navy">Stock</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantité en stock" htmlFor="stockQuantity">
            <input id="stockQuantity" {...register("stockQuantity")} type="number" className={inputClass} />
          </Field>
          <Field label="Seuil de stock faible" htmlFor="lowStockThreshold">
            <input id="lowStockThreshold" {...register("lowStockThreshold")} type="number" className={inputClass} />
          </Field>
        </div>
        <Field label="Approvisionnement" htmlFor="fulfillmentType">
          <select id="fulfillmentType" {...register("fulfillmentType")} className={inputClass}>
            {FULFILLMENT_TYPES.map((f) => (
              <option key={f} value={f}>
                {FULFILLMENT_LABELS[f]}
              </option>
            ))}
          </select>
        </Field>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-brand-navy">Disponibilité</legend>
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input type="checkbox" {...register("codAvailable")} className="h-4 w-4" />
          Paiement à la livraison disponible
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input type="checkbox" {...register("storePickupAvailable")} className="h-4 w-4" />
          Retrait en magasin disponible
        </label>
        <Field label="Statut de publication" htmlFor="status">
          <select id="status" {...register("status")} className={inputClass}>
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
        </Field>
      </fieldset>

      {serverError ? (
        <p className="rounded-lg bg-brand-red/10 px-4 py-3 text-sm text-brand-red">{serverError}</p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-full border border-neutral-200 px-6 py-2.5 text-sm font-semibold text-brand-navy"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
