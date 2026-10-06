import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { formatPrice } from "@/lib/format-price";
import { trackOrder } from "@/services/track-order.service";

export const dynamic = "force-dynamic";
export const metadata = { title: "Suivi de commande — SENDUU" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Commande reçue",
  CONFIRMED: "Commande confirmée",
  PROCESSING: "En préparation",
  READY_FOR_PICKUP: "Prête à retirer en magasin",
  SHIPPED: "Expédiée",
  OUT_FOR_DELIVERY: "En cours de livraison",
  DELIVERED: "Livrée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  RETURNED: "Retournée",
};

const STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ commande?: string; telephone?: string }>;
}) {
  const { commande = "", telephone = "" } = await searchParams;
  const searched = commande.trim() !== "" && telephone.trim() !== "";
  const result = searched ? await trackOrder(commande, telephone) : null;

  const order = result && "found" in result && result.found ? result.order : null;
  const stepIndex = order ? STEPS.indexOf(order.status) : -1;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">Suivi de commande</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Entrez votre numéro de commande et le téléphone utilisé à la commande.
          </p>

          <form method="GET" className="mt-6 space-y-3">
            <input
              name="commande"
              defaultValue={commande}
              placeholder="N° de commande (SEN-2026-XXXXXX)"
              required
              className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm"
            />
            <input
              name="telephone"
              defaultValue={telephone}
              inputMode="tel"
              placeholder="Téléphone (ex. 6XX XX XX XX)"
              required
              className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm"
            />
            <button
              type="submit"
              className="bg-brand-gradient w-full rounded-full px-6 py-3 text-sm font-semibold text-white"
            >
              Suivre ma commande
            </button>
          </form>

          {result && "error" in result ? (
            <p className="mt-6 text-sm text-brand-red">{result.error}</p>
          ) : null}

          {result && "found" in result && !result.found ? (
            <p className="mt-6 rounded-xl bg-brand-surface p-4 text-sm text-neutral-600">
              Aucune commande ne correspond à ces informations. Vérifiez le numéro et le téléphone
              saisis lors de la commande.
            </p>
          ) : null}

          {order ? (
            <section className="mt-8 rounded-2xl border border-neutral-100 p-5">
              <p className="text-xs uppercase tracking-wide text-neutral-400">{order.orderNumber}</p>
              <p className="mt-1 text-xl font-bold text-brand-navy">
                {STATUS_LABELS[order.status] ?? order.status}
              </p>
              <p className="text-xs text-neutral-400">
                Mise à jour le {new Date(order.updatedAt).toLocaleString("fr-FR")}
              </p>

              {stepIndex >= 0 ? (
                <ol className="mt-5 space-y-2">
                  {STEPS.map((s, i) => (
                    <li
                      key={s}
                      className={`flex items-center gap-2 text-sm ${
                        i <= stepIndex ? "font-semibold text-brand-navy" : "text-neutral-300"
                      }`}
                    >
                      <span aria-hidden>{i <= stepIndex ? "●" : "○"}</span>
                      {STATUS_LABELS[s]}
                    </li>
                  ))}
                </ol>
              ) : null}

              <ul className="mt-5 space-y-1 border-t border-neutral-100 pt-4 text-sm text-neutral-600">
                {order.items.map((it, i) => (
                  <li key={i}>
                    {it.quantity} × {it.name}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm font-semibold text-brand-navy">
                Total : {formatPrice(order.total)} ·{" "}
                {order.paymentMethod === "PAY_IN_STORE" ? "paiement en magasin" : "paiement à la livraison"}
              </p>
            </section>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
