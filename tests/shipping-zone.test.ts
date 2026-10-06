import { describe, it, expect } from "vitest";
import { shippingZoneSchema, shippingZoneUpdateSchema } from "@/schemas/shipping-zone.schema";
import { can } from "@/config/permissions";

describe("shippingZoneSchema", () => {
  const ok = { city: "Yaoundé", neighborhood: "Bastos", fee: 1000, estimatedDays: 1, codAllowed: true };
  it("accepte une zone valide", () => {
    expect(shippingZoneSchema.safeParse(ok).success).toBe(true);
  });
  it("refuse tarif négatif, délai nul et quartier vide", () => {
    expect(shippingZoneSchema.safeParse({ ...ok, fee: -1 }).success).toBe(false);
    expect(shippingZoneSchema.safeParse({ ...ok, estimatedDays: 0 }).success).toBe(false);
    expect(shippingZoneSchema.safeParse({ ...ok, neighborhood: " " }).success).toBe(false);
  });
  it("la mise à jour exige l'état actif", () => {
    expect(shippingZoneUpdateSchema.safeParse({ fee: 1500, estimatedDays: 2, codAllowed: false, isActive: true }).success).toBe(true);
    expect(shippingZoneUpdateSchema.safeParse({ fee: 1500, estimatedDays: 2, codAllowed: false }).success).toBe(false);
  });
});

describe("permission shipping.manage", () => {
  it("admins, managers, super admins et logistique (comme la RLS)", () => {
    expect(can("SUPER_ADMIN", "shipping.manage")).toBe(true);
    expect(can("ADMIN", "shipping.manage")).toBe(true);
    expect(can("MANAGER", "shipping.manage")).toBe(true);
    expect(can("LOGISTICS", "shipping.manage")).toBe(true);
    expect(can("MARKETING", "shipping.manage")).toBe(false);
    expect(can("CUSTOMER", "shipping.manage")).toBe(false);
  });
});

describe("permission shipping.prices", () => {
  it("les tarifs sont fixés par admin, manager et super admin seulement", () => {
    expect(can("SUPER_ADMIN", "shipping.prices")).toBe(true);
    expect(can("ADMIN", "shipping.prices")).toBe(true);
    expect(can("MANAGER", "shipping.prices")).toBe(true);
    expect(can("LOGISTICS", "shipping.prices")).toBe(false);
    expect(can("MARKETING", "shipping.prices")).toBe(false);
  });
});
