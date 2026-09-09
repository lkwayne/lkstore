"use client";

import { useState, useTransition } from "react";
import { changeFulfillmentOrder } from "@/app/actions/admin-supplier.actions";
import { FULFILLMENT_ORDER_STATUSES } from "@/config/enums";

const STATUS_LABELS: Record<string, string> = {
  PENDING_SUPPLIER: "À envoyer au fournisseur",
  SENT_TO_SUPPLIER: "Envoyée au fournisseur",
  CONFIRMED_BY_SUPPLIER: "Confirmée par le fournisseur",
  SHIPPED: "Expédiée",
  TRACKING_RECEIVED: "Numéro de suivi reçu",
  DELIVERED: "Livrée",
  FAILED: "Échec",
};

export function FulfillmentRowEditor({
  id,
  status,
  trackingNumber,
}: {
  id: string;
  status: string;
  trackingNumber: string | null;
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleStatusChange(next: string) {
    const previous = currentStatus;
    setCurrentStatus(next);
    setError(null);
    startTransition(async () => {
      const result = await changeFulfillmentOrder(id, { status: next });
      if (!result.success) {
        setCurrentStatus(previous);
        setError(result.error);
      }
    });
  }

  function commitTracking() {
    setError(null);
    startTransition(async () => {
      const result = await changeFulfillmentOrder(id, { trackingNumber: tracking });
      if (!result.success) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={currentStatus}
        disabled={isPending}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs"
      >
        {FULFILLMENT_ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <input
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        onBlur={commitTracking}
        disabled={isPending}
        placeholder="N° de suivi transporteur"
        className="rounded-lg border border-neutral-200 px-2 py-1 text-xs"
      />
      {error ? <span className="text-[10px] text-brand-red">{error}</span> : null}
    </div>
  );
}
