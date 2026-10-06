"use server";

import { requirePermission } from "@/services/auth.service";
import { revalidatePath } from "next/cache";
import { categorySchema, subcategorySchema, type CategoryInput, type SubcategoryInput } from "@/schemas/category.schema";
import {
  createCategory,
  updateCategory,
  deleteCategoryIfEmpty,
  createSubcategory,
  updateSubcategory,
  deleteSubcategoryIfEmpty,
} from "@/services/admin-category.service";

export type AdminActionResult = { success: true } | { success: false; error: string };

export async function saveNewCategory(input: CategoryInput): Promise<AdminActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Certains champs du formulaire sont invalides." };
  }
  try {
    await requirePermission("catalog.manage");
    await createCategory(parsed.data);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function saveExistingCategory(
  id: string,
  input: CategoryInput
): Promise<AdminActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Certains champs du formulaire sont invalides." };
  }
  try {
    await requirePermission("catalog.manage");
    await updateCategory(id, parsed.data);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}/edit`);
  return { success: true };
}

export async function removeCategory(id: string): Promise<AdminActionResult> {
  try {
    await requirePermission("catalog.manage");
    await deleteCategoryIfEmpty(id);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function addSubcategory(
  categoryId: string,
  input: SubcategoryInput
): Promise<AdminActionResult> {
  const parsed = subcategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Certains champs sont invalides." };
  }
  try {
    await requirePermission("catalog.manage");
    await createSubcategory(categoryId, parsed.data);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath(`/admin/categories/${categoryId}/edit`);
  return { success: true };
}

export async function editSubcategory(
  id: string,
  categoryId: string,
  input: SubcategoryInput
): Promise<AdminActionResult> {
  const parsed = subcategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Certains champs sont invalides." };
  }
  try {
    await requirePermission("catalog.manage");
    await updateSubcategory(id, categoryId, parsed.data);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath(`/admin/categories/${categoryId}/edit`);
  return { success: true };
}

export async function removeSubcategory(
  id: string,
  categoryId: string
): Promise<AdminActionResult> {
  try {
    await requirePermission("catalog.manage");
    await deleteSubcategoryIfEmpty(id);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath(`/admin/categories/${categoryId}/edit`);
  return { success: true };
}
