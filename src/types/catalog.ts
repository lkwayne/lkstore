/**
 * Types applicatifs du catalogue, alignés sur supabase/migrations/0001_init.sql.
 * À remplacer par les types générés (`supabase gen types`) une fois le projet
 * Supabase réel connecté — voir src/types/database.ts.
 */

import type { FulfillmentType, ProductCondition, ProductStatus } from "@/config/enums";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

/**
 * Vue publique d'un produit — jamais de coût, marge ou fournisseur ici.
 */
export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  condition: ProductCondition;
  brand: Pick<Brand, "id" | "name" | "slug"> | null;
  primaryImageUrl: string | null;
  averageRating: number | null;
  reviewCount: number;
}

export interface ProductDetail extends ProductSummary {
  description: string | null;
  category: Pick<Category, "id" | "name" | "slug"> | null;
  subcategory: Pick<Subcategory, "id" | "name" | "slug"> | null;
  images: ProductImage[];
  fulfillmentType: FulfillmentType;
  codAvailable: boolean;
  storePickupAvailable: boolean;
  status: ProductStatus;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export type ProductSort = "relevance" | "price_asc" | "price_desc" | "newest";
