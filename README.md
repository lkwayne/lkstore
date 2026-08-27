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

- Paiement : uniquement `CASH_ON_DELIVERY` et `PAY_IN_STORE` sont prévus pour
  la v1 (aucune intégration Orange Money / MTN MoMo / carte — architecture
  prête à les accueillir plus tard, rien de simulé).
- Pages catalogue, panier, checkout, dashboard admin, notifications
  WhatsApp/email : à construire lot par lot sur cette base.
- Tests E2E Playwright.
- Seed de démonstration.

## Règle de non-simulation

Aucune fonctionnalité externe (paiement, API fournisseur, WhatsApp, email,
tracking) ne doit jamais être présentée comme fonctionnelle si elle n'est pas
réellement connectée à un service réel avec des identifiants valides.
