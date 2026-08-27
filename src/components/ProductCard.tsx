import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/types/catalog";
import { formatPrice } from "@/lib/format-price";
import { StockBadge } from "@/components/StockBadge";

export function ProductCard({ product }: { product: ProductSummary }) {
  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100
      )
    : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-shadow hover:shadow-lg hover:shadow-neutral-200/60"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-brand-surface">
        {product.primaryImageUrl ? (
          <Image
            src={product.primaryImageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
            Image à venir
          </div>
        )}
        {discountPercent ? (
          <span className="bg-brand-gradient absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-semibold text-white">
            -{discountPercent}%
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.brand ? (
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            {product.brand.name}
          </span>
        ) : null}

        <h3 className="line-clamp-2 text-sm font-medium text-brand-navy">
          {product.name}
        </h3>

        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-base font-bold text-brand-navy">
            {formatPrice(product.price)}
          </span>
          {hasDiscount ? (
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          ) : null}
        </div>

        <StockBadge stockQuantity={product.stockQuantity} />
      </div>
    </Link>
  );
}
