import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComingSoonSection } from "@/components/ComingSoonSection";

export default function AccountPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ComingSoonSection
          title="Mon compte"
          description="Connexion, historique de commandes et informations personnelles arrivent avec le module Authentification."
        />
      </main>
      <Footer />
    </>
  );
}
