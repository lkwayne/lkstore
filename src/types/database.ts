/**
 * Types générés depuis le schéma Supabase.
 *
 * Ce fichier est un stub minimal permettant au projet de compiler avant la
 * première connexion à un projet Supabase réel. Une fois `supabase/migrations/0001_init.sql`
 * appliquée sur un projet Supabase, régénère les vrais types avec :
 *
 *   npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts
 *
 * Ne pas éditer ce fichier à la main une fois généré automatiquement.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
