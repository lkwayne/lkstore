import { guardPage } from "@/services/auth.service";
import { can } from "@/config/permissions";
import { listAllZones } from "@/services/shipping-admin.service";
import { ShippingZoneManager } from "@/components/admin/ShippingZoneManager";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const user = await guardPage("shipping.manage");
  const canEditPrices = can(user.profile?.role, "shipping.prices");
  const zones = await listAllZones();
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Livraison</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Tarifs et délais par quartier. Un quartier désactivé n&rsquo;apparaît plus au paiement.
        {canEditPrices ? "" : " Les tarifs sont fixés par un admin ou un manager."}
      </p>
      <ShippingZoneManager zones={zones} canEditPrices={canEditPrices} />
    </div>
  );
}
