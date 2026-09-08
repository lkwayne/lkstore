"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierProductSchema } from "@/schemas/supplier.schema";
import {
  linkProductToSupplier,
  unlinkProductFromSupplier,
} from "@/app/actions/admin-supplier.actions";
import { formatPrice } from "@/lib/format-price";
import type { LinkedProduct } from "@/services/supplier-admin.service";

interface ProductOption {
  id: string;
  name: string;
}

export function SupplierProductsSection({
  supplierId,
  initialProducts,
  productOptions,
}: {
  supplierId: string;
  initialProducts: LinkedProduct[];
  productOptions: ProductOption[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(supplierProductSchema),
    defaultValues: { supplierStock: 0, shippingCost: 0, priority: 1, status: "ACTIVE" as const },
  });

  async function onSubmit(data: ReturnType<typeof supplierProductSchema.parse>) {
    setError(null);
    const result = await linkProductToSupplier(supplierId, data);
    if (!result.success) {
      setError(result.error);
      return;
    }
    const product = productOptions.find((p) => p.id === data.productId);
    setProducts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        productId: data.productId,
        productName: product?.name ?? data.productId,
        supplierCost: data.supplierCost,
        supplierStock: data.supplierStock,
        shippingCost: data.shippingCost,
        priority: data.priority,
        status: data.status,
      },
    ]);
    reset({ supplierStock: 0, shippingCost: 0, priority: 1, status: "ACTIVE" });
  }

  function handleRemove(linkId: string) {
    startTransition(async () => {
      const result = await unlinkProductFromSupplier(supplierId, linkId);
      if (result.success) {
        setProducts((prev) => prev.filter((p) => p.id !== linkId));
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-brand-navy">Produits fournis</h2>

      {products.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-400">Aucun produit lié pour l&rsquo;instant.</p>
      ) : (
        <ul className="mt-3 divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {products.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-brand-navy">{p.productName}</p>
                <p className="text-xs text-neutral-400">
                  Coût {formatPrice(p.supplierCost)} · Stock {p.supplierStock} · Priorité {p.priority}
                </p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleRemove(p.id)}
                className="text-xs font-semibold text-brand-red hover:underline disabled:opacity-50"
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-2 rounded-2xl border border-dashed border-neutral-300 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Lier un produit
        </p>
        <div className="grid grid-cols-2 gap-2">
          <select
            {...register("productId")}
            defaultValue=""
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Choisir un produit…
            </option>
            {productOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            {...register("supplierSku")}
            placeholder="SKU fournisseur (optionnel)"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <input
            {...register("supplierCost")}
            type="number"
            placeholder="Coût"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
          <input
            {...register("supplierStock")}
            type="number"
            placeholder="Stock"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
          <input
            {...register("shippingCost")}
            type="number"
            placeholder="Livraison"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
          <input
            {...register("priority")}
            type="number"
            placeholder="Priorité"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
        {errors.productId ? (
          <p className="text-xs text-brand-red">{errors.productId.message}</p>
        ) : null}
        {errors.supplierCost ? (
          <p className="text-xs text-brand-red">{errors.supplierCost.message}</p>
        ) : null}
        {error ? <p className="text-xs text-brand-red">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-brand-navy px-5 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Ajout…" : "+ Ajouter"}
        </button>
      </form>
    </div>
  );
}
