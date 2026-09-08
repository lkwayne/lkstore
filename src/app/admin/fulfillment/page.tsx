import { listFulfillmentOrders } from "@/services/supplier-admin.service";
import { FulfillmentRowEditor } from "@/components/admin/FulfillmentRowEditor";

export const dynamic = "force-dynamic";

export default async function AdminFulfillmentPage() {
  const items = await listFulfillmentOrders();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Commandes fournisseur</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Suivi des articles en dropshipping, {items.length} entrée
        {items.length > 1 ? "s" : ""}.
      </p>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">
          Aucune commande fournisseur pour le moment — elles apparaissent
          automatiquement dès qu&rsquo;un client commande un article en
          dropshipping ou mixte.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Commande</th>
                <th className="px-4 py-3 font-medium">Produit</th>
                <th className="px-4 py-3 font-medium">Fournisseur</th>
                <th className="px-4 py-3 font-medium">Qté</th>
                <th className="px-4 py-3 font-medium">Statut / Suivi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-semibold text-brand-navy">
                    {item.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{item.productName}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {item.supplierName ?? "Aucun fournisseur assigné"}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{item.quantity}</td>
                  <td className="px-4 py-3">
                    <FulfillmentRowEditor
                      id={item.id}
                      status={item.status}
                      trackingNumber={item.trackingNumber}
                    />
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
