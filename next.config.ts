import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Placeholders utilisés par le seed de démonstration — à retirer une
      // fois les vraies photos produit hébergées sur Supabase Storage.
      { protocol: "https", hostname: "placehold.co" },
      // Supabase Storage (bucket public de photos produit/catégories).
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;
