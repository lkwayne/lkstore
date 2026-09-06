"use client";

import { useState, useTransition } from "react";
import {
  changeProductStock,
  changeProductStatus,
} from "@/app/actions/admin-product.actions";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

export function StockAndStatusEditor({
  productId,
  stockQuantity,
  status,
}: {
  productId: string;
  stockQuantity: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
  const [stock, setStock] = useState(stockQuantity);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function commitStock() {
    setError(null);
    startTransition(async () => {
      const result = await changeProductStock(productId, stock);
      if (!result.success) setError(result.error);
    });
  }

  function handleStatusChange(next: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    const previous = currentStatus;
    setCurrentStatus(next);
    setError(null);
    startTransition(async () => {
      const result = await changeProductStatus(productId, next);
      if (!result.success) {
        setCurrentStatus(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(Number(e.target.value))}
        onBlur={commitStock}
        disabled={isPending}
        className="w-16 rounded-lg border border-neutral-200 px-2 py-1 text-xs"
      />
      <select
        value={currentStatus}
        disabled={isPending}
        onChange={(e) => handleStatusChange(e.target.value as typeof currentStatus)}
        className="rounded-lg border border-neutral-200 px-2 py-1 text-xs"
      >
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {error ? <span className="text-[10px] text-brand-red">{error}</span> : null}
    </div>
  );
}
