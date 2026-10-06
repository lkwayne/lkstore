import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductForEdit } from "@/services/admin-catalog.service";
import { guardPage } from "@/services/auth.service";
import { can } from "@/config/permissions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await guardPage("catalog.manage");
  const canEditCosts = can(user.profile?.role, "costs.view");
  const { id } = await params;
  const product = await getProductForEdit(id, canEditCosts);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Modifier le produit</h1>
      <div className="mt-6">
        <ProductForm productId={id} defaultValues={product} canEditCosts={canEditCosts} />
      </div>
    </div>
  );
}
