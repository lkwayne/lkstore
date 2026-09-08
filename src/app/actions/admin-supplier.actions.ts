"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supplierSchema, supplierProductSchema, type SupplierInput, type SupplierProductInput } from "@/schemas/supplier.schema";
import {
  createSupplier,
  updateSupplier,
  addSupplierProduct,
  removeSupplierProduct,
  updateFulfillmentOrder,
} from "@/services/supplier-admin.service";

export type AdminActionResult = { success: true } | { success: false; error: string };

export async function saveNewSupplier(input: SupplierInput): Promise<AdminActionResult> {
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Certains champs du formulaire sont invalides." };
  }
  let id: string;
  try {
    id = await createSupplier(parsed.data);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath("/admin/suppliers");
  redirect(`/admin/suppliers/${id}/edit`);
}

export async function saveExistingSupplier(
  id: string,
  input: SupplierInput
): Promise<AdminActionResult> {
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Certains champs du formulaire sont invalides." };
  }
  try {
    await updateSupplier(id, parsed.data);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath(`/admin/suppliers/${id}/edit`);
  return { success: true };
}

export async function linkProductToSupplier(
  supplierId: string,
  input: SupplierProductInput
): Promise<AdminActionResult> {
  const parsed = supplierProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Certains champs sont invalides." };
  }
  try {
    await addSupplierProduct(supplierId, parsed.data);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath(`/admin/suppliers/${supplierId}/edit`);
  return { success: true };
}

export async function unlinkProductFromSupplier(
  supplierId: string,
  linkId: string
): Promise<AdminActionResult> {
  try {
    await removeSupplierProduct(linkId);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath(`/admin/suppliers/${supplierId}/edit`);
  return { success: true };
}

export async function changeFulfillmentOrder(
  id: string,
  values: { status?: string; trackingNumber?: string }
): Promise<AdminActionResult> {
  try {
    await updateFulfillmentOrder(id, values);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath("/admin/fulfillment");
  return { success: true };
}
