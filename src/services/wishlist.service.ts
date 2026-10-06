import { createClient } from "@/lib/supabase/server";
import { getProductsByIds } from "@/services/catalog.service";
import type { ProductSummary } from "@/types/catalog";

/**
 * Inférence supabase-js via @supabase/ssr : le typage de la table renvoie
 * `never`. On expose donc une vue minimale et explicite du query builder.
 */
type WishlistRow = { id: string; product_id: string };
type WishlistTable = {
  select: (cols: string) => {
    eq: (col: string, val: string) => WishlistFilter;
  };
  delete: () => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> };
  insert: (row: { customer_id: string; product_id: string }) => Promise<{ error: { message: string } | null }>;
};
type WishlistFilter = PromiseLike<{ data: WishlistRow[] | null; error: { message: string } | null }> & {
  eq: (col: string, val: string) => WishlistFilter & {
    maybeSingle: () => Promise<{ data: WishlistRow | null; error: { message: string } | null }>;
  };
  order: (col: string, opts: { ascending: boolean }) => WishlistFilter;
};

async function wishlistTable(): Promise<WishlistTable> {
  const supabase = await createClient();
  return supabase.from("wishlists") as unknown as WishlistTable;
}

/**
 * Toutes les requêtes s'appuient sur la policy RLS `wishlists_owner_only`
 * (`customer_id = auth.uid()`) — un visiteur non connecté n'a tout
 * simplement aucune ligne à lire ou écrire ici.
 */
export async function getWishlistProductIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await (await wishlistTable())
    .select("product_id")
    .eq("customer_id", user.id);

  if (error) {
    throw new Error(`Impossible de charger vos favoris : ${error.message}`);
  }

  return new Set((data ?? []).map((row) => row.product_id));
}

export async function getWishlistProducts(): Promise<ProductSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await (await wishlistTable())
    .select("product_id")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Impossible de charger vos favoris : ${error.message}`);
  }

  const orderedIds = (data ?? []).map((row) => row.product_id);
  if (orderedIds.length === 0) return [];

  const products = await getProductsByIds(orderedIds);
  const byId = new Map(products.map((p) => [p.id, p]));
  // Conserve l'ordre "ajouté le plus récemment en premier".
  return orderedIds.map((id) => byId.get(id)).filter((p): p is ProductSummary => Boolean(p));
}

export async function toggleWishlist(
  productId: string
): Promise<{ added: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Connectez-vous pour ajouter des favoris.");
  }

  const table = await wishlistTable();
  const { data: existing, error: findError } = await table
    .select("id")
    .eq("customer_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (findError) {
    throw new Error(`Impossible de vérifier vos favoris : ${findError.message}`);
  }

  if (existing) {
    const { error } = await table.delete().eq("id", existing.id);
    if (error) {
      throw new Error(`Impossible de retirer ce favori : ${error.message}`);
    }
    return { added: false };
  }

  const { error } = await table
    .insert({ customer_id: user.id, product_id: productId });
  if (error) {
    throw new Error(`Impossible d'ajouter ce favori : ${error.message}`);
  }
  return { added: true };
}
