import { FlagProductsPage } from "@/components/FlagProductsPage";

export const dynamic = "force-dynamic";

export const metadata = { title: "Flash Deals — SENDUU" };

export default async function FlashDealsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  return (
    <FlagProductsPage
      flag="is_flash_deal"
      basePath="/flash-deals"
      title="Flash Deals"
      subtitle="Offres à durée limitée, tant que le stock est disponible."
      emptyMessage="Aucun flash deal en cours pour le moment — revenez bientôt."
      searchParams={await searchParams}
    />
  );
}
