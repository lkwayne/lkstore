import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { ShippingZone, Store } from "@/types/shipping";

type ShippingZoneRow = Pick<
  Database["public"]["Tables"]["shipping_zones"]["Row"],
  "id" | "city" | "neighborhood" | "fee" | "estimated_days" | "cod_allowed"
>;

type StoreRow = Pick<
  Database["public"]["Tables"]["stores"]["Row"],
  "id" | "name" | "address" | "city" | "phone"
>;

export async function getShippingZones(): Promise<ShippingZone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipping_zones")
    .select("id, city, neighborhood, fee, estimated_days, cod_allowed")
    .eq("is_active", true)
    .order("city", { ascending: true })
    .order("neighborhood", { ascending: true })
    .returns<ShippingZoneRow[]>();

  if (error) {
    throw new Error(`Impossible de charger les zones de livraison : ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    city: row.city,
    neighborhood: row.neighborhood,
    fee: Number(row.fee),
    estimatedDays: row.estimated_days,
    codAllowed: row.cod_allowed,
  }));
}

export async function getStores(): Promise<Store[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, address, city, phone")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .returns<StoreRow[]>();

  if (error) {
    throw new Error(`Impossible de charger les magasins : ${error.message}`);
  }

  return data ?? [];
}
