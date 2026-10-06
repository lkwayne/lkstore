import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Pages privées ou sans intérêt pour la recherche.
        disallow: [
          "/admin",
          "/account",
          "/cart",
          "/checkout",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/wishlist",
          "/track-order",
          "/search",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
