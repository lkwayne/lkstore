"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import type { CartProductData } from "@/types/cart";

function MinusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CartLineItem({
  product,
  quantity,
  onQuantityChange,
  onRemove,
}: {
  product: CartProductData;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const isOutOfStock = product.stockQuantity <= 0;
  const isOverStock = quantity > product.stockQuantity && !isOutOfStock;

  return (
    <div className="flex gap-4 border-b border-neutral-100 py-5">
      <Link
        href={`/products/${product.slug}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-surface"
      >
        {product.primaryImageUrl ? (
          <Image
            src={product.primaryImageUrl}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-medium text-brand-navy hover:text-brand-orange"
          >
            {product.name}
          </Link>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Retirer ${product.name} du panier`}
            className="shrink-0 text-neutral-400 hover:text-brand-red"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        <span className="text-sm font-bold text-brand-navy">
          {formatPrice(product.price)}
        </span>

        {isOutOfStock ? (
          <p className="text-xs font-medium text-brand-red">
            Ce produit n&rsquo;est plus disponible — retirez-le pour
            continuer.
          </p>
        ) : isOverStock ? (
          <p className="text-xs font-medium text-brand-orange">
            Seulement {product.stockQuantity} en stock. Quantité ajustée
            automatiquement.
          </p>
        ) : null}

        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center rounded-full border border-neutral-200">
            <button
              type="button"
              onClick={() => onQuantityChange(quantity - 1)}
              disabled={isOutOfStock}
              aria-label="Diminuer la quantité"
              className="flex h-8 w-8 items-center justify-center text-brand-navy disabled:opacity-30"
            >
              <MinusIcon className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-brand-navy">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={isOutOfStock || quantity >= product.stockQuantity}
              aria-label="Augmenter la quantité"
              className="flex h-8 w-8 items-center justify-center text-brand-navy disabled:opacity-30"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
