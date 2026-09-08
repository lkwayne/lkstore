import { SupplierForm } from "@/components/admin/SupplierForm";

export default function NewSupplierPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Nouveau fournisseur</h1>
      <div className="mt-6">
        <SupplierForm />
      </div>
    </div>
  );
}
