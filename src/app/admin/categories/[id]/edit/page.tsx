import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { SubcategoriesSection } from "@/components/admin/SubcategoriesSection";
import {
  getCategoryForEdit,
  getSubcategoriesForAdmin,
} from "@/services/admin-category.service";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryForEdit(id);
  if (!category) notFound();

  const subcategories = await getSubcategoriesForAdmin(id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Modifier la catégorie</h1>
      <div className="mt-6">
        <CategoryForm categoryId={id} defaultValues={category} />
      </div>

      <div className="mt-10 max-w-xl">
        <SubcategoriesSection categoryId={id} initialSubcategories={subcategories} />
      </div>
    </div>
  );
}
