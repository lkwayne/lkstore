/**
 * Configuration de marque BENDO — source unique pour les éléments
 * réutilisés dans le header, le footer et les métadonnées.
 */

export const BRAND = {
  name: "BENDO",
  tagline: "Tout ce qu'il vous faut.",
  colors: {
    navy: "#001C4A",
    orange: "#FD8701",
    red: "#FB1C32",
  },
} as const;

export const MAIN_NAV = [
  { label: "Accueil", href: "/" },
  { label: "Catégories", href: "/categories" },
  { label: "Promotions", href: "/promotions" },
  { label: "Nouveautés", href: "/nouveautes" },
  { label: "Meilleures ventes", href: "/meilleures-ventes" },
  { label: "Contact", href: "/contact" },
] as const;
