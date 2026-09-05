import { describe, it, expect } from "vitest";
import {
  selectPrimarySupplier,
  isProductAvailableForSale,
  type SupplierProductOption,
} from "@/services/supplier-selection.service";

const baseOption: SupplierProductOption = {
  supplierId: "s1",
  supplierProductId: "sp1",
  supplierStock: 10,
  priority: 1,
  status: "ACTIVE",
};

describe("selectPrimarySupplier", () => {
  it("choisit le fournisseur avec la priorité la plus haute (valeur la plus basse)", () => {
    const options: SupplierProductOption[] = [
      { ...baseOption, supplierId: "s1", priority: 2 },
      { ...baseOption, supplierId: "s2", priority: 1 },
    ];
    const result = selectPrimarySupplier(options);
    expect(result?.supplierId).toBe("s2");
  });

  it("ignore les fournisseurs sans stock", () => {
    const options: SupplierProductOption[] = [
      { ...baseOption, supplierId: "s1", supplierStock: 0, priority: 1 },
      { ...baseOption, supplierId: "s2", supplierStock: 5, priority: 2 },
    ];
    expect(selectPrimarySupplier(options)?.supplierId).toBe("s2");
  });

  it("ignore les fournisseurs non ACTIVE", () => {
    const options: SupplierProductOption[] = [
      { ...baseOption, supplierId: "s1", status: "BLOCKED" },
    ];
    expect(selectPrimarySupplier(options)).toBeNull();
  });

  it("retourne null si aucune option éligible", () => {
    expect(selectPrimarySupplier([])).toBeNull();
  });
});

describe("isProductAvailableForSale", () => {
  it("disponible si le stock SENDUU est positif, même sans fournisseur", () => {
    expect(
      isProductAvailableForSale({ ownStock: 3, dropshippingOptions: [] })
    ).toBe(true);
  });

  it("disponible si un fournisseur actif a du stock", () => {
    expect(
      isProductAvailableForSale({
        ownStock: 0,
        dropshippingOptions: [baseOption],
      })
    ).toBe(true);
  });

  it("indisponible si ni stock SENDUU ni fournisseur fiable", () => {
    expect(
      isProductAvailableForSale({
        ownStock: 0,
        dropshippingOptions: [{ ...baseOption, status: "BLOCKED" }],
      })
    ).toBe(false);
  });
});
