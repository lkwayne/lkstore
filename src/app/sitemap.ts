import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getSiteUrl } from "@/config/site";

// Régénéré toutes les heures : un nouveau produit apparaît dans le sitemap sans redéploiement.
export const revalidate = 3600;

type SlugRow = { slug: string; updated_at?: string | null };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/categories`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/flash-deals`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/promotions`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/nouveautes`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/meilleures-ventes`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const [cats, prods] = await Promise.all([
      supabase
        .from("categories")
        .select("slug")
        .eq("is_active", true)
        .eq("is_visible", true)
        .returns<SlugRow[]>(),
      supabase
        .from("products")
        .select("slug, updated_at")
        .eq("status", "PUBLISHED")
        .returns<SlugRow[]>(),
    ]);

    for (const c of cats.data ?? []) {
      entries.push({
        url: `${base}/categories/${c.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
    for (const p of prods.data ?? []) {
      entries.push({
        url: `${base}/products/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Base injoignable : on publie quand même les pages statiques.
  }

  return entries;
}
