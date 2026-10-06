import { SupplierForm } from "@/components/admin/SupplierForm";
import { guardPage } from "@/services/auth.service";

export default async function NewSupplierPage() {
  await guardPage("suppliers.manage");
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Nouveau fournisseur</h1>
      <div className="mt-6">
        <SupplierForm />
      </div>
    </div>
  );
}
