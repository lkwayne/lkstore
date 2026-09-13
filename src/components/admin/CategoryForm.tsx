"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "@/schemas/category.schema";
import { saveNewCategory, saveExistingCategory, type AdminActionResult } from "@/app/actions/admin-category.actions";
import type { AdminCategoryDetail } from "@/services/admin-category.service";

export function CategoryForm({
  categoryId,
  defaultValues,
}: {
  categoryId?: string;
  defaultValues?: AdminCategoryDetail;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultValues ?? { sortOrder: 0, isActive: true, isVisible: true },
  });

  async function onSubmit(data: ReturnType<typeof categorySchema.parse>) {
    setServerError(null);
    setSaved(false);
    const result: AdminActionResult = categoryId
      ? await saveExistingCategory(categoryId, data)
      : await saveNewCategory(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setSaved(true);
    if (!categoryId) router.push("/admin/categories");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            {...register("name")}
            placeholder="Nom de la catégorie"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
          />
          {errors.name ? <p className="mt-1 text-xs text-brand-red">{errors.name.message}</p> : null}
        </div>
        <div>
          <input
            {...register("slug")}
            placeholder="slug-categorie"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
          />
          {errors.slug ? <p className="mt-1 text-xs text-brand-red">{errors.slug.message}</p> : null}
        </div>
      </div>

      <textarea
        {...register("description")}
        placeholder="Description (optionnel)"
        rows={2}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            {...register("imageUrl")}
            placeholder="URL d'image (optionnel)"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
          />
          {errors.imageUrl ? <p className="mt-1 text-xs text-brand-red">{errors.imageUrl.message}</p> : null}
        </div>
        <input
          {...register("icon")}
          placeholder="Icône (emoji ou nom, optionnel)"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">
          Ordre d&rsquo;affichage
        </label>
        <input
          {...register("sortOrder")}
          type="number"
          className="w-32 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <input type="checkbox" {...register("isActive")} className="h-4 w-4" />
        Catégorie active
      </label>
      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <input type="checkbox" {...register("isVisible")} className="h-4 w-4" />
        Visible sur la boutique
      </label>

      {serverError ? (
        <p className="rounded-lg bg-brand-red/10 px-4 py-3 text-sm text-brand-red">{serverError}</p>
      ) : null}
      {saved ? (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Catégorie enregistrée.
        </p>
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
          onClick={() => router.push("/admin/categories")}
          className="rounded-full border border-neutral-200 px-6 py-2.5 text-sm font-semibold text-brand-navy"
        >
          Retour à la liste
        </button>
      </div>
    </form>
  );
}
