import type { UserRole } from "@/config/enums";

/**
 * Droits par rôle — source unique côté application.
 * La base applique les mêmes groupes via les policies RLS (migration 0018) :
 * modifier ce fichier seul ne donne JAMAIS plus d'accès que la base ne le permet.
 */
export type Permission =
  | "dashboard.view" // tableau de bord (hors chiffres financiers)
  | "dashboard.finance" // chiffre d'affaires, panier moyen, ventes
  | "orders.manage" // voir et traiter les commandes
  | "catalog.manage" // produits, catégories, médias
  | "costs.view" // prix d'achat et marges
  | "suppliers.manage" // fournisseurs et liens produit-fournisseur
  | "fulfillment.manage" // commandes fournisseur (dropshipping)
  | "reviews.moderate" // avis clients
  | "team.manage"; // équipe et rôles

const MANAGERS: Permission[] = [
  "dashboard.view",
  "dashboard.finance",
  "orders.manage",
  "catalog.manage",
  "costs.view",
  "suppliers.manage",
  "fulfillment.manage",
  "reviews.moderate",
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [...MANAGERS, "team.manage"],
  ADMIN: MANAGERS,
  MANAGER: MANAGERS,
  LOGISTICS: ["dashboard.view", "orders.manage", "fulfillment.manage"],
  CUSTOMER_SUPPORT: ["dashboard.view", "orders.manage", "reviews.moderate"],
  MARKETING: ["dashboard.view", "catalog.manage", "reviews.moderate"],
  CUSTOMER: [],
};

export function can(role: UserRole | null | undefined, permission: Permission): boolean {
  return !!role && ROLE_PERMISSIONS[role]?.includes(permission) === true;
}
