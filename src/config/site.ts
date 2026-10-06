/** Identité publique du site — utilisée par le SEO (sitemap, balises de partage, données structurées). */
export const SITE_NAME = "SENDUU";
export const SITE_TAGLINE = "Achetez mieux, payez moins, nous livrons";
export const SITE_DESCRIPTION =
  "SENDUU, votre boutique en ligne au Cameroun : téléphones, informatique, électroménager, mode et bien plus. Livraison et retrait en magasin.";

/**
 * URL publique du site, sans slash final. Priorité : NEXT_PUBLIC_SITE_URL
 * (à régler sur le vrai domaine dès qu'il existe), puis le domaine de
 * production Vercel, puis l'adresse actuelle du site.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://lkstore-ten.vercel.app");
  return raw.replace(/\/+$/, "");
}

/** Sérialise des données structurées JSON-LD sans risque d'injection de balise. */
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
