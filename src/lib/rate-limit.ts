import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export const RATE_LIMIT_MESSAGE =
  "Trop de tentatives. Patientez quelques minutes avant de réessayer.";

/** IP du visiteur telle que transmise par le proxy (Vercel). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
  );
}

type RateLimitRpc = (
  fn: "rate_limit_hit",
  args: { p_key: string; p_max: number; p_window_seconds: number }
) => Promise<{ data: boolean | null; error: { message: string } | null }>;

/**
 * Retourne true si l'action est autorisée, false si la limite est dépassée.
 * En cas de panne du limiteur lui-même, on laisse passer : mieux vaut ne
 * jamais bloquer une vraie commande à cause d'un incident technique.
 */
export async function allowRequest(
  scope: string,
  identifier: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const rpc = supabase.rpc.bind(supabase) as unknown as RateLimitRpc;
    const { data, error } = await rpc("rate_limit_hit", {
      p_key: `${scope}:${identifier.toLowerCase().slice(0, 200)}`,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) return true;
    return data !== false;
  } catch {
    return true;
  }
}
