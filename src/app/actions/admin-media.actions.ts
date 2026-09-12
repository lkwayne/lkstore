"use server";

import { revalidatePath } from "next/cache";
import {
  uploadProductMedia,
  removeProductMedia,
  listProductMedia,
  type ProductMediaItem,
} from "@/services/product-media.service";

export async function getProductMedia(productId: string): Promise<ProductMediaItem[]> {
  return listProductMedia(productId);
}

export async function uploadMedia(
  productId: string,
  formData: FormData
): Promise<{ success: boolean; uploaded: number; errors: string[] }> {
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return { success: false, uploaded: 0, errors: ["Aucun fichier reçu."] };
  }

  try {
    const result = await uploadProductMedia(productId, files);
    revalidatePath(`/admin/products/${productId}/edit`);
    return { success: result.uploaded > 0, uploaded: result.uploaded, errors: result.errors };
  } catch (err) {
    return {
      success: false,
      uploaded: 0,
      errors: [err instanceof Error ? err.message : "Erreur inconnue."],
    };
  }
}

export async function deleteMedia(
  productId: string,
  mediaId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await removeProductMedia(mediaId);
    revalidatePath(`/admin/products/${productId}/edit`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
}
