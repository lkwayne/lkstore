import { describe, it, expect } from "vitest";
import { mapProductSummary } from "@/services/catalog.service";

describe("mapProductSummary", () => {
  it("choisit l'image avec le plus petit sort_order comme image principale", () => {
    const result = mapProductSummary({
      id: "p1",
      name: "Produit test",
      slug: "produit-test",
      price: 1000,
      compare_at_price: null,
      stock_quantity: 5,
      brand: null,
      product_images: [
        { url: "https://example.com/b.jpg", sort_order: 2 },
        { url: "https://example.com/a.jpg", sort_order: 0 },
      ],
    });

    expect(result.primaryImageUrl).toBe("https://example.com/a.jpg");
  });

  it("retourne null pour l'image quand le produit n'en a aucune", () => {
    const result = mapProductSummary({
      id: "p1",
      name: "Produit test",
      slug: "produit-test",
      price: 1000,
      compare_at_price: null,
      stock_quantity: 5,
      brand: null,
      product_images: [],
    });

    expect(result.primaryImageUrl).toBeNull();
  });

  it("mappe correctement la marque quand présente", () => {
    const result = mapProductSummary({
      id: "p1",
      name: "Produit test",
      slug: "produit-test",
      price: 1000,
      compare_at_price: 1200,
      stock_quantity: 5,
      brand: { id: "b1", name: "Samsung", slug: "samsung" },
      product_images: [],
    });

    expect(result.brand).toEqual({ id: "b1", name: "Samsung", slug: "samsung" });
    expect(result.compareAtPrice).toBe(1200);
  });
});
