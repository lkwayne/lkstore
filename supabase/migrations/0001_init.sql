-- =========================================================================
-- BENDO — Migration initiale
-- Schéma e-commerce hybride (stock propre + dropshipping)
-- =========================================================================

-- -------------------------------------------------------------------------
-- EXTENSIONS
-- -------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- ENUMS
-- -------------------------------------------------------------------------
create type user_role as enum (
  'CUSTOMER', 'ADMIN', 'MANAGER', 'LOGISTICS', 'CUSTOMER_SUPPORT', 'MARKETING'
);

create type fulfillment_type as enum ('BENDO_STOCK', 'DROPSHIPPING', 'MIXED');

create type supplier_status as enum ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED');

create type order_status as enum (
  'PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_PICKUP', 'SHIPPED',
  'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'RETURNED'
);

create type payment_method as enum ('CASH_ON_DELIVERY', 'PAY_IN_STORE');

create type payment_status as enum ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

create type reception_method as enum ('DELIVERY', 'STORE_PICKUP');

create type fulfillment_order_status as enum (
  'PENDING_SUPPLIER', 'SENT_TO_SUPPLIER', 'CONFIRMED_BY_SUPPLIER',
  'SHIPPED', 'TRACKING_RECEIVED', 'DELIVERED', 'FAILED'
);

create type product_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- -------------------------------------------------------------------------
-- PROFILES (lié à auth.users)
-- -------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  role user_role not null default 'CUSTOMER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- CATALOGUE : marques, catégories, produits
-- -------------------------------------------------------------------------
create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text not null unique,
  description text,
  brand_id uuid references brands(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  subcategory_id uuid references subcategories(id) on delete set null,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price >= 0),
  cost_price numeric(12,2) check (cost_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5,
  fulfillment_type fulfillment_type not null default 'BENDO_STOCK',
  cod_available boolean not null default true,
  store_pickup_available boolean not null default false,
  status product_status not null default 'DRAFT',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on products(category_id);
create index idx_products_status on products(status);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  sku text not null unique,
  price_override numeric(12,2),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  attributes jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete cascade,
  quantity_available integer not null default 0 check (quantity_available >= 0),
  quantity_reserved integer not null default 0 check (quantity_reserved >= 0),
  updated_at timestamptz not null default now(),
  unique (product_id, variant_id)
);

-- -------------------------------------------------------------------------
-- FOURNISSEURS (privés — jamais exposés côté client)
-- -------------------------------------------------------------------------
create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_name text,
  country text,
  city text,
  phone text,
  whatsapp text,
  email text,
  website text,
  currency text not null default 'XAF',
  average_lead_time_days integer,
  status supplier_status not null default 'PENDING',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  supplier_sku text,
  supplier_cost numeric(12,2) not null check (supplier_cost >= 0),
  supplier_stock integer not null default 0,
  shipping_cost numeric(12,2) not null default 0,
  estimated_delivery_days integer,
  priority integer not null default 1,
  status supplier_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  unique (supplier_id, product_id)
);

create table supplier_inventory (
  id uuid primary key default gen_random_uuid(),
  supplier_product_id uuid not null references supplier_products(id) on delete cascade,
  quantity integer not null default 0,
  updated_at timestamptz not null default now()
);

create table supplier_orders (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete restrict,
  reference text not null unique,
  status text not null default 'PENDING',
  total_cost numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- LIVRAISON / MAGASINS
-- -------------------------------------------------------------------------
create table shipping_zones (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  neighborhood text,
  fee numeric(12,2) not null default 0,
  estimated_days integer not null default 1,
  cod_allowed boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  phone text,
  opening_hours jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table store_inventory (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (store_id, product_id)
);

create table store_pickups (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  store_id uuid not null references stores(id) on delete restrict,
  ready_at timestamptz,
  picked_up_at timestamptz,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- COMMANDES
-- -------------------------------------------------------------------------
create table shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  city text not null,
  neighborhood text,
  address_line text,
  instructions text,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references profiles(id) on delete set null,
  status order_status not null default 'PENDING',
  reception_method reception_method not null,
  shipping_address_id uuid references shipping_addresses(id) on delete set null,
  store_id uuid references stores(id) on delete set null,
  subtotal numeric(12,2) not null default 0,
  shipping_fee numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  payment_method payment_method not null,
  payment_status payment_status not null default 'PENDING',
  coupon_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_customer on orders(customer_id);
create index idx_orders_status on orders(status);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  variant_id uuid references product_variants(id) on delete restrict,
  product_name_snapshot text not null,
  unit_price numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  fulfillment_type fulfillment_type not null,
  created_at timestamptz not null default now()
);

create table fulfillment_orders (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  supplier_cost numeric(12,2),
  shipping_cost numeric(12,2),
  status fulfillment_order_status not null default 'PENDING_SUPPLIER',
  tracking_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  method payment_method not null,
  status payment_status not null default 'PENDING',
  amount numeric(12,2) not null,
  confirmed_by uuid references profiles(id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- PROMOTIONS / AVIS / DIVERS
-- -------------------------------------------------------------------------
create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('PERCENTAGE', 'FIXED')),
  discount_value numeric(12,2) not null,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer,
  usage_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  customer_id uuid not null references profiles(id) on delete cascade,
  order_item_id uuid references order_items(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table wishlists (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

create table banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- =========================================================================
-- FONCTIONS UTILITAIRES
-- =========================================================================

-- Rôle du user courant (evite la récursion RLS sur profiles)
create or replace function auth_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth_role() <> 'CUSTOMER', false);
$$;

create or replace function is_admin_or_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth_role() in ('ADMIN', 'MANAGER'), false);
$$;

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

alter table profiles enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table inventory enable row level security;
alter table brands enable row level security;
alter table categories enable row level security;
alter table subcategories enable row level security;
alter table suppliers enable row level security;
alter table supplier_products enable row level security;
alter table supplier_inventory enable row level security;
alter table supplier_orders enable row level security;
alter table shipping_zones enable row level security;
alter table stores enable row level security;
alter table store_inventory enable row level security;
alter table store_pickups enable row level security;
alter table shipping_addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table fulfillment_orders enable row level security;
alter table payments enable row level security;
alter table coupons enable row level security;
alter table reviews enable row level security;
alter table wishlists enable row level security;
alter table banners enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
alter table settings enable row level security;

-- PROFILES : un client voit et modifie uniquement son propre profil
create policy "profiles_select_own" on profiles for select using (id = auth.uid() or is_staff());
create policy "profiles_update_own" on profiles for update using (id = auth.uid());
create policy "profiles_insert_own" on profiles for insert with check (id = auth.uid());

-- CATALOGUE PUBLIC : lecture publique des produits publiés uniquement, écriture staff
create policy "products_public_read" on products for select using (status = 'PUBLISHED' or is_staff());
create policy "products_staff_write" on products for all using (is_staff()) with check (is_staff());

create policy "product_images_public_read" on product_images for select using (true);
create policy "product_images_staff_write" on product_images for all using (is_staff()) with check (is_staff());

create policy "product_variants_public_read" on product_variants for select using (true);
create policy "product_variants_staff_write" on product_variants for all using (is_staff()) with check (is_staff());

create policy "brands_public_read" on brands for select using (true);
create policy "brands_staff_write" on brands for all using (is_staff()) with check (is_staff());

create policy "categories_public_read" on categories for select using (true);
create policy "categories_staff_write" on categories for all using (is_staff()) with check (is_staff());

create policy "subcategories_public_read" on subcategories for select using (true);
create policy "subcategories_staff_write" on subcategories for all using (is_staff()) with check (is_staff());

-- INVENTORY : jamais exposé au client, uniquement usage interne (quantité dispo agrégée servie via API)
create policy "inventory_staff_only" on inventory for all using (is_staff()) with check (is_staff());

-- FOURNISSEURS : strictement internes
create policy "suppliers_staff_only" on suppliers for all using (is_staff()) with check (is_staff());
create policy "supplier_products_staff_only" on supplier_products for all using (is_staff()) with check (is_staff());
create policy "supplier_inventory_staff_only" on supplier_inventory for all using (is_staff()) with check (is_staff());
create policy "supplier_orders_staff_only" on supplier_orders for all using (is_staff()) with check (is_staff());

-- LIVRAISON / MAGASINS : lecture publique (zones et magasins actifs), écriture staff
create policy "shipping_zones_public_read" on shipping_zones for select using (is_active or is_staff());
create policy "shipping_zones_staff_write" on shipping_zones for all using (is_staff()) with check (is_staff());

create policy "stores_public_read" on stores for select using (is_active or is_staff());
create policy "stores_staff_write" on stores for all using (is_staff()) with check (is_staff());

create policy "store_inventory_staff_only" on store_inventory for all using (is_staff()) with check (is_staff());
create policy "store_pickups_staff_only" on store_pickups for all using (is_staff()) with check (is_staff());

-- ADRESSES : uniquement le propriétaire ou le staff
create policy "shipping_addresses_owner" on shipping_addresses for all
  using (profile_id = auth.uid() or is_staff())
  with check (profile_id = auth.uid() or is_staff());

-- COMMANDES : le client ne voit que ses commandes, le staff voit tout
create policy "orders_owner_or_staff_select" on orders for select
  using (customer_id = auth.uid() or is_staff());
create policy "orders_owner_insert" on orders for insert
  with check (customer_id = auth.uid() or is_staff());
create policy "orders_staff_update" on orders for update
  using (is_staff());

create policy "order_items_owner_or_staff" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_staff())));
create policy "order_items_staff_write" on order_items for insert
  with check (is_staff() or exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid()));

-- FULFILLMENT / PAIEMENTS : strictement internes (jamais exposés au client)
create policy "fulfillment_orders_staff_only" on fulfillment_orders for all using (is_staff()) with check (is_staff());
create policy "payments_staff_or_owner_select" on payments for select
  using (is_staff() or exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy "payments_staff_write" on payments for all using (is_staff()) with check (is_staff());

-- PROMOTIONS
create policy "coupons_public_read_active" on coupons for select using (is_active or is_staff());
create policy "coupons_staff_write" on coupons for all using (is_staff()) with check (is_staff());

-- AVIS : lecture publique des avis approuvés, un client gère uniquement les siens
create policy "reviews_public_read_approved" on reviews for select using (is_approved or customer_id = auth.uid() or is_staff());
create policy "reviews_owner_insert" on reviews for insert with check (customer_id = auth.uid());
create policy "reviews_staff_moderate" on reviews for update using (is_staff());
create policy "reviews_staff_delete" on reviews for delete using (is_staff());

-- WISHLIST : uniquement le propriétaire
create policy "wishlists_owner_only" on wishlists for all
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

-- BANNIÈRES : lecture publique, écriture staff (marketing/admin)
create policy "banners_public_read" on banners for select using (is_active or is_staff());
create policy "banners_staff_write" on banners for all using (is_staff()) with check (is_staff());

-- NOTIFICATIONS : uniquement le destinataire
create policy "notifications_owner_only" on notifications for all
  using (profile_id = auth.uid() or is_staff())
  with check (profile_id = auth.uid() or is_staff());

-- AUDIT LOGS : lecture staff uniquement, écriture via fonctions serveur (service role)
create policy "audit_logs_staff_read" on audit_logs for select using (is_staff());

-- SETTINGS : lecture publique des réglages non sensibles gérée au niveau applicatif,
-- ici on restreint par défaut au staff ; les clés publiques (ex: whatsapp_number)
-- seront exposées via une vue ou une route API dédiée, jamais par accès direct anonyme.
create policy "settings_staff_only" on settings for all using (is_staff()) with check (is_staff());

-- =========================================================================
-- TRIGGER : création automatique du profil à l'inscription
-- =========================================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    'CUSTOMER'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
