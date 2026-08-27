/**
 * Calcul de marge — strictement réservé au back-office (ADMIN / MANAGER).
 * Ne jamais importer ce module dans un composant exposé au client final.
 */

export interface MarginInput {
  sellingPrice: number;
  productCost: number;
  shippingCost?: number;
  otherFees?: number;
}

export interface MarginResult {
  estimatedMargin: number;
  marginPercentage: number;
}

export function calculateMargin({
  sellingPrice,
  productCost,
  shippingCost = 0,
  otherFees = 0,
}: MarginInput): MarginResult {
  const estimatedMargin = sellingPrice - productCost - shippingCost - otherFees;
  const marginPercentage =
    sellingPrice > 0 ? (estimatedMargin / sellingPrice) * 100 : 0;

  return {
    estimatedMargin: Number(estimatedMargin.toFixed(2)),
    marginPercentage: Number(marginPercentage.toFixed(2)),
  };
}
