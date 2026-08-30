import { describe, it, expect } from "vitest";
import { checkoutSchema } from "@/schemas/order.schema";

const validContact = {
  customerFirstName: "Jean",
  customerLastName: "Mballa",
  customerPhone: "690000000",
  customerEmail: "",
};

describe("checkoutSchema", () => {
  it("exige une zone et une adresse pour une livraison", () => {
    const result = checkoutSchema.safeParse({
      ...validContact,
      receptionMethod: "DELIVERY",
      paymentMethod: "CASH_ON_DELIVERY",
    });
    expect(result.success).toBe(false);
  });

  it("accepte une livraison complète", () => {
    const result = checkoutSchema.safeParse({
      ...validContact,
      receptionMethod: "DELIVERY",
      paymentMethod: "CASH_ON_DELIVERY",
      shippingZoneId: "05c64ed6-6291-4e03-bff6-0452c3217fcf",
      addressLine: "Rue 123",
    });
    expect(result.success).toBe(true);
  });

  it("exige un magasin pour un retrait en magasin", () => {
    const result = checkoutSchema.safeParse({
      ...validContact,
      receptionMethod: "STORE_PICKUP",
      paymentMethod: "PAY_IN_STORE",
    });
    expect(result.success).toBe(false);
  });

  it("accepte un retrait en magasin complet", () => {
    const result = checkoutSchema.safeParse({
      ...validContact,
      receptionMethod: "STORE_PICKUP",
      paymentMethod: "PAY_IN_STORE",
      storeId: "e7d04ff6-2f34-4bf1-abc3-fbc10fa7d4a6",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un numéro de téléphone invalide", () => {
    const result = checkoutSchema.safeParse({
      ...validContact,
      customerPhone: "abc",
      receptionMethod: "STORE_PICKUP",
      paymentMethod: "PAY_IN_STORE",
      storeId: "e7d04ff6-2f34-4bf1-abc3-fbc10fa7d4a6",
    });
    expect(result.success).toBe(false);
  });
});
