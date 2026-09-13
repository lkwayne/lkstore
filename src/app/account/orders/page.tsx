import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/services/auth.service";
import { getOrdersForCustomer } from "@/services/order.service";
import { formatPrice } from "@/lib/format-price";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
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

const RECEPTION_LABELS: Record<string, string> = {
  DELIVERY: "Livraison",
  STORE_PICKUP: "Retrait magasin",
};

export default async function CustomerOrdersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const orders = await getOrdersForCustomer();

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <Link href="/account" className="text-xs font-semibold text-brand-orange hover:underline">
            ← Mon compte
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-brand-navy">Mes commandes</h1>

          {orders.length === 0 ? (
            <div className="mt-10 text-center">
              <p className="text-sm text-neutral-500">
                Vous n&rsquo;avez pas encore passé de commande.
              </p>
              <Link
                href="/categories"
                className="bg-brand-gradient mt-6 inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white"
              >
                Découvrir le catalogue
              </Link>
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
              {orders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-semibold text-brand-navy">{order.orderNumber}</p>
                    <p className="text-xs text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      · {RECEPTION_LABELS[order.receptionMethod] ?? order.receptionMethod} ·{" "}
                      {order.itemCount} article{order.itemCount > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-navy">{formatPrice(order.total)}</p>
                    <span className="text-xs text-neutral-500">
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
