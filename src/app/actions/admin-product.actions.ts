"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { productSchema, type ProductInput } from "@/schemas/product.schema";
import {
  createProduct,
  updateProduct,
  setProductStock,
  setProductStatus,
} from "@/services/admin-catalog.service";

export type AdminActionResult = { success: true } | { success: false; error: string };

export async function saveNewProduct(input: ProductInput): Promise<AdminActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Certains champs du formulaire sont invalides." };
  }
  try {
    await createProduct(parsed.data);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function saveExistingProduct(
  id: string,
  input: ProductInput
): Promise<AdminActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Certains champs du formulaire sont invalides." };
  }
  try {
    await updateProduct(id, parsed.data);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function changeProductStock(
  id: string,
  stockQuantity: number
): Promise<AdminActionResult> {
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    return { success: false, error: "Quantité invalide." };
  }
  try {
    await setProductStock(id, stockQuantity);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath("/admin/products");
  return { success: true };
}

export async function changeProductStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
): Promise<AdminActionResult> {
  try {
    await setProductStatus(id, status);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath("/admin/products");
  return { success: true };
}
