import Link from "next/link";
import { listSuppliers } from "@/services/supplier-admin.service";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  PENDING: "En attente",
  BLOCKED: "Bloqué",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "text-green-700 bg-green-50",
  INACTIVE: "text-neutral-500 bg-neutral-100",
  PENDING: "text-brand-orange bg-brand-surface",
  BLOCKED: "text-brand-red bg-brand-red/10",
};

export default async function AdminSuppliersPage() {
  const suppliers = await listSuppliers();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Fournisseurs</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {suppliers.length} fournisseur{suppliers.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/suppliers/new"
          className="bg-brand-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white"
        >
          + Nouveau fournisseur
        </Link>
      </div>

      {suppliers.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Aucun fournisseur pour le moment.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Fournisseur</th>
                <th className="px-4 py-3 font-medium">Pays</th>
                <th className="px-4 py-3 font-medium">Produits</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-navy">{s.name}</p>
                    {s.companyName ? (
                      <p className="text-xs text-neutral-400">{s.companyName}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{s.country ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-500">{s.productCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[s.status]}`}
                    >
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/suppliers/${s.id}/edit`}
                      className="text-xs font-semibold text-brand-orange hover:underline"
                    >
                      Gérer
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
