import { describe, it, expect } from "vitest";
import { calculateMargin } from "@/services/margin.service";

describe("calculateMargin", () => {
  it("calcule une marge positive correctement", () => {
    const result = calculateMargin({
      sellingPrice: 10000,
      productCost: 6000,
      shippingCost: 1000,
    });
    expect(result.estimatedMargin).toBe(3000);
    expect(result.marginPercentage).toBe(30);
  });

  it("gère une marge négative", () => {
    const result = calculateMargin({
      sellingPrice: 5000,
      productCost: 6000,
    });
    expect(result.estimatedMargin).toBe(-1000);
    expect(result.marginPercentage).toBeLessThan(0);
  });

  it("retourne 0% si le prix de vente est nul", () => {
    const result = calculateMargin({ sellingPrice: 0, productCost: 100 });
    expect(result.marginPercentage).toBe(0);
  });
});
