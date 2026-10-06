import { createClient } from "@supabase/supabase-js";

export interface MenuSubcategory {
  name: string;
  slug: string;
  icon: string | null;
}

export interface MenuCategory {
  name: string;
  slug: string;
  icon: string | null;
  subcategories: MenuSubcategory[];
}

type CatRow = { id: string; name: string; slug: string; icon: string | null };
type SubRow = { category_id: string; name: string; slug: string; icon: string | null };

/**
 * Données publiques du méga-menu. Client sans cookies (les catégories sont
 * lisibles par tous) + revalidation toutes les 5 minutes : le header reste
 * compatible avec les pages statiques. N'échoue jamais — un menu vide vaut
 * mieux qu'un site cassé.
 */
export async function getMegaMenu(): Promise<MenuCategory[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          fetch: (input, init) =>
            fetch(input, { ...init, next: { revalidate: 300 } } as RequestInit),
        },
      }
    );

    const [cats, subs] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, icon")
        .eq("is_active", true)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true })
        .returns<CatRow[]>(),
      supabase
        .from("subcategories")
        .select("category_id, name, slug, icon")
        .eq("is_active", true)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true })
        .returns<SubRow[]>(),
    ]);

    if (cats.error || !cats.data) return [];
    const byCategory = new Map<string, MenuSubcategory[]>();
    for (const s of subs.data ?? []) {
      const list = byCategory.get(s.category_id) ?? [];
      list.push({ name: s.name, slug: s.slug, icon: s.icon });
      byCategory.set(s.category_id, list);
    }

    return cats.data.map((c) => ({
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      subcategories: byCategory.get(c.id) ?? [],
    }));
  } catch {
    return [];
  }
}
