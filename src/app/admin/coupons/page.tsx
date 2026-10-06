import { guardPage } from "@/services/auth.service";
import { listCoupons } from "@/services/coupon.service";
import { CouponManager } from "@/components/admin/CouponManager";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await guardPage("catalog.manage");
  const coupons = await listCoupons();
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Codes promo</h1>
      <p className="mt-1 text-sm text-neutral-500">
        La remise s&rsquo;applique sur les articles, jamais sur la livraison.
      </p>
      <CouponManager coupons={coupons} />
    </div>
  );
}
