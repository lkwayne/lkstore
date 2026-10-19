import Link from "next/link";
import { LegalPage, Section } from "@/components/LegalPage";
import { getLegalInfo } from "@/config/legal";
import { getContactChannels } from "@/config/contact";

export const metadata = { title: "Politique de confidentialité — SENDUU" };

export default function PrivacyPage() {
  const l = getLegalInfo();
  const c = getContactChannels();
  return (
    <LegalPage
      title="Politique de confidentialité"
      intro="Cette page explique quelles données personnelles SENDUU collecte, pourquoi, combien de temps nous les gardons et comment vous pouvez exercer vos droits, conformément à la loi camerounaise n° 2024/017 du 23 décembre 2024 relative à la protection des données à caractère personnel."
    >
      <Section title="1. Qui est responsable de vos données ?">
        <p>
          Le site SENDUU est exploité par {l.company}
          {l.form ? ` (${l.form})` : ""}, {l.address}.
          {l.rccm ? ` RCCM : ${l.rccm}.` : ""}
          {l.niu ? ` NIU : ${l.niu}.` : ""}
        </p>
        <p>
          Pour toute question sur vos données :{" "}
          {c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : <Link href="/contact">page Contact</Link>}.
        </p>
      </Section>

      <Section title="2. Les données que nous collectons">
        <ul>
          <li><strong>Compte client</strong> : adresse e-mail, nom, mot de passe (jamais lisible par nous : il est chiffré par notre service d&rsquo;authentification).</li>
          <li><strong>Commande</strong> : prénom, nom, numéro de téléphone, e-mail (facultatif), ville, quartier, adresse de livraison et indications pour le livreur, ou magasin de retrait choisi, produits commandés et montants.</li>
          <li><strong>Avis et favoris</strong> : les avis que vous publiez et les produits que vous mettez en favoris.</li>
          <li><strong>Données techniques</strong> : votre adresse IP est utilisée de façon ponctuelle pour limiter les abus (par exemple trop d&rsquo;essais de code promo). Aucune donnée n&rsquo;est collectée à des fins publicitaires.</li>
        </ul>
        <p>Votre panier est conservé uniquement dans votre appareil (voir la <Link href="/cookies">page Cookies</Link>).</p>
        <p>Vous pouvez commander sans créer de compte. Nous ne collectons que ce qui est nécessaire pour traiter et livrer votre commande.</p>
      </Section>

      <Section title="3. Pourquoi nous les utilisons">
        <ul>
          <li>Traiter, préparer, livrer ou remettre votre commande, et vous contacter à son sujet (confirmation, livraison, problème).</li>
          <li>Gérer votre compte et le suivi de vos commandes.</li>
          <li>Respecter nos obligations légales et comptables.</li>
          <li>Sécuriser le site et prévenir la fraude et les abus.</li>
          <li>Vous écrire pour des offres ou des nouveautés <strong>uniquement si vous l&rsquo;avez demandé</strong>. Vous pouvez vous y opposer à tout moment.</li>
        </ul>
        <p>Nous ne vendons jamais vos données.</p>
      </Section>

      <Section title="4. Qui y a accès ?">
        <ul>
          <li>L&rsquo;équipe SENDUU, selon les besoins de son rôle : préparation, livraison, service client.</li>
          <li>Le transporteur ou le livreur, qui reçoit le nom, le téléphone et l&rsquo;adresse nécessaires pour vous remettre le colis.</li>
          <li>Nos prestataires techniques d&rsquo;hébergement et de base de données (voir ci-dessous).</li>
          <li>Les autorités, si la loi l&rsquo;exige.</li>
        </ul>
      </Section>

      <Section title="5. Où sont stockées vos données ?">
        <p>
          Les données sont hébergées chez nos prestataires techniques : la base de données chez Supabase, sur des serveurs situés en Irlande (Union européenne), et le site chez Vercel. Elles sont donc traitées en dehors du Cameroun. Nous nous appuyons sur des prestataires qui appliquent des mesures de sécurité reconnues.
        </p>
      </Section>

      <Section title="6. Combien de temps les gardons-nous ?">
        <ul>
          <li>Données de compte : tant que votre compte est ouvert, puis supprimées à votre demande.</li>
          <li>Données de commande : pendant la durée légale de conservation des pièces comptables.</li>
          <li>Données techniques de limitation des abus : quelques minutes à quelques heures.</li>
        </ul>
      </Section>

      <Section title="7. Vos droits">
        <p>Vous pouvez à tout moment :</p>
        <ul>
          <li>accéder aux données que nous détenons sur vous ;</li>
          <li>les faire corriger ;</li>
          <li>demander leur effacement, sauf celles que la loi nous oblige à conserver ;</li>
          <li>vous opposer à leur utilisation, notamment pour la prospection commerciale ;</li>
          <li>retirer un consentement donné.</li>
        </ul>
        <p>
          Écrivez-nous via la <Link href="/contact">page Contact</Link>
          {c.email ? <> ou à <a href={`mailto:${c.email}`}>{c.email}</a></> : null} en précisant votre demande. Nous pouvons vous demander de prouver votre identité. Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir l&rsquo;autorité camerounaise de protection des données personnelles.
        </p>
      </Section>

      <Section title="8. Sécurité">
        <p>
          Les échanges avec le site sont chiffrés (HTTPS). L&rsquo;accès aux données est limité par rôle et contrôlé au niveau de la base. Aucun système n&rsquo;est infaillible : en cas d&rsquo;incident touchant vos données, nous respecterons nos obligations d&rsquo;information.
        </p>
      </Section>

      <Section title="9. Modifications">
        <p>Nous pouvons mettre à jour cette politique. La date de dernière mise à jour figure en haut de la page.</p>
      </Section>
    </LegalPage>
  );
}
