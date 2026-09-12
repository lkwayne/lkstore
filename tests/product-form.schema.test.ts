import { describe, it, expect } from "vitest";
import { toProductInput, fromProductInput, type ProductFormInput } from "@/schemas/product-form.schema";
import type { ProductInput } from "@/schemas/product.schema";

const baseForm: ProductFormInput = {
  name: "Samsung Galaxy A15",
  slug: "samsung-galaxy-a15",
  sku: "TEL-SAM-A15",
  condition: "NEUF",
  description: "",
  brandId: null,
  categoryId: null,
  subcategoryId: null,
  realPrice: 100000,
  promoPrice: null,
  costPrice: null,
  stockQuantity: 10,
  lowStockThreshold: 5,
  fulfillmentType: "SENDUU_STOCK",
  codAvailable: true,
  storePickupAvailable: false,
  status: "PUBLISHED",
};

describe("toProductInput", () => {
  it("sans prix promo : le prix réel est facturé, pas de prix barré", () => {
    const result = toProductInput(baseForm);
    expect(result.price).toBe(100000);
    expect(result.compareAtPrice).toBeNull();
  });

  it("avec prix promo : le promo est facturé, le prix réel devient le prix barré", () => {
    const result = toProductInput({ ...baseForm, promoPrice: 79900 });
    expect(result.price).toBe(79900);
    expect(result.compareAtPrice).toBe(100000);
  });

  it("ignore un prix promo à 0", () => {
    const result = toProductInput({ ...baseForm, promoPrice: 0 });
    expect(result.price).toBe(100000);
    expect(result.compareAtPrice).toBeNull();
  });

  it("transmet l'état neuf/occasion tel quel", () => {
    const result = toProductInput({ ...baseForm, condition: "OCCASION" });
    expect(result.condition).toBe("OCCASION");
  });
});

describe("fromProductInput", () => {
  const publishedProduct: ProductInput = {
    name: "Samsung Galaxy A15",
    slug: "samsung-galaxy-a15",
    sku: "TEL-SAM-A15",
    condition: "NEUF",
    description: "",
    brandId: null,
    categoryId: null,
    subcategoryId: null,
    price: 100000,
    compareAtPrice: null,
    costPrice: null,
    stockQuantity: 10,
    lowStockThreshold: 5,
    fulfillmentType: "SENDUU_STOCK",
    codAvailable: true,
    storePickupAvailable: false,
    status: "PUBLISHED",
    imageUrl: "",
  };

  it("sans promo active : prix réel = price, pas de prix promo", () => {
    const result = fromProductInput(publishedProduct);
    expect(result.realPrice).toBe(100000);
    expect(result.promoPrice).toBeNull();
  });

  it("avec promo active : reconstitue prix réel et prix promo depuis compareAtPrice/price", () => {
    const result = fromProductInput({
      ...publishedProduct,
      price: 79900,
      compareAtPrice: 100000,
    });
    expect(result.realPrice).toBe(100000);
    expect(result.promoPrice).toBe(79900);
  });

  it("aller-retour toProductInput(fromProductInput(x)) préserve le prix facturé", () => {
    const withPromo: ProductInput = { ...publishedProduct, price: 79900, compareAtPrice: 100000 };
    const roundTrip = toProductInput(fromProductInput(withPromo) as ProductFormInput);
    expect(roundTrip.price).toBe(79900);
    expect(roundTrip.compareAtPrice).toBe(100000);
  });
});
