import { guardPage } from "@/services/auth.service";
import { listAllZones } from "@/services/shipping-admin.service";
import { ShippingZoneManager } from "@/components/admin/ShippingZoneManager";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  await guardPage("shipping.manage");
  const zones = await listAllZones();
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Livraison</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Tarifs et délais par quartier. Un quartier désactivé n&rsquo;apparaît plus au paiement.
      </p>
      <ShippingZoneManager zones={zones} />
    </div>
  );
}
