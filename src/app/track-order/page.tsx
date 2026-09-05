import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComingSoonSection } from "@/components/ComingSoonSection";

export default function TrackOrderPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ComingSoonSection
          title="Suivi de commande"
          description="Entrez votre numéro de commande SEN-XXXX-XXXXXX pour suivre sa livraison — fonctionnalité branchée avec le module Commandes."
        />
      </main>
      <Footer />
    </>
  );
}
