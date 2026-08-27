import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Client Supabase à utiliser dans les Client Components.
 * Ne jamais utiliser ce client pour des opérations sensibles
 * (rôle service, bypass RLS) — utiliser lib/supabase/admin.ts côté serveur uniquement.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
