import { FlagProductsPage } from "@/components/FlagProductsPage";

export const dynamic = "force-dynamic";

export const metadata = { title: "Meilleures ventes — SENDUU" };

export default async function MeilleuresVentesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  return (
    <FlagProductsPage
      flag="is_best_seller"
      basePath="/meilleures-ventes"
      title="Meilleures ventes"
      subtitle="Ce que les clients SENDUU préfèrent."
      emptyMessage="Aucune meilleure vente mise en avant pour le moment."
      searchParams={await searchParams}
    />
  );
}
