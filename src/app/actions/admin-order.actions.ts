"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@/services/order-admin.service";
import type { OrderStatus } from "@/config/enums";

export async function changeOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await updateOrderStatus(orderId, status);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}
