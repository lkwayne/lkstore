import { createClient } from "@supabase/supabase-js";

/**
 * Client navigateur dédié à la réinitialisation du mot de passe.
 *
 * Flux « implicit » volontaire : le lien reçu par email contient directement
 * la session de récupération (dans le fragment d'URL), il fonctionne donc même
 * s'il est ouvert dans un autre navigateur que celui de la demande — cas
 * courant sur mobile (appli mail → navigateur intégré). Le flux PKCE, lui,
 * exige le même navigateur. Aucune session n'est persistée ici : la
 * connexion normale reste gérée par les cookies serveur (@supabase/ssr).
 */
export function createRecoveryClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "implicit",
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: true,
      },
    }
  );
}
