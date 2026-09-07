import Link from "next/link";
import { getDashboardStats } from "@/services/admin-stats.service";
import { formatPrice } from "@/lib/format-price";
import { ORDER_STATUSES, type OrderStatus } from "@/config/enums";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  READY_FOR_PICKUP: "Prête pour retrait",
  SHIPPED: "Expédiée",
  OUT_FOR_DELIVERY: "En livraison",
  DELIVERED: "Livrée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  RETURNED: "Retournée",
};

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-brand-navy">{value}</p>
      {hint ? <p className="mt-1 text-xs text-neutral-400">{hint}</p> : null}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Tableau de bord</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Vue d&rsquo;ensemble de l&rsquo;activité SENDUU.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Chiffre d'affaires"
          value={formatPrice(stats.totalRevenue)}
          hint="Hors commandes annulées/retournées"
        />
        <StatCard label="Commandes" value={String(stats.orderCount)} />
        <StatCard label="Panier moyen" value={formatPrice(stats.averageBasket)} />
        <StatCard
          label="Stock faible"
          value={String(stats.lowStockCount)}
          hint="Produits publiés sous le seuil d'alerte"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-brand-navy">
            Commandes par statut
          </h2>
          {Object.keys(stats.ordersByStatus).length === 0 ? (
            <p className="mt-4 text-sm text-neutral-400">Aucune commande pour le moment.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {ORDER_STATUSES.filter((s) => stats.ordersByStatus[s]).map((status) => (
                <li key={status} className="flex items-center justify-between">
                  <span className="text-neutral-500">{STATUS_LABELS[status]}</span>
                  <span className="font-semibold text-brand-navy">
                    {stats.ordersByStatus[status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/orders"
            className="mt-4 inline-block text-xs font-semibold text-brand-orange hover:underline"
          >
            Voir toutes les commandes →
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-brand-navy">Meilleures ventes</h2>
          {stats.topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-400">
              Aucune vente enregistrée pour le moment.
            </p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {stats.topProducts.map((product) => (
                <li key={product.name} className="flex items-center justify-between">
                  <span className="text-neutral-500">{product.name}</span>
                  <span className="font-semibold text-brand-navy">
                    {product.quantitySold} vendu{product.quantitySold > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/products"
            className="mt-4 inline-block text-xs font-semibold text-brand-orange hover:underline"
          >
            Gérer les produits →
          </Link>
        </div>
      </div>
    </div>
  );
}
