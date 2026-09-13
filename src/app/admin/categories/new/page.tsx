import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Nouvelle catégorie</h1>
      <div className="mt-6">
        <CategoryForm />
      </div>
    </div>
  );
}
