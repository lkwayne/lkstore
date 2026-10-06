import { CategoryForm } from "@/components/admin/CategoryForm";
import { guardPage } from "@/services/auth.service";

export default async function NewCategoryPage() {
  await guardPage("catalog.manage");
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Nouvelle catégorie</h1>
      <div className="mt-6">
        <CategoryForm />
      </div>
    </div>
  );
}
