"use client";

import { useState, useTransition } from "react";
import { addCoupon, toggleCoupon } from "@/app/actions/coupon.actions";
import { formatPrice } from "@/lib/format-price";
import type { CouponRow } from "@/services/coupon.service";

const inputClass =
  "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none";

function num(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function CouponManager({ coupons }: { coupons: CouponRow[] }) {
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [pending, startTransition] = useTransition();

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    startTransition(async () => {
      const res = await addCoupon({
        code: String(fd.get("code") ?? ""),
        discountType: type,
        discountValue: num(fd.get("discountValue")) ?? 0,
        minOrderAmount: num(fd.get("minOrderAmount")) ?? 0,
        maxDiscount: num(fd.get("maxDiscount")),
        usageLimit: num(fd.get("usageLimit")),
        endsAt: String(fd.get("endsAt") ?? "") || null,
      });
      if (res.success) form.reset();
      else setError(res.error);
    });
  }

  function onToggle(id: string, active: boolean) {
    setError(null);
    startTransition(async () => {
      const res = await toggleCoupon(id, active);
      if (!res.success) setError(res.error);
    });
  }

  return (
    <div className="mt-6 space-y-8">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-brand-navy">Nouveau code</h2>
        <form onSubmit={onCreate} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="code" required placeholder="Code (ex : BIENVENUE10)" className={`${inputClass} uppercase`} />
          <select value={type} onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED")} className={inputClass}>
            <option value="PERCENTAGE">Pourcentage (%)</option>
            <option value="FIXED">Montant fixe (FCFA)</option>
          </select>
          <input name="discountValue" type="number" step="any" min="0" required
            placeholder={type === "PERCENTAGE" ? "Remise en %" : "Remise en FCFA"} className={inputClass} />
          <input name="minOrderAmount" type="number" min="0" placeholder="Achat minimum (FCFA, optionnel)" className={inputClass} />
          {type === "PERCENTAGE" ? (
            <input name="maxDiscount" type="number" min="0" placeholder="Remise maximale (FCFA, optionnel)" className={inputClass} />
          ) : null}
          <input name="usageLimit" type="number" min="1" placeholder="Nombre d'utilisations max (optionnel)" className={inputClass} />
          <label className="text-xs text-neutral-500 sm:col-span-2">
            Expire le (optionnel)
            <input name="endsAt" type="datetime-local" className={`${inputClass} mt-1`} />
          </label>
          <div className="sm:col-span-2">
            <button disabled={pending}
              className="bg-brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {pending ? "Enregistrement…" : "Créer le code"}
            </button>
          </div>
        </form>
        {error ? <p className="mt-3 text-sm text-brand-red">{error}</p> : null}
      </section>

      <section>
        {coupons.length === 0 ? (
          <p className="text-sm text-neutral-500">Aucun code promo pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {coupons.map((c) => {
              const expired = c.endsAt ? new Date(c.endsAt) < new Date() : false;
              const exhausted = c.usageLimit !== null && c.usageCount >= c.usageLimit;
              const status = !c.isActive ? "Désactivé" : expired ? "Expiré" : exhausted ? "Épuisé" : "Actif";
              return (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
                  <div>
                    <p className="font-mono text-sm font-bold text-brand-navy">{c.code}</p>
                    <p className="text-xs text-neutral-500">
                      {c.discountType === "PERCENTAGE" ? `${c.discountValue} %` : formatPrice(c.discountValue)}
                      {c.minOrderAmount > 0 ? ` · dès ${formatPrice(c.minOrderAmount)}` : ""}
                      {c.maxDiscount ? ` · plafonné à ${formatPrice(c.maxDiscount)}` : ""}
                      {c.endsAt ? ` · jusqu'au ${new Date(c.endsAt).toLocaleDateString("fr-FR")}` : ""}
                    </p>
                    <p className="text-xs text-neutral-400">
                      Utilisé {c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""} fois
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-navy">{status}</span>
                    <button disabled={pending} onClick={() => onToggle(c.id, !c.isActive)}
                      className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-brand-navy disabled:opacity-60">
                      {c.isActive ? "Désactiver" : "Activer"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
