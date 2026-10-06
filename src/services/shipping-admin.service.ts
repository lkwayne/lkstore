import { createAdminClient } from "@/lib/supabase/admin";
import {
  shippingZoneSchema,
  shippingZoneUpdateSchema,
  type ShippingZoneInput,
  type ShippingZoneUpdateInput,
} from "@/schemas/shipping-zone.schema";

export interface AdminZone {
  id: string;
  city: string;
  neighborhood: string;
  fee: number;
  estimatedDays: number;
  codAllowed: boolean;
  isActive: boolean;
}

// Même contournement de typage que les autres services admin : les appels
// sont typés à la main ; la sécurité vient de requirePermission + RLS.
type Err = { message: string } | null;
interface ZonesTable {
  select: (cols: string) => {
    order: (c: string, o: { ascending: boolean }) => {
      order: (c: string, o: { ascending: boolean }) => Promise<{ data: Record<string, unknown>[] | null; error: Err }>;
    };
  };
  insert: (v: Record<string, unknown>) => Promise<{ error: Err }>;
  update: (v: Record<string, unknown>) => { eq: (c: "id", v: string) => Promise<{ error: Err }> };
}
const table = () => createAdminClient().from("shipping_zones") as unknown as ZonesTable;

export async function listAllZones(): Promise<AdminZone[]> {
  const { data, error } = await table()
    .select("id, city, neighborhood, fee, estimated_days, cod_allowed, is_active")
    .order("city", { ascending: true })
    .order("fee", { ascending: true });
  if (error) throw new Error(`Impossible de charger les zones : ${error.message}`);
  return (data ?? [])
    .map((r) => ({
      id: r.id as string,
      city: r.city as string,
      neighborhood: (r.neighborhood as string | null) ?? "",
      fee: Number(r.fee),
      estimatedDays: Number(r.estimated_days),
      codAllowed: Boolean(r.cod_allowed),
      isActive: Boolean(r.is_active),
    }))
    .sort((a, b) => a.city.localeCompare(b.city) || a.fee - b.fee || a.neighborhood.localeCompare(b.neighborhood));
}

export async function createZone(input: ShippingZoneInput): Promise<void> {
  const parsed = shippingZoneSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Données invalides.");
  const d = parsed.data;
  const existing = await listAllZones();
  const dup = existing.some(
    (z) => z.city.toLowerCase() === d.city.toLowerCase() && z.neighborhood.toLowerCase() === d.neighborhood.toLowerCase()
  );
  if (dup) throw new Error("Ce quartier existe déjà dans cette ville.");
  const { error } = await table().insert({
    city: d.city,
    neighborhood: d.neighborhood,
    fee: d.fee,
    estimated_days: d.estimatedDays,
    cod_allowed: d.codAllowed,
    is_active: true,
  });
  if (error) throw new Error("Impossible d'ajouter ce quartier.");
}

export async function updateZone(id: string, input: ShippingZoneUpdateInput): Promise<void> {
  const parsed = shippingZoneUpdateSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Données invalides.");
  const d = parsed.data;
  const { error } = await table()
    .update({ fee: d.fee, estimated_days: d.estimatedDays, cod_allowed: d.codAllowed, is_active: d.isActive })
    .eq("id", id);
  if (error) throw new Error("Impossible de modifier cette zone.");
}
