import { notFound } from "next/navigation";
import { SupplierForm } from "@/components/admin/SupplierForm";
import { SupplierProductsSection } from "@/components/admin/SupplierProductsSection";
import {
  getSupplierForEdit,
  getLinkedProducts,
} from "@/services/supplier-admin.service";
import { getProductOptions } from "@/services/admin-catalog.service";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await getSupplierForEdit(id);
  if (!supplier) notFound();

  const [linkedProducts, productOptions] = await Promise.all([
    getLinkedProducts(id),
    getProductOptions(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Modifier le fournisseur</h1>
      <div className="mt-6">
        <SupplierForm supplierId={id} defaultValues={supplier} />
      </div>

      <div className="mt-10 max-w-xl">
        <SupplierProductsSection
          supplierId={id}
          initialProducts={linkedProducts}
          productOptions={productOptions}
        />
      </div>
    </div>
  );
}
