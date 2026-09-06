"use server";

import { getCategories } from "@/services/catalog.service";
import { getBrands } from "@/services/admin-catalog.service";
import { createClient } from "@/lib/supabase/server";

export interface SubcategoryOption {
  id: string;
  categoryId: string;
  name: string;
}

export async function getProductFormOptions() {
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);

  const supabase = await createClient();
  const { data: subcategories, error } = await supabase
    .from("subcategories")
    .select("id, category_id, name")
    .order("name");

  if (error) {
    throw new Error(`Impossible de charger les sous-catégories : ${error.message}`);
  }

  return {
    categories,
    brands,
    subcategories: (subcategories ?? []).map((row) => {
      const r = row as unknown as Record<string, unknown>;
      return {
        id: r.id as string,
        categoryId: r.category_id as string,
        name: r.name as string,
      } satisfies SubcategoryOption;
    }),
  };
}
