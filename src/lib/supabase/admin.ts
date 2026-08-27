import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * ⚠️ Client Supabase avec la clé service_role — bypass RLS complet.
 *
 * À utiliser UNIQUEMENT :
 * - dans des Server Actions / Route Handlers déjà protégés par une vérification
 *   de rôle explicite (ex: ADMIN, MANAGER) ;
 * - jamais importé dans un composant client ni exposé au navigateur.
 *
 * SUPABASE_SERVICE_ROLE_KEY ne doit jamais être préfixée NEXT_PUBLIC_.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "createAdminClient() ne doit jamais être appelé côté navigateur."
    );
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
