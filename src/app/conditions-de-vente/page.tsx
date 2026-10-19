import Link from "next/link";
import { LegalPage, Section } from "@/components/LegalPage";
import { getLegalInfo } from "@/config/legal";

export const metadata = { title: "Conditions générales de vente — SENDUU" };

export default function TermsPage() {
  const l = getLegalInfo();
  return (
    <LegalPage
      title="Conditions générales de vente"
      intro="Ces conditions s'appliquent à toute commande passée sur le site SENDUU. En validant votre commande, vous reconnaissez les avoir lues et acceptées."
    >
      <Section title="1. Le vendeur">
        <p>
          SENDUU est exploité par {l.company}
          {l.form ? ` (${l.form})` : ""}, {l.address}.
          {l.rccm ? ` RCCM : ${l.rccm}.` : ""}
          {l.niu ? ` NIU : ${l.niu}.` : ""} Contact : <Link href="/contact">page Contact</Link>.
        </p>
      </Section>

      <Section title="2. Produits et prix">
        <p>
          Les produits sont présentés avec leurs caractéristiques principales. Les prix sont indiqués en francs CFA (FCFA). Le prix applicable est celui affiché au moment de la validation de la commande. Les frais de livraison, qui dépendent de la zone choisie, sont affichés avant la validation et ajoutés au total.
        </p>
        <p>
          Nous nous efforçons d&rsquo;afficher des informations exactes. En cas d&rsquo;erreur manifeste de prix ou de description, nous vous contactons avant d&rsquo;expédier et vous pouvez maintenir, modifier ou annuler votre commande sans frais.
        </p>
        <p>Les produits sont proposés dans la limite des stocks disponibles. Un produit indisponible ne peut pas être commandé.</p>
      </Section>

      <Section title="3. Commander">
        <p>
          Vous pouvez commander avec ou sans compte. La commande est enregistrée lorsque vous la validez à la dernière étape, et un numéro de commande vous est communiqué. Vous pouvez suivre son avancement sur la page{" "}
          <Link href="/track-order">Suivi de commande</Link> avec votre numéro et votre téléphone.
        </p>
        <p>Vous devez fournir des informations exactes (téléphone, adresse). Une adresse ou un numéro erroné peut empêcher la livraison.</p>
      </Section>

      <Section title="4. Code promo">
        <p>
          Un code promo réduit le prix des produits dans les conditions qui lui sont propres (montant minimum, durée de validité, nombre d&rsquo;utilisations). Il ne s&rsquo;applique pas aux frais de livraison. Si une commande avec code promo est annulée, la remise est annulée avec elle.
        </p>
      </Section>

      <Section title="5. Paiement">
        <p>
          Le paiement s&rsquo;effectue <strong>à la livraison</strong>, en espèces auprès du livreur, ou <strong>en magasin</strong> lors du retrait. Aucun paiement en ligne n&rsquo;est demandé lors de la commande. Le paiement à la livraison peut ne pas être disponible pour certains produits ou certaines zones : le site l&rsquo;indique alors avant la validation.
        </p>
      </Section>

      <Section title="6. Livraison et retrait">
        <p>
          Nous livrons dans les zones proposées lors de la commande (à ce jour : Douala, Yaoundé et Bafoussam). Les frais et le délai estimé dépendent de la zone et vous sont indiqués avant la validation. Les délais sont donnés à titre indicatif et peuvent varier selon la disponibilité du produit ou des circonstances extérieures (circulation, météo, événements).
        </p>
        <p>
          Vous pouvez aussi choisir le <strong>retrait en magasin</strong>, lorsque le produit le permet. Vous serez informé lorsque la commande est prête.
        </p>
        <p>
          Le livreur peut vous appeler avant de venir. Si vous êtes absent et injoignable, la commande peut être remise en livraison ultérieure, ou annulée après plusieurs tentatives. Merci de vérifier le colis en présence du livreur et de signaler immédiatement tout dommage visible.
        </p>
      </Section>

      <Section title="7. Annuler une commande">
        <p>
          Tant que votre commande n&rsquo;est pas expédiée, vous pouvez demander son annulation en nous contactant via la <Link href="/contact">page Contact</Link>. Les produits retournent alors au stock. Nous pouvons aussi annuler une commande en cas d&rsquo;indisponibilité d&rsquo;un produit ou d&rsquo;impossibilité de vous joindre ; vous en êtes informé.
        </p>
      </Section>

      <Section title="8. Droit de rétractation">
        <p>
          Conformément à la loi camerounaise sur la protection du consommateur (loi n° 2011/012 du 6 mai 2011), vous disposez d&rsquo;un délai de <strong>14 jours</strong> à compter de la réception du produit pour vous rétracter, sans avoir à justifier votre décision.
        </p>
        <p>
          Pour l&rsquo;exercer, contactez-nous dans ce délai en indiquant votre numéro de commande. Le produit doit nous être retourné non utilisé, complet et dans son emballage d&rsquo;origine. Les frais de retour sont à votre charge, sauf si le produit est défectueux ou non conforme. Le remboursement du prix du produit est effectué dès réception et vérification du retour, par le moyen convenu avec vous.
        </p>
      </Section>

      <Section title="9. Produit défectueux ou non conforme">
        <p>
          Si un produit présente un défaut ou ne correspond pas à votre commande, contactez-nous rapidement avec votre numéro de commande et, si possible, des photos. Vous pouvez demander, selon le cas, le remplacement, la réparation ou l&rsquo;annulation de la vente avec remboursement, aux frais du vendeur. Une réparation ne doit pas dépasser quinze jours.
        </p>
        <p>Les produits d&rsquo;occasion, reconditionnés ou réparés sont signalés comme tels sur leur fiche.</p>
      </Section>

      <Section title="10. Réclamations">
        <p>
          Pour toute réclamation, écrivez-nous via la <Link href="/contact">page Contact</Link>. Nous cherchons une solution amiable. À défaut, vous pouvez saisir les instances de protection du consommateur ou la justice camerounaise.
        </p>
      </Section>

      <Section title="11. Données personnelles">
        <p>Le traitement de vos données est décrit dans la <Link href="/confidentialite">politique de confidentialité</Link>.</p>
      </Section>

      <Section title="12. Droit applicable">
        <p>Ces conditions sont régies par le droit camerounais. Elles peuvent être modifiées ; les conditions applicables sont celles en vigueur à la date de votre commande.</p>
      </Section>
    </LegalPage>
  );
}
