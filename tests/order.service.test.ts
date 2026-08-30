import { describe, it, expect } from "vitest";
import { buildCreateOrderPayload } from "@/services/order.service";
import type { CheckoutInput } from "@/schemas/order.schema";

const baseInput: CheckoutInput = {
  customerFirstName: "Jean",
  customerLastName: "Mballa",
  customerPhone: "690000000",
  customerEmail: "",
  receptionMethod: "DELIVERY",
  paymentMethod: "CASH_ON_DELIVERY",
  shippingZoneId: "05c64ed6-6291-4e03-bff6-0452c3217fcf",
  addressLine: "Rue 123, Bepanda",
  instructions: "",
};

const items = [{ productId: "p1", quantity: 2 }];

describe("buildCreateOrderPayload", () => {
  it("inclut la zone de livraison et l'adresse pour une commande DELIVERY", () => {
    const payload = buildCreateOrderPayload(baseInput, items);
    expect(payload.reception_method).toBe("DELIVERY");
    expect(payload.shipping_zone_id).toBe(baseInput.shippingZoneId);
    expect(payload.address_line).toBe("Rue 123, Bepanda");
    expect(payload.store_id).toBeUndefined();
  });

  it("mappe les articles du panier en snake_case", () => {
    const payload = buildCreateOrderPayload(baseInput, items);
    expect(payload.items).toEqual([{ product_id: "p1", quantity: 2 }]);
  });

  it("inclut le magasin et omet l'adresse pour une commande STORE_PICKUP", () => {
    const pickupInput: CheckoutInput = {
      ...baseInput,
      receptionMethod: "STORE_PICKUP",
      paymentMethod: "PAY_IN_STORE",
      storeId: "e7d04ff6-2f34-4bf1-abc3-fbc10fa7d4a6",
    };
    const payload = buildCreateOrderPayload(pickupInput, items);
    expect(payload.store_id).toBe(pickupInput.storeId);
    expect(payload.shipping_zone_id).toBeUndefined();
    expect(payload.address_line).toBeUndefined();
  });

  it("convertit un email vide en null", () => {
    const payload = buildCreateOrderPayload(baseInput, items);
    expect(payload.customer_email).toBeNull();
  });
});
