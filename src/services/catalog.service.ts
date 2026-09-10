import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type {
  Category,
  PaginatedResult,
  ProductDetail,
  ProductSort,
  ProductSummary,
} from "@/types/catalog";

const DEFAULT_PAGE_SIZE = 12;

// Sélection publique stricte : jamais cost_price, jamais de jointure fournisseur.
const PRODUCT_SUMMARY_SELECT = `
  id, name, slug, price, compare_at_price, stock_quantity, condition,
  brand:brands ( id, name, slug ),
  product_images ( url, sort_order )
`;

export function mapProductSummary(row: Record<string, unknown>): ProductSummary {
  const images = (row.product_images as { url: string; sort_order: number }[] | null) ?? [];
  const primaryImage = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
  const brand = row.brand as { id: string; name: string; slug: string } | null;

  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    stockQuantity: Number(row.stock_quantity),
    condition: (row.condition as ProductSummary["condition"]) ?? "NEUF",
    brand: brand ? { id: brand.id, name: brand.name, slug: brand.slug } : null,
    primaryImageUrl: primaryImage?.url ?? null,
    // Les notes moyennes seront calculées via une vue Supabase dédiée
    // (reviews approuvées uniquement) une fois le module Avis branché.
    averageRating: null,
    reviewCount: 0,
  };
}

type CategoryRow = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "name" | "slug" | "image_url" | "sort_order"
>;

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, sort_order")
    .order("sort_order", { ascending: true })
    .returns<CategoryRow[]>();

  if (error) {
    throw new Error(`Impossible de charger les catégories : ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, sort_order")
    .eq("slug", slug)
    .maybeSingle()
    .returns<CategoryRow>();

  if (error) {
    throw new Error(`Impossible de charger la catégorie : ${error.message}`);
  }
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    imageUrl: data.image_url,
    sortOrder: data.sort_order,
  };
}

export async function getProductsByCategory(params: {
  categoryId: string;
  page?: number;
  pageSize?: number;
  sort?: ProductSort;
}): Promise<PaginatedResult<ProductSummary>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const sort = params.sort ?? "relevance";

  const supabase = await createClient();
  const baseQuery = supabase
    .from("products")
    .select(PRODUCT_SUMMARY_SELECT, { count: "exact" })
    .eq("status", "PUBLISHED")
    .eq("category_id", params.categoryId);

  const sortedQuery =
    sort === "price_asc"
      ? baseQuery.order("price", { ascending: true })
      : sort === "price_desc"
        ? baseQuery.order("price", { ascending: false })
        : baseQuery.order("created_at", { ascending: false });

  const { data, error, count } = await sortedQuery.range(from, to);

  if (error) {
    throw new Error(`Impossible de charger les produits : ${error.message}`);
  }

  const totalCount = count ?? 0;

  return {
    items: (data ?? []).map((row) => mapProductSummary(row as unknown as Record<string, unknown>)),
    page,
    pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, description, price, compare_at_price, stock_quantity, condition,
      fulfillment_type, cod_available, store_pickup_available, status,
      seo_title, seo_description,
      brand:brands ( id, name, slug ),
      category:categories ( id, name, slug ),
      subcategory:subcategories ( id, name, slug ),
      product_images ( id, url, alt_text, sort_order )
    `
    )
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (error) {
    throw new Error(`Impossible de charger le produit : ${error.message}`);
  }
  if (!data) return null;

  const row = data as unknown as Record<string, unknown>;
  const summary = mapProductSummary(row);
  const brand = row.brand as { id: string; name: string; slug: string } | null;
  const category = row.category as { id: string; name: string; slug: string } | null;
  const subcategory = row.subcategory as { id: string; name: string; slug: string } | null;
  const images = ((row.product_images as ProductDetail["images"] | null) ?? []).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return {
    ...summary,
    description: (row.description as string | null) ?? null,
    category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
    subcategory: subcategory
      ? { id: subcategory.id, name: subcategory.name, slug: subcategory.slug }
      : null,
    images,
    fulfillmentType: row.fulfillment_type as ProductDetail["fulfillmentType"],
    codAvailable: Boolean(row.cod_available),
    storePickupAvailable: Boolean(row.store_pickup_available),
    status: row.status as ProductDetail["status"],
    seoTitle: (row.seo_title as string | null) ?? null,
    seoDescription: (row.seo_description as string | null) ?? null,
    brand: brand ? { id: brand.id, name: brand.name, slug: brand.slug } : null,
  };
}

export async function searchProducts(params: {
  query: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<ProductSummary>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const trimmed = params.query.trim();
  if (!trimmed) {
    return { items: [], page, pageSize, totalCount: 0, totalPages: 1 };
  }

  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("products")
    .select(PRODUCT_SUMMARY_SELECT, { count: "exact" })
    .eq("status", "PUBLISHED")
    .or(`name.ilike.%${trimmed}%,sku.ilike.%${trimmed}%`)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Recherche impossible : ${error.message}`);
  }

  const totalCount = count ?? 0;

  return {
    items: (data ?? []).map((row) => mapProductSummary(row as unknown as Record<string, unknown>)),
    page,
    pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}

/**
 * Relit l'état actuel (prix, stock) d'une liste de produits depuis la base —
 * utilisé par le panier, qui ne fait jamais confiance à un prix envoyé par
 * le navigateur. Les produits dépubliés ou supprimés sont silencieusement
 * absents du résultat ; c'est à l'appelant de le signaler à l'utilisateur.
 */
export async function getProductsByIds(ids: string[]): Promise<ProductSummary[]> {
  if (ids.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SUMMARY_SELECT)
    .eq("status", "PUBLISHED")
    .in("id", ids);

  if (error) {
    throw new Error(`Impossible de recharger le panier : ${error.message}`);
  }

  return (data ?? []).map((row) => mapProductSummary(row as unknown as Record<string, unknown>));
}

type BrandRow = Pick<Database["public"]["Tables"]["brands"]["Row"], "id" | "name" | "slug">;

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug")
    .order("name", { ascending: true })
    .returns<BrandRow[]>();

  if (error) {
    throw new Error(`Impossible de charger les marques : ${error.message}`);
  }

  return data ?? [];
}

type SubcategoryRow = Pick<
  Database["public"]["Tables"]["subcategories"]["Row"],
  "id" | "category_id" | "name" | "slug"
>;

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
}

export async function getAllSubcategories(): Promise<Subcategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subcategories")
    .select("id, category_id, name, slug")
    .order("name", { ascending: true })
    .returns<SubcategoryRow[]>();

  if (error) {
    throw new Error(`Impossible de charger les sous-catégories : ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
  }));
}
