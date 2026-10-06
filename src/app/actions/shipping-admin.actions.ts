"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/auth.service";
import { createZone, updateZone } from "@/services/shipping-admin.service";
import type { ShippingZoneInput, ShippingZoneUpdateInput } from "@/schemas/shipping-zone.schema";

type Result = { success: true } | { success: false; error: string };
const fail = (err: unknown): Result => ({
  success: false,
  error: err instanceof Error ? err.message : "Erreur inconnue.",
});

function refresh() {
  revalidatePath("/admin/shipping");
  revalidatePath("/checkout");
}

export async function addZone(input: ShippingZoneInput): Promise<Result> {
  try {
    await requirePermission("shipping.manage");
    await createZone(input);
    refresh();
    return { success: true };
  } catch (err) {
    return fail(err);
  }
}

export async function saveZone(id: string, input: ShippingZoneUpdateInput): Promise<Result> {
  try {
    await requirePermission("shipping.manage");
    await updateZone(id, input);
    refresh();
    return { success: true };
  } catch (err) {
    return fail(err);
  }
}
