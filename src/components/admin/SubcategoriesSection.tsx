"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subcategorySchema } from "@/schemas/category.schema";
import {
  addSubcategory,
  removeSubcategory,
} from "@/app/actions/admin-category.actions";
import type { AdminSubcategoryItem } from "@/services/admin-category.service";

export function SubcategoriesSection({
  categoryId,
  initialSubcategories,
}: {
  categoryId: string;
  initialSubcategories: AdminSubcategoryItem[];
}) {
  const [subcategories, setSubcategories] = useState(initialSubcategories);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(subcategorySchema),
    defaultValues: { sortOrder: subcategories.length + 1, isActive: true, isVisible: true },
  });

  async function onSubmit(data: ReturnType<typeof subcategorySchema.parse>) {
    setError(null);
    const result = await addSubcategory(categoryId, data);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setSubcategories((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        categoryId,
        productCount: 0,
        ...data,
      },
    ]);
    reset({ sortOrder: subcategories.length + 2, isActive: true, isVisible: true });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      const result = await removeSubcategory(id, categoryId);
      if (result.success) {
        setSubcategories((prev) => prev.filter((s) => s.id !== id));
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-brand-navy">Sous-catégories</h2>

      {subcategories.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-400">Aucune sous-catégorie pour l&rsquo;instant.</p>
      ) : (
        <ul className="mt-3 divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {subcategories.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-brand-navy">
                  {s.icon ? <span className="mr-1.5" aria-hidden>{s.icon}</span> : null}
                  {s.name}
                  {!s.isActive || !s.isVisible ? (
                    <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                      masquée
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-neutral-400">
                  /{s.slug} · {s.productCount} produit{s.productCount > 1 ? "s" : ""}
                </p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleRemove(s.id)}
                title={
                  s.productCount > 0
                    ? "Contient des produits — déplacez-les avant de supprimer"
                    : undefined
                }
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
          Ajouter une sous-catégorie
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            {...register("name")}
            placeholder="Nom"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
          <input
            {...register("slug")}
            placeholder="slug-sous-categorie"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
        <input
          {...register("icon")}
          placeholder="Icône (emoji, ex : 📱)"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        {errors.name ? <p className="text-xs text-brand-red">{errors.name.message}</p> : null}
        {errors.slug ? <p className="text-xs text-brand-red">{errors.slug.message}</p> : null}
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
