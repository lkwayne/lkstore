-- =========================================================================
-- SENDUU — Catégories enrichies (description, icône, visibilité) + flags
-- produits marketing (mis en avant, nouveauté, meilleure vente, flash deal,
-- promotion). On garde le modèle à deux tables déjà en place
-- (categories / subcategories) plutôt que de migrer vers un parent_id
-- récursif : moins de risque, aucun code existant à casser (catalogue,
-- checkout, formulaire produit dépendent déjà de category_id +
-- subcategory_id).
-- =========================================================================

alter table categories
  add column if not exists description text,
  add column if not exists icon text,
  add column if not exists is_active boolean not null default true,
  add column if not exists is_visible boolean not null default true;

alter table subcategories
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists icon text,
  add column if not exists is_active boolean not null default true,
  add column if not exists is_visible boolean not null default true;

-- Lecture publique désormais limitée aux catégories actives ET visibles ;
-- le staff continue de tout voir (nécessaire pour l'administration).
drop policy if exists "categories_public_read" on categories;
create policy "categories_public_read" on categories for select
  using ((is_active and is_visible) or is_staff());

drop policy if exists "subcategories_public_read" on subcategories;
create policy "subcategories_public_read" on subcategories for select
  using ((is_active and is_visible) or is_staff());

-- Flags marketing produit — alimentent les collections dynamiques
-- (Flash Deals, Nouveautés, Meilleures ventes...) sans dupliquer les
-- produits dans une fausse catégorie physique.
alter table products
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_new boolean not null default false,
  add column if not exists is_best_seller boolean not null default false,
  add column if not exists is_flash_deal boolean not null default false,
  add column if not exists is_on_sale boolean not null default false;

create index if not exists idx_products_flags
  on products (is_featured, is_new, is_best_seller, is_flash_deal, is_on_sale)
  where status = 'PUBLISHED';
