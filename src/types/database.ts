/**
 * Types du schéma Supabase, alignés à la main sur
 * `supabase/migrations/0001_init.sql`.
 *
 * Ce fichier ne couvre pour l'instant que les tables consommées par le code
 * applicatif (catalogue). Une fois un vrai projet Supabase connecté,
 * remplace-le par les types générés automatiquement :
 *
 *   npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts
 *
 * Complète les tables manquantes ici au fur et à mesure que de nouveaux
 * services sont branchés (commandes, fournisseurs, staff...), pour garder
 * une vraie sécurité de type en attendant la génération automatique.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
      };
      subcategories: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subcategories"]["Row"]> & {
          category_id: string;
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["subcategories"]["Row"]>;
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["brands"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["brands"]["Row"]>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sku: string;
          description: string | null;
          brand_id: string | null;
          category_id: string | null;
          subcategory_id: string | null;
          price: number;
          compare_at_price: number | null;
          cost_price: number | null;
          stock_quantity: number;
          low_stock_threshold: number;
          fulfillment_type: "SENDUU_STOCK" | "DROPSHIPPING" | "MIXED";
          cod_available: boolean;
          store_pickup_available: boolean;
          status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          name: string;
          slug: string;
          sku: string;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["product_images"]["Row"]> & {
          product_id: string;
          url: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Row"]>;
      };
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          role:
            | "CUSTOMER"
            | "ADMIN"
            | "MANAGER"
            | "LOGISTICS"
            | "CUSTOMER_SUPPORT"
            | "MARKETING";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      shipping_zones: {
        Row: {
          id: string;
          city: string;
          neighborhood: string | null;
          fee: number;
          estimated_days: number;
          cod_allowed: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["shipping_zones"]["Row"]> & {
          city: string;
        };
        Update: Partial<Database["public"]["Tables"]["shipping_zones"]["Row"]>;
      };
      stores: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          phone: string | null;
          opening_hours: Json | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["stores"]["Row"]> & {
          name: string;
          address: string;
          city: string;
        };
        Update: Partial<Database["public"]["Tables"]["stores"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
