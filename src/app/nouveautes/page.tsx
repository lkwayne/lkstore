import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComingSoonSection } from "@/components/ComingSoonSection";

export default function NouveautesPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ComingSoonSection
          title="Nouveautés"
          description="Les derniers produits ajoutés au catalogue s'afficheront ici."
        />
      </main>
      <Footer />
    </>
  );
}
