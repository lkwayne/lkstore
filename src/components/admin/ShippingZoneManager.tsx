"use client";

import { useState, useTransition } from "react";
import { addZone, saveZone } from "@/app/actions/shipping-admin.actions";
import type { AdminZone } from "@/services/shipping-admin.service";

const inputClass =
  "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-orange focus:outline-none";

function ZoneRow({ zone }: { zone: AdminZone }) {
  const [fee, setFee] = useState(String(zone.fee));
  const [days, setDays] = useState(String(zone.estimatedDays));
  const [cod, setCod] = useState(zone.codAllowed);
  const [active, setActive] = useState(zone.isActive);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty =
    Number(fee) !== zone.fee ||
    Number(days) !== zone.estimatedDays ||
    cod !== zone.codAllowed ||
    active !== zone.isActive;

  function onSave() {
    setMsg(null);
    startTransition(async () => {
      const res = await saveZone(zone.id, {
        fee: Number(fee),
        estimatedDays: Number(days),
        codAllowed: cod,
        isActive: active,
      });
      setMsg(res.success ? "Enregistré" : res.error);
    });
  }

  return (
    <li className={`flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 ${active ? "" : "opacity-60"}`}>
      <span className="min-w-36 flex-1 text-sm font-medium text-brand-navy">{zone.neighborhood}</span>
      <label className="flex items-center gap-1 text-xs text-neutral-500">
        FCFA
        <input type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} className={`${inputClass} w-24`} />
      </label>
      <label className="flex items-center gap-1 text-xs text-neutral-500">
        Jours
        <input type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} className={`${inputClass} w-16`} />
      </label>
      <label className="flex items-center gap-1 text-xs text-neutral-500">
        <input type="checkbox" checked={cod} onChange={(e) => setCod(e.target.checked)} /> Paiement livraison
      </label>
      <label className="flex items-center gap-1 text-xs text-neutral-500">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Actif
      </label>
      <button disabled={!dirty || pending} onClick={onSave}
        className="rounded-full border border-brand-orange px-3 py-1 text-xs font-semibold text-brand-orange disabled:opacity-40">
        {pending ? "…" : "Enregistrer"}
      </button>
      {msg ? <span className={`text-xs ${msg === "Enregistré" ? "text-green-700" : "text-brand-red"}`}>{msg}</span> : null}
    </li>
  );
}

export function ShippingZoneManager({ zones }: { zones: AdminZone[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const cities = [...new Set(zones.map((z) => z.city))];

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    startTransition(async () => {
      const res = await addZone({
        city: String(fd.get("city") ?? ""),
        neighborhood: String(fd.get("neighborhood") ?? ""),
        fee: Number(fd.get("fee") ?? 0),
        estimatedDays: Number(fd.get("days") ?? 1),
        codAllowed: fd.get("cod") === "on",
      });
      if (res.success) form.reset();
      else setError(res.error);
    });
  }

  return (
    <div className="mt-6 space-y-8">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-brand-navy">Ajouter un quartier</h2>
        <form onSubmit={onAdd} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="city" list="cities" required placeholder="Ville" className={inputClass} />
          <datalist id="cities">{cities.map((c) => <option key={c} value={c} />)}</datalist>
          <input name="neighborhood" required placeholder="Quartier" className={inputClass} />
          <input name="fee" type="number" min="0" required placeholder="Tarif (FCFA)" className={inputClass} />
          <input name="days" type="number" min="1" defaultValue={1} required placeholder="Délai (jours)" className={inputClass} />
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input name="cod" type="checkbox" defaultChecked /> Paiement à la livraison autorisé
          </label>
          <div>
            <button disabled={pending}
              className="bg-brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {pending ? "Ajout…" : "Ajouter"}
            </button>
          </div>
        </form>
        {error ? <p className="mt-3 text-sm text-brand-red">{error}</p> : null}
      </section>

      {cities.map((city) => {
        const list = zones.filter((z) => z.city === city);
        return (
          <section key={city}>
            <h2 className="mb-3 font-semibold text-brand-navy">
              {city} <span className="text-xs font-normal text-neutral-400">· {list.length} quartiers</span>
            </h2>
            <ul className="space-y-2">
              {list.map((z) => (
                <ZoneRow key={z.id} zone={z} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
