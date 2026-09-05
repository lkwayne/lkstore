import { listOrdersForAdmin } from "@/services/order-admin.service";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";
import { formatPrice } from "@/lib/format-price";

export const dynamic = "force-dynamic";

const PAYMENT_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: "Paiement à la livraison",
  PAY_IN_STORE: "Paiement en magasin",
};

const RECEPTION_LABELS: Record<string, string> = {
  DELIVERY: "Livraison",
  STORE_PICKUP: "Retrait magasin",
};

export default async function AdminOrdersPage() {
  const orders = await listOrdersForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Commandes</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {orders.length} commande{orders.length > 1 ? "s" : ""} récente
        {orders.length > 1 ? "s" : ""}
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">
          Aucune commande pour le moment.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Commande</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Réception</th>
                <th className="px-4 py-3 font-medium">Paiement</th>
                <th className="px-4 py-3 font-medium">Articles</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-semibold text-brand-navy">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {RECEPTION_LABELS[order.receptionMethod] ?? order.receptionMethod}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                    <span className="ml-1 text-[11px] text-neutral-400">
                      ({order.paymentStatus})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{order.itemCount}</td>
                  <td className="px-4 py-3 font-semibold text-brand-navy">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect orderId={order.id} status={order.status} />
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
