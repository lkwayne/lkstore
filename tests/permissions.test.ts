import { describe, expect, it } from "vitest";
import { can, ROLE_PERMISSIONS } from "@/config/permissions";
import { USER_ROLES } from "@/config/enums";

describe("droits par rôle", () => {
  it("seul le super admin gère l'équipe", () => {
    for (const role of USER_ROLES) {
      expect(can(role, "team.manage")).toBe(role === "SUPER_ADMIN");
    }
  });
  it("le marketing ne voit ni commandes, ni coûts, ni fournisseurs", () => {
    expect(can("MARKETING", "orders.manage")).toBe(false);
    expect(can("MARKETING", "costs.view")).toBe(false);
    expect(can("MARKETING", "suppliers.manage")).toBe(false);
    expect(can("MARKETING", "catalog.manage")).toBe(true);
  });
  it("la logistique traite commandes et dropshipping sans voir les coûts", () => {
    expect(can("LOGISTICS", "orders.manage")).toBe(true);
    expect(can("LOGISTICS", "fulfillment.manage")).toBe(true);
    expect(can("LOGISTICS", "costs.view")).toBe(false);
    expect(can("LOGISTICS", "catalog.manage")).toBe(false);
  });
  it("le support gère commandes et avis, sans finance", () => {
    expect(can("CUSTOMER_SUPPORT", "orders.manage")).toBe(true);
    expect(can("CUSTOMER_SUPPORT", "reviews.moderate")).toBe(true);
    expect(can("CUSTOMER_SUPPORT", "dashboard.finance")).toBe(false);
  });
  it("un client n'a aucun droit et un rôle inconnu non plus", () => {
    expect(ROLE_PERMISSIONS.CUSTOMER).toEqual([]);
    expect(can(null, "dashboard.view")).toBe(false);
    expect(can(undefined, "dashboard.view")).toBe(false);
  });
});
