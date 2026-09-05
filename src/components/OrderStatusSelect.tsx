"use client";

import { useState, useTransition } from "react";
import { changeOrderStatus } from "@/app/actions/admin-order.actions";
import { ORDER_STATUSES, type OrderStatus } from "@/config/enums";

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

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: OrderStatus) {
    const previous = current;
    setCurrent(next);
    setError(null);
    startTransition(async () => {
      const result = await changeOrderStatus(orderId, next);
      if (!result.success) {
        setCurrent(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <select
        value={current}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs font-medium text-brand-navy disabled:opacity-60"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-[11px] text-brand-red">{error}</p> : null}
    </div>
  );
}
