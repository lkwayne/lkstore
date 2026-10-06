"use server";

import { revalidatePath } from "next/cache";
import { toggleWishlist } from "@/services/wishlist.service";

export type ToggleWishlistResult =
  | { success: true; added: boolean }
  | { success: false; error: string };

export async function toggleWishlistItem(productId: string): Promise<ToggleWishlistResult> {
  try {
    const result = await toggleWishlist(productId);
    revalidatePath("/wishlist");
    return { success: true, added: result.added };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}
