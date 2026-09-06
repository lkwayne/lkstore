import { createClient } from "@/lib/supabase/server";
import type { ProductInput } from "@/schemas/product.schema";

export interface AdminProductListItem {
  id: string;
  name: string;
  sku: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  categoryName: string | null;
  primaryImageUrl: string | null;
}

export interface AdminProductDetail extends ProductInput {
  id: string;
}

export interface BrandOption {
  id: string;
  name: string;
}

/**
 * Toutes les requêtes ci-dessous s'appuient sur les policies RLS
 * `products_staff_write` / `products_public_read` : un compte non-staff ne
 * verrait que les produits publiés, jamais les brouillons — aucune
 * vérification de rôle explicite n'est faite ici.
 */
export async function listProductsForAdmin(): Promise<AdminProductListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, sku, status, price, stock_quantity, low_stock_threshold, category:categories(name), product_images(url, sort_order)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Impossible de charger les produits : ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const r = row as unknown as Record<string, unknown>;
    const images = (r.product_images as { url: string; sort_order: number }[]) ?? [];
    const primary = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
    const category = r.category as { name: string } | null;
    return {
      id: r.id as string,
      name: r.name as string,
      sku: r.sku as string,
      status: r.status as AdminProductListItem["status"],
      price: Number(r.price),
      stockQuantity: r.stock_quantity as number,
      lowStockThreshold: r.low_stock_threshold as number,
      categoryName: category?.name ?? null,
      primaryImageUrl: primary?.url ?? null,
    };
  });
}

export async function getProductForEdit(id: string): Promise<AdminProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, sku, description, brand_id, category_id, subcategory_id, price, compare_at_price, cost_price, stock_quantity, low_stock_threshold, fulfillment_type, cod_available, store_pickup_available, status"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Impossible de charger le produit : ${error.message}`);
  }
  if (!data) return null;

  const r = data as unknown as Record<string, unknown>;
  return {
    id: r.id as string,
    name: r.name as string,
    slug: r.slug as string,
    sku: r.sku as string,
    description: (r.description as string) ?? "",
    brandId: r.brand_id as string | null,
    categoryId: r.category_id as string | null,
    subcategoryId: r.subcategory_id as string | null,
    price: Number(r.price),
    compareAtPrice: r.compare_at_price != null ? Number(r.compare_at_price) : null,
    costPrice: r.cost_price != null ? Number(r.cost_price) : null,
    stockQuantity: r.stock_quantity as number,
    lowStockThreshold: r.low_stock_threshold as number,
    fulfillmentType: r.fulfillment_type as ProductInput["fulfillmentType"],
    codAvailable: r.cod_available as boolean,
    storePickupAvailable: r.store_pickup_available as boolean,
    status: r.status as ProductInput["status"],
    imageUrl: "",
  };
}

export async function getBrands(): Promise<BrandOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("brands").select("id, name").order("name");
  if (error) {
    throw new Error(`Impossible de charger les marques : ${error.message}`);
  }
  return data ?? [];
}

function toRow(input: ProductInput) {
  return {
    name: input.name,
    slug: input.slug,
    sku: input.sku,
    description: input.description || null,
    brand_id: input.brandId || null,
    category_id: input.categoryId || null,
    subcategory_id: input.subcategoryId || null,
    price: input.price,
    compare_at_price: input.compareAtPrice ?? null,
    cost_price: input.costPrice ?? null,
    stock_quantity: input.stockQuantity,
    low_stock_threshold: input.lowStockThreshold,
    fulfillment_type: input.fulfillmentType,
    cod_available: input.codAvailable,
    store_pickup_available: input.storePickupAvailable,
    status: input.status,
  };
}

/**
 * Contourne le même problème d'inférence de type profonde que pour les
 * autres écritures via @supabase/ssr (voir order.service.ts /
 * order-admin.service.ts) — la sécurité réelle vient de la policy RLS
 * `products_staff_write`, pas du typage TypeScript de cet appel.
 */
interface ProductsWriteBuilder {
  insert: (values: Record<string, unknown>) => {
    select: (columns: "id") => {
      single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
    };
  };
  update: (values: Record<string, unknown>) => {
    eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }>;
  };
}

export async function createProduct(input: ProductInput): Promise<string> {
  const supabase = await createClient();
  const table = supabase.from("products") as unknown as ProductsWriteBuilder;

  const { data, error } = await table.insert(toRow(input)).select("id").single();
  if (error) {
    throw new Error(`Impossible de créer le produit : ${error.message}`);
  }
  const productId = data!.id;

  if (input.imageUrl) {
    await addProductImage(productId, input.imageUrl);
  }

  return productId;
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  const supabase = await createClient();
  const table = supabase.from("products") as unknown as ProductsWriteBuilder;

  const { error } = await table.update(toRow(input)).eq("id", id);
  if (error) {
    throw new Error(`Impossible de mettre à jour le produit : ${error.message}`);
  }

  if (input.imageUrl) {
    await addProductImage(id, input.imageUrl);
  }
}

async function addProductImage(productId: string, url: string): Promise<void> {
  const supabase = await createClient();
  interface ImagesInsertBuilder {
    insert: (values: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  }
  const table = supabase.from("product_images") as unknown as ImagesInsertBuilder;
  await table.insert({ product_id: productId, url, sort_order: 0 });
}

export async function setProductStock(id: string, stockQuantity: number): Promise<void> {
  const supabase = await createClient();
  const table = supabase.from("products") as unknown as ProductsWriteBuilder;
  const { error } = await table.update({ stock_quantity: stockQuantity }).eq("id", id);
  if (error) {
    throw new Error(`Impossible de mettre à jour le stock : ${error.message}`);
  }
}

export async function setProductStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
): Promise<void> {
  const supabase = await createClient();
  const table = supabase.from("products") as unknown as ProductsWriteBuilder;
  const { error } = await table.update({ status }).eq("id", id);
  if (error) {
    throw new Error(`Impossible de mettre à jour le statut : ${error.message}`);
  }
}
