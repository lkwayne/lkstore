# BENDO — Tout ce qu'il vous faut

Plateforme e-commerce généraliste pour le marché camerounais. Vendeur unique
combinant **stock propre** et **dropshipping via fournisseurs partenaires**
(invisibles côté client). Pas une marketplace publique.

## État du projet

Ceci est le **socle technique initial** : architecture, base de données,
rôles/permissions, logique métier centrale (marge, sélection fournisseur,
numérotation des commandes). Le catalogue, le panier, le checkout complet et
le dashboard admin restent à construire par-dessus cette base, lot par lot.

Aucune donnée n'est simulée ou présentée comme réelle : rien n'est connecté à
un vrai projet Supabase pour l'instant (voir "Mise en route").

## Stack

- **Frontend** : Next.js (App Router) + React + TypeScript + Tailwind CSS
- **Backend** : Server Actions / API Routes Next.js
- **Base de données** : PostgreSQL via Supabase
- **Auth** : Supabase Auth
- **Stockage** : Supabase Storage
- **Validation** : Zod
- **Formulaires** : React Hook Form
- **Tests** : Vitest (+ Testing Library), Playwright à ajouter pour le E2E

## Architecture des dossiers

```
src/
  app/          # Routes Next.js (App Router)
  components/    # Composants UI réutilisables
  lib/           # Clients Supabase, utilitaires transverses
  services/      # Logique métier (marge, sélection fournisseur, stock...)
  hooks/         # Hooks React personnalisés
  types/         # Types TypeScript, dont database.ts (généré Supabase)
  schemas/       # Schémas de validation Zod
  config/        # Enums et constantes métier centralisées
tests/           # Tests unitaires Vitest
supabase/
  migrations/    # Migrations SQL (schéma + RLS)
  seed/          # Données de démonstration (à créer)
```

Séparation stricte : aucune logique métier ni accès direct aux données dans
les composants React — tout passe par `services/` et `lib/supabase/`.

## Rôles et permissions

`CUSTOMER`, `ADMIN`, `MANAGER`, `LOGISTICS`, `CUSTOMER_SUPPORT`, `MARKETING`
— définis dans `src/config/enums.ts` et appliqués via Row Level Security
PostgreSQL (`supabase/migrations/0001_init.sql`). Un client ne voit que ses
propres commandes/adresses/avis. Les fournisseurs, coûts et marges ne sont
**jamais** exposés côté client (policies RLS dédiées + jamais retournés par
les requêtes publiques).

## Base de données

Le schéma complet (profils, catalogue, fournisseurs, stock, commandes,
livraison, magasins, fulfillment dropshipping, paiements, promotions, avis,
notifications, audit logs, settings) est dans
`supabase/migrations/0001_init.sql`, avec les policies RLS appliquées table
par table.

## Mise en route

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Copier `.env.example` vers `.env.local` et renseigner les clés du projet
   Supabase (URL, anon key, service role key — jamais commitées).
3. Appliquer la migration :
   ```bash
   npx supabase db push
   # ou coller le contenu de supabase/migrations/0001_init.sql
   # dans l'éditeur SQL du dashboard Supabase
   ```
3bis. (Optionnel, pour tester le catalogue) Peupler avec des données de
   démonstration fictives :
   ```bash
   # Coller le contenu de supabase/seed/seed.sql dans l'éditeur SQL
   # du dashboard Supabase, après la migration.
   ```
4. Régénérer les types TypeScript réels :
   ```bash
   npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts
   ```
5. Installer les dépendances et lancer le projet :
   ```bash
   npm install
   npm run dev
   ```

## Scripts

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run lint     # ESLint
npm run test     # Tests unitaires (Vitest)
```

## Ce qui n'est pas encore implémenté

- Checkout (adresse, mode de réception, calcul de livraison par zone).
- Dashboard admin (produits, stocks, fournisseurs, commandes).
- Filtres catalogue avancés (marque, fourchette de prix) — seuls le tri et
  la pagination sont branchés pour l'instant.
- Authentification — le panier est donc pour l'instant persistant par
  navigateur (localStorage), pas encore synchronisé sur un compte client.
- Notifications WhatsApp/email.
- Tests E2E Playwright.

## Module Catalogue (livré)

- `/categories` — liste des catégories publiées
- `/categories/[slug]` — produits d'une catégorie, tri + pagination réels
- `/products/[slug]` — fiche produit (jamais de coût/marge/fournisseur exposés)
- `/search?q=` — recherche par nom ou SKU

Tout est branché sur `src/services/catalog.service.ts`, qui interroge
Supabase directement — rien n'est hardcodé. Sans projet Supabase connecté
(ou base non peuplée), ces pages affichent un état vide honnête plutôt que
des données inventées. Utilise `supabase/seed/seed.sql` pour peupler une
base de test avec des données fictives une fois la migration appliquée.

## Module Panier (livré)

- Persistant par navigateur (`localStorage`), lu/écrit via `CartProvider`
  (`src/components/CartProvider.tsx`), avec badge de quantité dans le header.
- **Aucun prix n'est jamais stocké côté client** : le panier ne garde que
  `productId` + `quantity`. À l'affichage, `fetchCartProductData` (Server
  Action) relit le prix et le stock réels depuis Supabase.
- Un article devenu indisponible ou dont le stock a baissé est signalé et
  la quantité est ajustée automatiquement ; le bouton de commande reste
  désactivé tant que le panier contient un article non disponible.
- Le checkout (adresse, livraison, paiement) n'est pas encore branché — le
  bouton "Passer la commande" le dit explicitement plutôt que de simuler
  une commande.
- Limite connue : sans authentification, le panier ne survit pas à un
  changement de navigateur/appareil. La synchronisation vers une table
  Supabase `carts` pour les clients connectés est prévue avec le module
  Authentification.

## Règle de non-simulation

Aucune fonctionnalité externe (paiement, API fournisseur, WhatsApp, email,
tracking) ne doit jamais être présentée comme fonctionnelle si elle n'est pas
réellement connectée à un service réel avec des identifiants valides.
