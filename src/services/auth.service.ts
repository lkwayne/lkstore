import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

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
