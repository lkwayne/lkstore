import { FlagProductsPage } from "@/components/FlagProductsPage";

export const dynamic = "force-dynamic";

export const metadata = { title: "Nouveautés — SENDUU" };

export default async function NouveautesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  return (
    <FlagProductsPage
      flag="is_new"
      basePath="/nouveautes"
      title="Nouveautés"
      subtitle="Les derniers produits arrivés sur SENDUU."
      emptyMessage="Aucune nouveauté mise en avant pour le moment."
      searchParams={await searchParams}
    />
  );
}
