import Link from "next/link";
import { listCategoriesForAdmin } from "@/services/admin-category.service";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await listCategoriesForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Catégories</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {categories.length} catégorie{categories.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-brand-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white"
        >
          + Nouvelle catégorie
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Aucune catégorie pour le moment.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium">Sous-catégories</th>
                <th className="px-4 py-3 font-medium">Produits</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-navy">{c.name}</p>
                    <p className="text-xs text-neutral-400">/{c.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{c.subcategoryCount}</td>
                  <td className="px-4 py-3 text-neutral-500">{c.productCount}</td>
                  <td className="px-4 py-3">
                    {c.isActive && c.isVisible ? (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
                        Masquée
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/categories/${c.id}/edit`}
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
