import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductForEdit } from "@/services/admin-catalog.service";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductForEdit(id);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Modifier le produit</h1>
      <div className="mt-6">
        <ProductForm productId={id} defaultValues={product} />
      </div>
    </div>
  );
}
