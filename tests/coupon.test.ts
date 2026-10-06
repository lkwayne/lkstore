import { describe, it, expect } from "vitest";
import { couponInputSchema } from "@/schemas/coupon.schema";
import { buildCreateOrderPayload } from "@/services/order.service";

const base = { discountType: "PERCENTAGE" as const, discountValue: 10 };

describe("couponInputSchema", () => {
  it("met le code en majuscules", () => {
    const r = couponInputSchema.parse({ ...base, code: " bienvenue10 " });
    expect(r.code).toBe("BIENVENUE10");
  });
  it("refuse un pourcentage > 100", () => {
    expect(couponInputSchema.safeParse({ ...base, code: "ABC", discountValue: 150 }).success).toBe(false);
  });
  it("accepte un montant fixe > 100", () => {
    expect(couponInputSchema.safeParse({ code: "ABC", discountType: "FIXED", discountValue: 2000 }).success).toBe(true);
  });
  it("refuse les caractères spéciaux et les valeurs nulles", () => {
    expect(couponInputSchema.safeParse({ ...base, code: "A B!" }).success).toBe(false);
    expect(couponInputSchema.safeParse({ ...base, code: "ABC", discountValue: 0 }).success).toBe(false);
  });
});

describe("buildCreateOrderPayload — promo", () => {
  const input = {
    customerFirstName: "A", customerLastName: "B", customerPhone: "699999999",
    customerEmail: "a@b.cm", receptionMethod: "STORE_PICKUP" as const,
    paymentMethod: "PAY_IN_STORE" as const, storeId: "00000000-0000-4000-8000-000000000000",
  };
  const items = [{ productId: "p1", quantity: 1 }];
  it("transmet le code mais jamais un montant de remise", () => {
    const p = buildCreateOrderPayload({ ...input, couponCode: "PROMO" }, items, "u1");
    expect(p.coupon_code).toBe("PROMO");
    expect(p.customer_id).toBe("u1");
    expect(p).not.toHaveProperty("discount");
  });
  it("omet code et client si absents", () => {
    const p = buildCreateOrderPayload(input, items);
    expect(p).not.toHaveProperty("coupon_code");
    expect(p).not.toHaveProperty("customer_id");
  });
});
