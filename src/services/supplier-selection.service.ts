/**
 * Sélection automatique du fournisseur prioritaire pour un produit donné.
 * Règle : privilégier le stock BENDO propre lorsqu'il est disponible ;
 * sinon choisir, parmi les fournisseurs ACTIVE avec du stock, celui avec
 * la priorité la plus basse (1 = priorité la plus haute).
 */

export interface SupplierProductOption {
  supplierId: string;
  supplierProductId: string;
  supplierStock: number;
  priority: number;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
}

export function selectPrimarySupplier(
  options: SupplierProductOption[]
): SupplierProductOption | null {
  const eligible = options.filter(
    (o) => o.status === "ACTIVE" && o.supplierStock > 0
  );

  if (eligible.length === 0) return null;

  return eligible.sort((a, b) => a.priority - b.priority)[0];
}

/**
 * Détermine si un produit peut être vendu maintenant.
 * Règle : ne jamais vendre un produit dont la disponibilité n'est pas fiable.
 */
export function isProductAvailableForSale(params: {
  bendoStock: number;
  dropshippingOptions: SupplierProductOption[];
}): boolean {
  if (params.bendoStock > 0) return true;
  return selectPrimarySupplier(params.dropshippingOptions) !== null;
}
