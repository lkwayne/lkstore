import { describe, it, expect } from "vitest";
import { supplierSchema, supplierProductSchema } from "@/schemas/supplier.schema";

describe("supplierSchema", () => {
  it("accepte un fournisseur minimal valide", () => {
    const result = supplierSchema.safeParse({ name: "Wei Chen" });
    expect(result.success).toBe(true);
  });

  it("applique la devise par défaut XAF", () => {
    const result = supplierSchema.parse({ name: "Wei Chen" });
    expect(result.currency).toBe("XAF");
  });

  it("rejette un email invalide", () => {
    const result = supplierSchema.safeParse({ name: "Wei Chen", email: "pas-un-email" });
    expect(result.success).toBe(false);
  });

  it("rejette un nom trop court", () => {
    const result = supplierSchema.safeParse({ name: "W" });
    expect(result.success).toBe(false);
  });
});

describe("supplierProductSchema", () => {
  const validProductId = "05c64ed6-6291-4e03-bff6-0452c3217fcf";

  it("accepte une association minimale valide", () => {
    const result = supplierProductSchema.safeParse({
      productId: validProductId,
      supplierCost: 2000,
    });
    expect(result.success).toBe(true);
  });

  it("rejette un productId invalide", () => {
    const result = supplierProductSchema.safeParse({
      productId: "pas-un-uuid",
      supplierCost: 2000,
    });
    expect(result.success).toBe(false);
  });

  it("rejette un coût négatif", () => {
    const result = supplierProductSchema.safeParse({
      productId: validProductId,
      supplierCost: -10,
    });
    expect(result.success).toBe(false);
  });

  it("rejette une priorité inférieure à 1", () => {
    const result = supplierProductSchema.safeParse({
      productId: validProductId,
      supplierCost: 2000,
      priority: 0,
    });
    expect(result.success).toBe(false);
  });
});
