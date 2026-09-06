"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/schemas/product.schema";
import { FULFILLMENT_TYPES } from "@/config/enums";
import { getProductFormOptions, type SubcategoryOption } from "@/app/actions/admin-catalog-options.actions";
import { saveNewProduct, saveExistingProduct, type AdminActionResult } from "@/app/actions/admin-product.actions";
import type { Category } from "@/types/catalog";
import type { BrandOption } from "@/services/admin-catalog.service";

const FULFILLMENT_LABELS: Record<string, string> = {
  SENDUU_STOCK: "Stock SENDUU",
  DROPSHIPPING: "Dropshipping",
  MIXED: "Mixte",
};

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
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues ?? {
      status: "DRAFT",
      fulfillmentType: "SENDUU_STOCK",
      codAvailable: true,
      storePickupAvailable: false,
      stockQuantity: 0,
      lowStockThreshold: 5,
    },
  });

  const selectedCategoryId = watch("categoryId");

  useEffect(() => {
    getProductFormOptions().then((options) => {
      setCategories(options.categories);
      setSubcategories(options.subcategories);
      setBrands(options.brands);
      setLoadingOptions(false);
    });
  }, []);

  async function onSubmit(data: ProductInput) {
    setServerError(null);
    const result: AdminActionResult = productId
      ? await saveExistingProduct(productId, data)
      : await saveNewProduct(data);

    // saveNewProduct/saveExistingProduct redirigent en cas de succès —
    // on ne traite ici que l'échec.
    if (!result.success) {
      setServerError(result.error);
    }
  }

  const filteredSubcategories = subcategories.filter(
    (s) => s.categoryId === selectedCategoryId
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-brand-navy">Informations générales</legend>
        <div>
          <input
            {...register("name")}
            placeholder="Nom du produit"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
          />
          {errors.name ? <p className="mt-1 text-xs text-brand-red">{errors.name.message}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              {...register("slug")}
              placeholder="slug-produit"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
            />
            {errors.slug ? <p className="mt-1 text-xs text-brand-red">{errors.slug.message}</p> : null}
          </div>
          <div>
            <input
              {...register("sku")}
              placeholder="SKU"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
            />
            {errors.sku ? <p className="mt-1 text-xs text-brand-red">{errors.sku.message}</p> : null}
          </div>
        </div>
        <textarea
          {...register("description")}
          placeholder="Description"
          rows={3}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        />
        <input
          {...register("imageUrl")}
          placeholder="URL d'image (optionnel)"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        />
        {errors.imageUrl ? <p className="mt-1 text-xs text-brand-red">{errors.imageUrl.message}</p> : null}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-brand-navy">Classement</legend>
        <div className="grid grid-cols-2 gap-3">
          <select
            {...register("categoryId")}
            disabled={loadingOptions}
            defaultValue=""
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
          >
            <option value="">Catégorie…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            {...register("subcategoryId")}
            disabled={loadingOptions || !selectedCategoryId}
            defaultValue=""
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
          >
            <option value="">Sous-catégorie…</option>
            {filteredSubcategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <select
          {...register("brandId")}
          disabled={loadingOptions}
          defaultValue=""
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        >
          <option value="">Marque…</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-brand-navy">Prix et stock</legend>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <input
              {...register("price")}
              type="number"
              step="1"
              placeholder="Prix (FCFA)"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
            />
            {errors.price ? <p className="mt-1 text-xs text-brand-red">{errors.price.message}</p> : null}
          </div>
          <input
            {...register("compareAtPrice")}
            type="number"
            step="1"
            placeholder="Prix barré (optionnel)"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
          />
          <input
            {...register("costPrice")}
            type="number"
            step="1"
            placeholder="Coût d'achat (interne)"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              {...register("stockQuantity")}
              type="number"
              placeholder="Quantité en stock"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
            />
          </div>
          <input
            {...register("lowStockThreshold")}
            type="number"
            placeholder="Seuil de stock faible"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
          />
        </div>
        <select
          {...register("fulfillmentType")}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        >
          {FULFILLMENT_TYPES.map((f) => (
            <option key={f} value={f}>
              {FULFILLMENT_LABELS[f]}
            </option>
          ))}
        </select>
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
        <select
          {...register("status")}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        >
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
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
