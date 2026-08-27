export function StockBadge({ stockQuantity }: { stockQuantity: number }) {
  if (stockQuantity <= 0) {
    return (
      <span className="inline-flex w-fit items-center rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
        Rupture de stock
      </span>
    );
  }

  if (stockQuantity <= 5) {
    return (
      <span className="inline-flex w-fit items-center rounded-full bg-brand-orange/10 px-2.5 py-1 text-xs font-medium text-brand-orange">
        Stock limité
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
      En stock
    </span>
  );
}
