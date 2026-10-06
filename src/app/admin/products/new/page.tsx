import { ProductForm } from "@/components/admin/ProductForm";
import { guardPage } from "@/services/auth.service";
import { can } from "@/config/permissions";

export default async function NewProductPage() {
  const user = await guardPage("catalog.manage");
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Nouveau produit</h1>
      <div className="mt-6">
        <ProductForm canEditCosts={can(user.profile?.role, "costs.view")} />
      </div>
    </div>
  );
}
