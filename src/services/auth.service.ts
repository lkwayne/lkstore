import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Database } from "@/types/database";
import { can, type Permission } from "@/config/permissions";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface CurrentUser {
  id: string;
  email: string | null;
  profile: Profile | null;
}

/**
 * Retourne l'utilisateur connecté et son profil, ou null si personne n'est
 * connecté. Ne lance jamais d'erreur pour une absence de session — c'est un
 * état normal, pas un échec.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { id: user.id, email: user.email ?? null, profile: profile ?? null };
}

export function isStaffRole(role: Profile["role"] | undefined | null): boolean {
  return !!role && role !== "CUSTOMER";
}

/**
 * Garde explicite pour les actions d'administration : en plus des règles RLS
 * de la base, on refuse l'appel dès l'entrée si l'utilisateur n'est pas staff.
 */
export async function requireStaff(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.profile?.role)) {
    throw new Error("Accès réservé à l'équipe.");
  }
  return user;
}

/** Réservé aux super administrateurs (gestion de l'équipe et des rôles). */
export async function requireSuperAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || user.profile?.role !== "SUPER_ADMIN") {
    throw new Error("Action réservée aux super administrateurs.");
  }
  return user;
}

/** Garde pour les actions serveur : staff ET possédant la permission demandée. */
export async function requirePermission(permission: Permission): Promise<CurrentUser> {
  const user = await requireStaff();
  if (!can(user.profile?.role, permission)) {
    throw new Error("Votre rôle n'a pas accès à cette fonction.");
  }
  return user;
}

/** Garde pour les pages du back-office : redirige vers /admin si non autorisé. */
export async function guardPage(permission: Permission): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !can(user.profile?.role, permission)) redirect("/admin");
  return user;
}
