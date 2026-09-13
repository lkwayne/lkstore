import { FlagProductsPage } from "@/components/FlagProductsPage";

export const dynamic = "force-dynamic";

export const metadata = { title: "Promotions — SENDUU" };

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  return (
    <FlagProductsPage
      flag="is_on_sale"
      basePath="/promotions"
      title="Promotions"
      subtitle="Les meilleures réductions du moment."
      emptyMessage="Aucune promotion en cours pour le moment — revenez bientôt."
      searchParams={await searchParams}
    />
  );
}
