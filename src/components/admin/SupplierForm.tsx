"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierSchema } from "@/schemas/supplier.schema";
import { SUPPLIER_STATUSES } from "@/config/enums";
import {
  saveNewSupplier,
  saveExistingSupplier,
  type AdminActionResult,
} from "@/app/actions/admin-supplier.actions";
import type { SupplierDetail } from "@/services/supplier-admin.service";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  PENDING: "En attente",
  BLOCKED: "Bloqué",
};

export function SupplierForm({
  supplierId,
  defaultValues,
}: {
  supplierId?: string;
  defaultValues?: SupplierDetail;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: defaultValues ?? { currency: "XAF", status: "PENDING" },
  });

  async function onSubmit(data: ReturnType<typeof supplierSchema.parse>) {
    setServerError(null);
    setSaved(false);
    const result: AdminActionResult = supplierId
      ? await saveExistingSupplier(supplierId, data)
      : await saveNewSupplier(data);

    if (!result.success) {
      setServerError(result.error);
    } else {
      setSaved(true);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            {...register("name")}
            placeholder="Nom du contact"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
          />
          {errors.name ? <p className="mt-1 text-xs text-brand-red">{errors.name.message}</p> : null}
        </div>
        <input
          {...register("companyName")}
          placeholder="Entreprise"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          {...register("country")}
          placeholder="Pays"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        />
        <input
          {...register("city")}
          placeholder="Ville"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          {...register("phone")}
          placeholder="Téléphone"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        />
        <input
          {...register("whatsapp")}
          placeholder="WhatsApp"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            {...register("email")}
            placeholder="Email"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
          />
          {errors.email ? <p className="mt-1 text-xs text-brand-red">{errors.email.message}</p> : null}
        </div>
        <div>
          <input
            {...register("website")}
            placeholder="Site web"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
          />
          {errors.website ? <p className="mt-1 text-xs text-brand-red">{errors.website.message}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <input
          {...register("currency")}
          placeholder="Devise (ex: USD)"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        />
        <input
          {...register("averageLeadTimeDays")}
          type="number"
          placeholder="Délai moyen (jours)"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        />
        <select
          {...register("status")}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
        >
          {SUPPLIER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <textarea
        {...register("internalNotes")}
        placeholder="Notes internes"
        rows={3}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
      />

      {serverError ? (
        <p className="rounded-lg bg-brand-red/10 px-4 py-3 text-sm text-brand-red">{serverError}</p>
      ) : null}
      {saved ? (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Fournisseur enregistré.
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
          onClick={() => router.push("/admin/suppliers")}
          className="rounded-full border border-neutral-200 px-6 py-2.5 text-sm font-semibold text-brand-navy"
        >
          Retour à la liste
        </button>
      </div>
    </form>
  );
}
