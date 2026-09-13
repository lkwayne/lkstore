import { createClient } from "@/lib/supabase/server";
import type { CategoryInput, SubcategoryInput } from "@/schemas/category.schema";

export interface AdminCategoryListItem {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  isVisible: boolean;
  subcategoryCount: number;
  productCount: number;
}

export interface AdminCategoryDetail extends CategoryInput {
  id: string;
}

export interface AdminSubcategoryItem extends SubcategoryInput {
  id: string;
  categoryId: string;
  productCount: number;
}

/**
 * Toutes les requêtes ci-dessous s'appuient sur les policies RLS
 * `categories_staff_write` / `subcategories_staff_write` — un compte
 * non-staff ne pourrait ni créer, ni modifier, ni voir les catégories
 * désactivées/masquées. Aucune vérification de rôle explicite ici.
 */
export async function listCategoriesForAdmin(): Promise<AdminCategoryListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, name, slug, sort_order, is_active, is_visible, subcategories(id), products(id)"
    )
    .order("sort_order");

  if (error) {
    throw new Error(`Impossible de charger les catégories : ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const r = row as unknown as Record<string, unknown>;
    return {
      id: r.id as string,
      name: r.name as string,
      slug: r.slug as string,
      sortOrder: r.sort_order as number,
      isActive: r.is_active as boolean,
      isVisible: r.is_visible as boolean,
      subcategoryCount: Array.isArray(r.subcategories) ? r.subcategories.length : 0,
      productCount: Array.isArray(r.products) ? r.products.length : 0,
    };
  });
}

export async function getCategoryForEdit(id: string): Promise<AdminCategoryDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, icon, sort_order, is_active, is_visible")
    .eq("id", id)
    .maybeSingle()
    .returns<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      image_url: string | null;
      icon: string | null;
      sort_order: number;
      is_active: boolean;
      is_visible: boolean;
    }>();

  if (error) {
    throw new Error(`Impossible de charger la catégorie : ${error.message}`);
  }
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description ?? "",
    imageUrl: data.image_url ?? "",
    icon: data.icon ?? "",
    sortOrder: data.sort_order,
    isActive: data.is_active,
    isVisible: data.is_visible,
  };
}

export async function getSubcategoriesForAdmin(
  categoryId: string
): Promise<AdminSubcategoryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subcategories")
    .select(
      "id, category_id, name, slug, description, image_url, icon, sort_order, is_active, is_visible, products(id)"
    )
    .eq("category_id", categoryId)
    .order("sort_order");

  if (error) {
    throw new Error(`Impossible de charger les sous-catégories : ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const r = row as unknown as Record<string, unknown>;
    return {
      id: r.id as string,
      categoryId: r.category_id as string,
      name: r.name as string,
      slug: r.slug as string,
      description: (r.description as string) ?? "",
      imageUrl: (r.image_url as string) ?? "",
      icon: (r.icon as string) ?? "",
      sortOrder: r.sort_order as number,
      isActive: r.is_active as boolean,
      isVisible: r.is_visible as boolean,
      productCount: Array.isArray(r.products) ? r.products.length : 0,
    };
  });
}

/**
 * Contourne le même problème d'inférence de type profonde que pour les
 * autres écritures via @supabase/ssr (voir order.service.ts,
 * admin-catalog.service.ts) — la sécurité réelle vient des policies RLS,
 * pas du typage TypeScript de ces appels.
 */
interface WriteBuilder {
  insert: (values: Record<string, unknown>) => {
    select: (columns: "id") => {
      single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
    };
  };
  update: (values: Record<string, unknown>) => {
    eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }>;
  };
  delete: () => {
    eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }>;
  };
}

function toCategoryRow(input: CategoryInput) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    image_url: input.imageUrl || null,
    icon: input.icon || null,
    sort_order: input.sortOrder,
    is_active: input.isActive,
    is_visible: input.isVisible,
  };
}

export async function createCategory(input: CategoryInput): Promise<string> {
  const supabase = await createClient();
  const table = supabase.from("categories") as unknown as WriteBuilder;
  const { data, error } = await table.insert(toCategoryRow(input)).select("id").single();
  if (error) {
    throw new Error(`Impossible de créer la catégorie : ${error.message}`);
  }
  return data!.id;
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  const supabase = await createClient();
  const table = supabase.from("categories") as unknown as WriteBuilder;
  const { error } = await table.update(toCategoryRow(input)).eq("id", id);
  if (error) {
    throw new Error(`Impossible de mettre à jour la catégorie : ${error.message}`);
  }
}

export async function deleteCategoryIfEmpty(id: string): Promise<void> {
  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) {
    throw new Error(`Vérification impossible : ${countError.message}`);
  }
  if ((count ?? 0) > 0) {
    throw new Error(
      "Cette catégorie contient encore des produits — déplacez-les avant de la supprimer."
    );
  }

  const table = supabase.from("categories") as unknown as WriteBuilder;
  const { error } = await table.delete().eq("id", id);
  if (error) {
    throw new Error(`Impossible de supprimer la catégorie : ${error.message}`);
  }
}

function toSubcategoryRow(categoryId: string, input: SubcategoryInput) {
  return {
    category_id: categoryId,
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    image_url: input.imageUrl || null,
    icon: input.icon || null,
    sort_order: input.sortOrder,
    is_active: input.isActive,
    is_visible: input.isVisible,
  };
}

export async function createSubcategory(
  categoryId: string,
  input: SubcategoryInput
): Promise<string> {
  const supabase = await createClient();
  const table = supabase.from("subcategories") as unknown as WriteBuilder;
  const { data, error } = await table
    .insert(toSubcategoryRow(categoryId, input))
    .select("id")
    .single();
  if (error) {
    throw new Error(`Impossible de créer la sous-catégorie : ${error.message}`);
  }
  return data!.id;
}

export async function updateSubcategory(
  id: string,
  categoryId: string,
  input: SubcategoryInput
): Promise<void> {
  const supabase = await createClient();
  const table = supabase.from("subcategories") as unknown as WriteBuilder;
  const { error } = await table.update(toSubcategoryRow(categoryId, input)).eq("id", id);
  if (error) {
    throw new Error(`Impossible de mettre à jour la sous-catégorie : ${error.message}`);
  }
}

export async function deleteSubcategoryIfEmpty(id: string): Promise<void> {
  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("subcategory_id", id);

  if (countError) {
    throw new Error(`Vérification impossible : ${countError.message}`);
  }
  if ((count ?? 0) > 0) {
    throw new Error(
      "Cette sous-catégorie contient encore des produits — déplacez-les avant de la supprimer."
    );
  }

  const table = supabase.from("subcategories") as unknown as WriteBuilder;
  const { error } = await table.delete().eq("id", id);
  if (error) {
    throw new Error(`Impossible de supprimer la sous-catégorie : ${error.message}`);
  }
}
