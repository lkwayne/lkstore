/**
 * Configuration de marque SENDUU — source unique pour les éléments
 * réutilisés dans le header, le footer et les métadonnées.
 */

export const BRAND = {
  name: "SENDUU",
  tagline: "Achetez mieux, payez moins, nous livrons.",
  valueProps: ["Achetez mieux", "Payez moins", "Nous livrons"],
  colors: {
    navy: "#001C3D",
    orange: "#FD7601",
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
