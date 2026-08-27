// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { readCartFromStorage, writeCartToStorage } from "@/lib/cart-storage";

describe("cart-storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("retourne un panier vide quand rien n'est stocké", () => {
    expect(readCartFromStorage()).toEqual([]);
  });

  it("relit exactement ce qui a été écrit", () => {
    writeCartToStorage([{ productId: "p1", quantity: 2 }]);
    expect(readCartFromStorage()).toEqual([{ productId: "p1", quantity: 2 }]);
  });

  it("ignore les lignes corrompues (quantité manquante ou négative)", () => {
    window.localStorage.setItem(
      "bendo_cart_v1",
      JSON.stringify([
        { productId: "p1", quantity: 2 },
        { productId: "p2" },
        { productId: "p3", quantity: -1 },
        { quantity: 3 },
      ])
    );
    expect(readCartFromStorage()).toEqual([{ productId: "p1", quantity: 2 }]);
  });

  it("ne plante pas sur un JSON invalide", () => {
    window.localStorage.setItem("bendo_cart_v1", "{not-json");
    expect(readCartFromStorage()).toEqual([]);
  });
});
