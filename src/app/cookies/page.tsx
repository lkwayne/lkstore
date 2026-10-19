import Link from "next/link";
import { LegalPage, Section } from "@/components/LegalPage";

export const metadata = { title: "Cookies — SENDUU" };

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies et stockage local"
      intro="Un cookie est un petit fichier enregistré dans votre navigateur. Le stockage local fonctionne de la même façon. Voici ce que SENDUU utilise, et rien d'autre."
    >
      <Section title="Ce que nous utilisons">
        <ul>
          <li>
            <strong>Cookies de session (indispensables)</strong> : lorsque vous vous connectez, notre service d&rsquo;authentification enregistre un cookie (dont le nom commence par « sb- ») pour vous garder connecté. Sans lui, vous ne pourriez pas accéder à votre compte ni à vos commandes.
          </li>
          <li>
            <strong>Stockage local du panier (indispensable)</strong> : le contenu de votre panier est mémorisé dans votre appareil pour que vous le retrouviez en revenant. Il n&rsquo;est pas envoyé à un tiers.
          </li>
        </ul>
      </Section>

      <Section title="Ce que nous n'utilisons pas">
        <p>
          Aujourd&rsquo;hui, SENDUU n&rsquo;utilise <strong>aucun cookie de mesure d&rsquo;audience, de publicité ou de suivi</strong>, ni les nôtres ni ceux de tiers. C&rsquo;est pourquoi le site n&rsquo;affiche pas de bandeau de consentement : les deux éléments ci-dessus sont strictement nécessaires au fonctionnement du service.
        </p>
        <p>
          Si nous ajoutons un jour un outil de mesure ou de publicité, nous vous demanderons votre accord avant de l&rsquo;activer et nous mettrons cette page à jour.
        </p>
      </Section>

      <Section title="Les gérer">
        <p>
          Vous pouvez supprimer les cookies et le stockage local depuis les réglages de votre navigateur. Vous serez alors déconnecté et votre panier sera vidé. Le bouton « Se déconnecter » supprime aussi votre session.
        </p>
      </Section>

      <Section title="Liens externes">
        <p>
          Certains boutons (par exemple WhatsApp) ouvrent un service tiers. Ce service applique sa propre politique. Pour savoir comment nous traitons vos données, voir la <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
