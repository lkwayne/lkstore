import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComingSoonSection } from "@/components/ComingSoonSection";

export default function PromotionsPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ComingSoonSection
          title="Promotions"
          description="Les ventes flash et réductions SENDUU seront bientôt visibles ici."
        />
      </main>
      <Footer />
    </>
  );
}
