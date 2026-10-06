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

- Mega-menu de navigation (catégories → sous-catégories) dans le header —
  la nav principale reste simple pour l'instant ; `/categories` montre la
  hiérarchie complète.
- Filtres prix/marque sur les pages Promotions/Nouveautés/Meilleures ventes
  (déjà en place sur `/categories/[slug]`, pas encore répliqués là).
- Filtre disponibilité (en stock uniquement) — pas encore ajouté.
- Sous-sous-catégories (3ᵉ niveau) — non nécessaire à ce stade, le modèle à
  deux niveaux (catégorie → sous-catégorie) couvre la taxonomie actuelle.
- Réordonnancement par glisser-déposer dans l'admin catégories (l'ordre se
  modifie pour l'instant via le champ numérique).
- Promotions/coupons avec code de réduction (table existante, aucune
  interface) — distinct du flag `is_on_sale` déjà exploité par `/promotions`.
- Réinitialisation de mot de passe, connexion via réseaux sociaux.
- Notifications WhatsApp/email.
- Tests E2E Playwright.

## Catégories & Taxonomie (livré)

- Taxonomie réelle : **13 catégories, 99 sous-catégories** (téléphones,
  informatique, maison, mode, beauté, bébé, sport, auto/moto, énergie
  solaire, sécurité, gaming, bricolage, + une catégorie vitrine "Offres &
  Promotions" sans sous-catégorie physique). Chargée via les migrations
  `0008_category_hierarchy.sql` (colonnes) et
  `0009_category_taxonomy.sql` (données, idempotente via `ON CONFLICT`).
- **Icône dédiée pour chaque catégorie et sous-catégorie** (emoji, colonne
  `icon`), attribuée via `0010_category_icons.sql`. Priorité d'affichage :
  vraie photo (`image_url`) si définie, sinon icône, sinon initiale du nom
  en dernier recours — sur la homepage, `/categories` et l'admin. Le
  formulaire d'ajout rapide de sous-catégorie et la fiche catégorie admin
  permettent de définir/changer l'icône ou d'y substituer une vraie image
  à tout moment.
- `/categories` liste désormais chaque catégorie **avec ses
  sous-catégories** (icône + nom, cliquables) plutôt qu'une simple grille
  plate.
- `/categories/[slug]` accepte un filtre réel par sous-catégorie
  (`?sous-categorie=slug`, cliquable depuis les puces affichées en haut de
  page) — pas juste décoratif, ça filtre vraiment les produits affichés.
- **Filtres prix (min/max) et marque** sur `/categories/[slug]` — le
  sélecteur de marque ne propose que les marques ayant au moins un produit
  publié dans la catégorie (`getBrandsInCategory`), pour ne jamais afficher
  une option qui ne renverrait aucun résultat. Tous les filtres actifs
  (sous-catégorie, marque, prix, tri) se préservent entre eux et dans la
  pagination.
- `/admin/categories` — liste avec compteurs (sous-catégories, produits),
  création, édition. Chaque catégorie gère ses propres sous-catégories
  directement sur sa page d'édition (ajout, retrait).
- Actif/visible distincts : une catégorie peut être désactivée (masquée
  partout, y compris de l'admin produit) ou juste retirée de la boutique
  publique tout en restant sélectionnable en interne.
- Suppression bloquée si la catégorie/sous-catégorie contient encore des
  produits — évite de casser des fiches produit existantes par erreur.
- Sécurité : lecture publique limitée aux catégories actives ET visibles
  (`categories_public_read` / `subcategories_public_read`), écriture
  réservée au staff (`categories_staff_write` / `subcategories_staff_write`).
- Flags marketing produit (`is_featured`, `is_new`, `is_best_seller`,
  `is_flash_deal`, `is_on_sale`) ajoutés au modèle produit et au formulaire
  admin ; **exploités par `/promotions` (is_on_sale), `/nouveautes`
  (is_new) et `/meilleures-ventes` (is_best_seller)** — vraies pages
  catalogue triables/paginées, pas des fausses catégories dupliquées.
  `is_featured` et `is_flash_deal` restent disponibles pour une future mise
  en avant homepage.

## Historique des commandes client (livré)

- `/account/orders` — un client connecté voit toutes ses commandes passées
  (numéro, date, statut, mode de réception, total). Repose entièrement sur
  la policy RLS déjà existante `orders_owner_or_staff_select`
  (`customer_id = auth.uid()`) — aucune nouvelle règle de sécurité requise.
- La liaison commande ↔ compte client existait déjà côté `create_order()`
  (`auth.uid()` capturé à la création) mais restait invisible faute de
  page ; c'est maintenant corrigé.

## Module Fournisseurs & Dropshipping (livré)

- `/admin/suppliers` — liste, création, édition des fournisseurs (contact,
  pays, devise, délai moyen, statut, notes internes).
- Sur chaque fiche fournisseur : liaison de produits (coût, stock
  fournisseur, frais de livraison, priorité) — c'est cette priorité que
  `selectPrimarySupplier` (`supplier-selection.service.ts`) et la fonction
  `create_order()` utilisent pour choisir automatiquement le fournisseur
  d'un article en dropshipping.
- `/admin/fulfillment` — suivi des commandes fournisseur générées
  automatiquement à la création d'une commande contenant un article
  `DROPSHIPPING` ou `MIXED` : chaque entrée reçoit une **référence interne
  automatique** (`FUL-2026-000001`, générée par trigger PostgreSQL) dès sa
  création ; le numéro de suivi transporteur reste un champ séparé, rempli
  manuellement une fois reçu du fournisseur — impossible à générer
  honnêtement puisqu'il vient d'un tiers réel.
- Réservé au staff, protégé par les policies RLS `suppliers_staff_only`,
  `supplier_products_staff_only` et `fulfillment_orders_staff_only` — ces
  données ne sont jamais exposées côté boutique publique.

## Durcissement sécurité (livré)

Deux failles de contrôle d'accès corrigées (`0005_security_hardening.sql`) :
- **Auto-promotion de rôle** : un trigger (`prevent_self_role_change`)
  bloque toute modification de `profiles.role` effectuée depuis une session
  utilisateur authentifiée. Seule une connexion privilégiée directe
  (service_role / SQL Editor) peut changer un rôle.
- **Contournement du checkout** : les policies d'insertion directe sur
  `orders` / `order_items` sont désormais réservées au staff — un client ne
  peut plus créer une commande "à la main" avec un prix ou un statut
  arbitraire. `create_order()` (SECURITY DEFINER) n'est pas affectée et
  reste le seul chemin de création de commande pour un client.

## Tableau de bord Admin (livré)

- `/admin` — chiffre d'affaires (hors commandes annulées/retournées),
  nombre de commandes, panier moyen, alertes stock faible, répartition des
  commandes par statut, meilleures ventes.
- Agrégats calculés côté application à partir des données déjà protégées
  par RLS — pas de fonction SQL dédiée pour l'instant ; à revoir si le
  volume de commandes grossit significativement (voir commentaire dans
  `src/services/admin-stats.service.ts`).

## Module Admin Produits (livré)

- `/admin/products` — liste tous les produits (tous statuts), avec édition
  rapide du stock et du statut directement depuis le tableau.
- `/admin/products/new` et `/admin/products/[id]/edit` — création et
  modification complètes : titre, description, **état (Neuf / Occasion)**,
  catégorie/sous-catégorie, marque, stock, type de fulfillment,
  disponibilité COD/retrait, statut.
- **Prix réel / Prix promo** (tous deux en FCFA, affichés avec suffixe) :
  le formulaire distingue le prix réel (toujours affiché) et un prix promo
  optionnel. Si un prix promo est saisi, c'est lui qui est facturé et le
  prix réel s'affiche barré sur la boutique — logique de conversion pure et
  testée dans `src/schemas/product-form.schema.ts`
  (`toProductInput`/`fromProductInput`). En base, `products.price` reste
  toujours le montant facturé et `products.compare_at_price` la référence
  barrée, inchangé pour le reste de l'application (panier, checkout).
- **Mise en avant marketing** : 5 cases à cocher (Mis en avant, Nouveauté,
  Meilleure vente, Flash Deal, En promotion) — voir section "Catégories &
  Taxonomie" pour le détail des flags associés.
- Réservé au staff via le même layout `/admin` que le module commandes ;
  la sécurité réelle vient des policies RLS `products_staff_write` /
  `products_public_read` (un compte non-staff ne verrait jamais les
  brouillons, même en contournant la page).

## Médias produit — photos et vidéo (livré)

- Jusqu'à **7 médias par produit** (photos JPG/PNG/WebP/GIF, 5 Mo max, et
  vidéos MP4/WebM/MOV, 25 Mo max), uploadés vers un bucket Supabase Storage
  public dédié (`product-media`). Validation type/taille revérifiée côté
  serveur (`src/services/product-media.service.ts`), pas seulement côté
  formulaire.
- Création d'un produit : les fichiers sont mis en attente localement (pas
  encore d'ID produit) puis envoyés automatiquement une fois le produit
  créé. Édition : upload immédiat.
- Suppression d'un média : retire à la fois la ligne en base et le fichier
  du stockage (pas de fichier orphelin).
- Sur la boutique : la première photo (jamais une vidéo) sert de vignette
  catalogue ; la fiche produit affiche le média principal (lecteur vidéo si
  c'est une vidéo) plus une bande de vignettes pour les médias suivants,
  visible sur mobile et desktop.
- Accès en écriture au bucket réservé au staff (policies `storage.objects`
  dédiées) ; lecture publique pour que les médias s'affichent sans
  authentification.

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
  la réponse de `create_order()` au moment du paiement.
- **Correctif critique (`0011_fix_create_order_bugs.sql`)** : deux bugs
  bloquaient entièrement le checkout (`operator does not exist: text ->>
  unknown`) — réutilisation de l'opérateur jsonb `->>` sur une table déjà
  typée, et une précédence d'opérateurs SQL incorrecte sur la concaténation
  du nom du client. Les deux ont été reproduits, corrigés et revérifiés par
  une vraie commande de test (créée puis supprimée) avant d'écrire la
  migration — voir le fichier pour le détail technique.
- **Livraison — sélection Ville puis Quartier** (`0012_douala_shipping_zones.sql`) :
  le formulaire demande d'abord la ville, puis ne propose que les quartiers
  de cette ville. Douala compte 47 quartiers réels sur 3 paliers de tarif
  (1000 FCFA pour Bonamoussadi et son corridor jusqu'à Akwa, 1500 FCFA pour
  les autres quartiers, 2000 FCFA pour les plus éloignés de Bonamoussadi).
  Yaoundé (46 quartiers) et Bafoussam (16) et Bafoussam sont configurées depuis
  `0022_yaounde_bafoussam_zones.sql`, sur le même principe : centre-ville à
  1000 FCFA, quartiers intermédiaires à 1500, périphérie à 2000 (délai de 2
  jours). Les tarifs sont alignés sur Douala ; le coût réel d'acheminement
  depuis Douala reste à vérifier avec un transporteur. Liste des quartiers à
  compléter selon les retours terrain.

## Création automatique de compte client (livré)

- Dès qu'une commande **invitée** (client non connecté) est validée, un
  compte Supabase Auth est créé automatiquement pour l'email fourni au
  checkout — l'email est désormais **obligatoire** au checkout précisément
  pour ça (`src/schemas/order.schema.ts`).
- Un vrai email est envoyé via le service de mail intégré de Supabase Auth
  (`resetPasswordForEmail`) : ce n'est pas un simulacre, l'email part
  réellement et permet au client de définir son mot de passe. Limite
  assumée : il s'agit du mailer par défaut de Supabase (quelques envois/heure
  sur le plan actuel, template générique non personnalisé "SENDUU"). Pour un
  vrai volume et un email à l'en-tête SENDUU, configurer un SMTP personnalisé
  dans Supabase (Authentication → Email Templates / SMTP Settings) — aucun
  changement de code requis, `src/services/customer-account.service.ts`
  continuera de fonctionner tel quel.
- Si un compte existe déjà pour cet email, rien n'est recréé ni réinitialisé
  — le client garde son compte existant.
- La commande est automatiquement rattachée (`customer_id`) au compte
  fraîchement créé, pour apparaître immédiatement dans son historique
  (`/account/orders`).
- Un échec de création de compte ou d'envoi d'email ne fait jamais échouer
  la commande elle-même, qui est déjà validée en base à ce stade.

## Notifications WhatsApp — préparées, pas encore actives

`src/services/whatsapp-notification.service.ts` contient l'intégration
complète avec l'API Graph de Meta (WhatsApp Business Platform), mais
**aucun message n'est envoyé tant que trois variables d'environnement ne
sont pas renseignées** (`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
`WHATSAPP_ACCOUNT_TEMPLATE_NAME` — voir `.env.example`). Aucun envoi n'est
simulé en attendant : la fonction retourne honnêtement `sent: false` avec la
raison. Pour activer une fois le compte Meta approuvé :
1. Créer et faire approuver par Meta un template de message "utility" (un
   message business-initié hors fenêtre de 24h ne peut pas être du texte
   libre — c'est une règle de la plateforme WhatsApp).
2. Renseigner les trois variables d'environnement.
3. Aucune autre modification de code n'est nécessaire — l'appel se déclenche
   automatiquement dès la prochaine commande une fois ces variables présentes.

## Règle de non-simulation

Aucune fonctionnalité externe (paiement, API fournisseur, WhatsApp, email,
tracking) ne doit jamais être présentée comme fonctionnelle si elle n'est pas
réellement connectée à un service réel avec des identifiants valides.

## Favoris (wishlist)

- Table `wishlists` protégée par RLS (`wishlists_owner_only`) : chaque client ne voit que ses favoris.
- `WishlistButton` (cœur sur les cartes produit, bouton complet sur la fiche produit) avec mise à jour optimiste ; un visiteur non connecté est redirigé vers `/login`.
- Page `/wishlist` : liste des favoris, du plus récent au plus ancien.

## Avis clients

- Migration `0013_reviews.sql` : un avis par client et produit, réservé aux acheteurs d'une commande `DELIVERED`/`COMPLETED`, toujours créé « en attente » (trigger `enforce_review_rules`, le client ne peut pas s'auto-approuver).
- Fiche produit : note moyenne, liste des avis approuvés (prénom + initiale), formulaire pour les acheteurs.
- Admin : `/admin/reviews` pour approuver, masquer ou supprimer.

## Méga-menu des catégories

- Survol/focus de « Catégories » dans la navigation desktop : panneau avec les 13 catégories et leurs 5 premières sous-catégories (lien « Voir tout »).
- Mobile : « Catégories » se déplie dans le menu.
- Données via `getMegaMenu()` (client Supabase sans cookies, revalidation 5 min) : le header reste compatible avec les pages statiques, et un menu vide s'affiche en cas d'erreur plutôt que de casser la page.

## Contact et suivi public de commande

- `/contact` : boutons WhatsApp / appel / email lus depuis `NEXT_PUBLIC_SUPPORT_WHATSAPP|PHONE|EMAIL|HOURS`. Un canal non renseigné n'est pas affiché ; aucun formulaire factice n'est proposé (pas d'envoi d'email tant que le mail pro n'existe pas).
- `/track-order` : numéro de commande **+ téléphone** (9 derniers chiffres) via la fonction SQL `track_order` (migration `0014`, appliquée). Ne renvoie que statut, articles et total — jamais adresse, email ni identité. Réponse identique pour « commande inconnue » et « mauvais téléphone ».

## Mot de passe oublié / lien d'accès client

- `/forgot-password` : demande d'un lien par email (réponse identique que le compte existe ou non).
- `/reset-password` : le client choisit un mot de passe (8 caractères min.), puis est connecté automatiquement.
- Flux Supabase « implicit » volontaire : le lien fonctionne même ouvert dans un autre navigateur que celui de la demande (appli mail sur mobile).
- Le lien d'accès envoyé après un achat (création auto du compte) pointe maintenant vers `/reset-password` (il pointait vers `/login`, où rien ne permettait de définir un mot de passe).
- Prérequis Supabase : la Site URL et `https://<site>/**` dans Redirect URLs (déjà configurés).

## Sécurité et anti-abus

- **Limitation de débit** (`src/lib/rate-limit.ts`, migration `0016`) : table `rate_limits` + fonction `rate_limit_hit`, accessibles uniquement au service_role. Limites actuelles : connexion 20 / 15 min par IP et 8 / 15 min par email ; inscription 5 / h par IP ; commande 10 / h par IP et 5 / h par téléphone ; suivi de commande 10 / 10 min par IP. Si le limiteur tombe en panne, les requêtes passent (une commande ne doit jamais être bloquée par un incident technique).
- **Garde admin** : toutes les actions d'administration appellent `requireStaff()` (`auth.service.ts`) avant toute opération, en plus des règles RLS.
- **Migration `0015`** : tables de compteurs verrouillées (RLS) et fonctions internes non appelables depuis l'extérieur.

## Équipe et rôles

- Rôle **SUPER_ADMIN** (migration `0017`) : seul à voir la page `/admin/team`. Il crée les comptes du staff (mot de passe provisoire généré, affiché une seule fois), attribue ou retire les rôles et peut nommer d'autres super administrateurs.
- Garde-fous : on ne peut pas modifier son propre rôle ; la base refuse de retirer le dernier super administrateur ; chaque changement est écrit dans `audit_logs`.
- Les rôles staff (ADMIN, MANAGER, LOGISTICS, CUSTOMER_SUPPORT, MARKETING) donnent pour l'instant le même accès au back-office. Des droits distincts par rôle restent à faire.

### Droits par rôle (migration `0018`, `src/config/permissions.ts`)

| Rôle | Accès |
|---|---|
| SUPER_ADMIN | tout, y compris l'équipe |
| ADMIN, MANAGER | tout sauf l'équipe (coûts, marges, fournisseurs inclus) |
| LOGISTICS | commandes, dropshipping, délais et activation des zones de livraison (pas les tarifs) ; pas de coûts ni de catalogue |
| CUSTOMER_SUPPORT | commandes, avis ; pas de finance |
| MARKETING | catalogue (produits, catégories, médias), avis ; pas de commandes, coûts ni fournisseurs |

Les droits sont appliqués trois fois : menu, garde des pages/actions (`guardPage`, `requirePermission`) et **policies RLS** en base (fonctions `can_manage_orders`, `can_edit_catalog`, `can_moderate_reviews`, `can_handle_fulfillment`, `is_admin_or_manager`). Modifier le fichier TypeScript seul ne donne jamais plus d'accès que la base ne l'autorise.

**Prix d'achat** : `products.cost_price` n'est plus lisible par `anon`/`authenticated` (grants par colonne). Le back-office le lit avec la clé service, pour les rôles `costs.view` uniquement. Toute nouvelle colonne de `products` doit recevoir `grant select (colonne) on products to anon, authenticated`, sinon la boutique ne pourra pas la lire.

## Règle importante : `Header` et pages clientes

`Header` est un composant **serveur asynchrone** (il charge le méga-menu). Il ne doit **jamais** être importé dans un fichier `"use client"` : la page ne devient alors pas interactive (boutons sans effet). Les pages interactives (connexion, inscription, panier, paiement, mot de passe) sont donc découpées en `page.tsx` (serveur, rend `<Header />`) + `client.tsx` (formulaire, reçoit `header` en prop).

## SEO

- `src/config/site.ts` : nom, description et `getSiteUrl()` (variable `NEXT_PUBLIC_SITE_URL`, **à régler sur le vrai domaine dès qu'il existe**, puis redéployer).
- `robots.txt` (`src/app/robots.ts`) : bloque admin, compte, panier, paiement, connexion, favoris, suivi, recherche.
- `sitemap.xml` (`src/app/sitemap.ts`) : pages fixes + catégories + produits publiés, régénéré toutes les heures.
- Balises de partage (Open Graph / Twitter) : image de marque `src/app/opengraph-image.png`, photo du produit sur chaque fiche.
- Données structurées JSON-LD : `Organization` (toutes les pages) et `Product` (prix XAF, disponibilité, note moyenne) sur chaque fiche produit.
- Après changement de domaine : soumettre `…/sitemap.xml` dans Google Search Console.

## Codes promo

- Gestion : `/admin/coupons` (permission `catalog.manage`) — code en majuscules, % ou montant fixe, achat minimum, plafond de remise, limite d'utilisations, date d'expiration, activation/désactivation.
- La remise s'applique sur les articles, jamais sur la livraison.
- Sécurité : la table `coupons` n'est plus lisible publiquement. La validation se fait dans la fonction SQL `check_coupon` (service_role uniquement) ; `create_order` recalcule la remise en base sous verrou et incrémente l'usage — le navigateur n'envoie qu'un code, jamais un montant.
- `create_order` est appelée côté serveur via service_role avec l'identité du client vérifiée (`customer_id` n'est accepté que de service_role).
- Aperçu au checkout : action `applyCoupon`, limitée à 20 essais / 10 min / IP.
- Migration 0020 : correction des codes d'erreur de `create_order` (SQLSTATE sur 5 caractères).

## Gestion de la livraison (admin)

`/admin/shipping` (permission `shipping.manage`, ADMIN / MANAGER / SUPER_ADMIN / LOGISTICS (migration 0023). **Les tarifs et l'ajout d'un quartier sont réservés à ADMIN / MANAGER / SUPER_ADMIN** (`shipping.prices`, appliqué aussi en base par le trigger de la migration 0024) ; la logistique règle délais, paiement à la livraison et activation) : modifier le tarif, le délai, le paiement à la livraison et l'activation de chaque quartier, et ajouter un quartier ou une ville. Pas de suppression : on désactive, pour ne rien casser côté historique. Les changements s'appliquent tout de suite au paiement.
