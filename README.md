# SENDUU — Achetez mieux, payez moins, nous livrons

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

- Dashboard admin complet (produits, stocks, fournisseurs) — seule la vue
  commandes existe pour l'instant.
- Filtres catalogue avancés (marque, fourchette de prix) — seuls le tri et
  la pagination sont branchés pour l'instant.
- Lien automatique entre une commande et le compte client connecté au
  moment du checkout (le checkout reste en mode invité pour l'instant,
  même si le client est connecté).
- Réinitialisation de mot de passe, connexion via réseaux sociaux.
- Notifications WhatsApp/email.
- Tests E2E Playwright.

## Module Authentification (livré)

- `/login`, `/register` — connexion et inscription par email/mot de passe
  via Supabase Auth. Le profil (`profiles`) est créé automatiquement par le
  trigger `handle_new_user` (voir `0001_init.sql`).
- `/account` — affiche le profil connecté ; propose l'accès au back-office
  si le rôle n'est pas `CUSTOMER`.
- `/admin/orders` — tableau de bord commandes réservé au staff (`ADMIN`,
  `MANAGER`, `LOGISTICS`, `CUSTOMER_SUPPORT`, `MARKETING`) : liste les
  commandes récentes et permet de changer leur statut. Protégé par
  `src/app/admin/layout.tsx` (redirection si non connecté ou non-staff) —
  la sécurité réelle vient toutefois des policies RLS (`orders_staff_update`
  etc.), pas de cette seule vérification côté page.
- `src/proxy.ts` (anciennement `middleware.ts`, renommé selon la nouvelle
  convention Next.js 16) rafraîchit la session Supabase sur chaque requête.
- **Pour créer ton premier compte administrateur** : crée un compte via
  `/register`, puis dans Supabase (SQL Editor) :
  ```sql
  update profiles set role = 'ADMIN' where id =
    (select id from auth.users where email = 'ton-email@exemple.com');
  ```

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
- Limite connue : sans authentification, le panier ne survit pas à un
  changement de navigateur/appareil. La synchronisation vers une table
  Supabase `carts` pour les clients connectés est prévue avec le module
  Authentification.

## Module Checkout (livré)

- `/checkout` — formulaire complet : coordonnées, choix livraison/retrait
  magasin, zone de livraison ou magasin réels (jamais codés en dur), paiement
  associé automatiquement (COD pour livraison, paiement en magasin pour
  retrait).
- Toute la création de commande passe par une fonction SQL unique et
  transactionnelle, `create_order()` (`supabase/migrations/0002_checkout.sql`) :
  - revérifie chaque produit, son statut, son stock (avec verrouillage de
    ligne `FOR UPDATE` pour éviter une survente en cas de commandes
    concurrentes) ;
  - recalcule le prix, le sous-total et le tarif de livraison **côté
    serveur** — aucun prix envoyé par le navigateur n'est utilisé ;
  - vérifie que COD / retrait magasin sont bien autorisés pour chaque
    article et pour la zone choisie ;
  - crée la commande, les lignes, décrémente le stock et crée les
    `fulfillment_orders` pour les articles en dropshipping — tout ou rien
    (une commande ne peut pas être créée avec un stock décrémenté à moitié) ;
  - génère le numéro `SEN-2026-000001` de façon atomique (compteur par
    année, sûr sous concurrence) ;
  - journalise la création dans `audit_logs`.
- Choix de sécurité assumé : par souci de ne pas permettre l'énumération des
  commandes, il n'existe pour l'instant aucune route qui relit une commande
  après coup — la confirmation (numéro, total) s'affiche directement depuis
  la réponse de `create_order()` au moment du paiement. Le suivi de commande
  par numéro (`/track-order`) arrivera avec le module Authentification.

## Règle de non-simulation

Aucune fonctionnalité externe (paiement, API fournisseur, WhatsApp, email,
tracking) ne doit jamais être présentée comme fonctionnelle si elle n'est pas
réellement connectée à un service réel avec des identifiants valides.
