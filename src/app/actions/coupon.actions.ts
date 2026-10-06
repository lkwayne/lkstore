"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/auth.service";
import { createCoupon, previewCoupon, setCouponActive, type CouponPreview } from "@/services/coupon.service";
import type { CouponInput } from "@/schemas/coupon.schema";
import { allowRequest, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

type Result = { success: true } | { success: false; error: string };
const fail = (err: unknown): Result => ({
  success: false,
  error: err instanceof Error ? err.message : "Erreur inconnue.",
});

/** Public (checkout) : limité pour empêcher de deviner des codes à la chaîne. */
export async function applyCoupon(
  code: string,
  items: { productId: string; quantity: number }[]
): Promise<CouponPreview> {
  const ip = await getClientIp();
  if (!(await allowRequest("coupon:ip", ip, 20, 10 * 60))) {
    return { valid: false, discount: 0, code, message: RATE_LIMIT_MESSAGE };
  }
  return previewCoupon(code, items.slice(0, 50));
}

export async function addCoupon(input: CouponInput): Promise<Result> {
  try {
    await requirePermission("catalog.manage");
    await createCoupon(input);
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err) {
    return fail(err);
  }
}

export async function toggleCoupon(id: string, isActive: boolean): Promise<Result> {
  try {
    await requirePermission("catalog.manage");
    await setCouponActive(id, isActive);
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err) {
    return fail(err);
  }
}
