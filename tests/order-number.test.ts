import { describe, it, expect } from "vitest";
import { formatOrderNumber } from "@/lib/order-number";

describe("formatOrderNumber", () => {
  it("formate correctement avec padding sur 6 chiffres", () => {
    expect(formatOrderNumber(2026, 1)).toBe("BEN-2026-000001");
  });

  it("gère les séquences à plusieurs chiffres", () => {
    expect(formatOrderNumber(2026, 123456)).toBe("BEN-2026-123456");
  });
});
