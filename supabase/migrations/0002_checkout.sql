-- =========================================================================
-- BENDO — Migration Checkout
-- Ajoute le nécessaire pour créer une commande de bout en bout, de façon
-- transactionnelle et sans jamais faire confiance à un prix envoyé par le
-- client : coordonnées invité, compteur de numéro de commande, fonction
-- create_order() qui revérifie tout côté serveur.
-- =========================================================================

-- -------------------------------------------------------------------------
-- Coordonnées client invité (pas encore d'authentification côté BENDO)
-- -------------------------------------------------------------------------
alter table orders
  add column if not exists customer_first_name text,
  add column if not exists customer_last_name text,
  add column if not exists customer_phone text,
  add column if not exists customer_email text;

-- -------------------------------------------------------------------------
-- Compteur de numéro de commande, un par année : BEN-2026-000001
-- -------------------------------------------------------------------------
create table if not exists order_counters (
  year integer primary key,
  current_value bigint not null default 0
);

create or replace function next_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_year integer := extract(year from now())::integer;
  next_value bigint;
begin
  insert into order_counters (year, current_value)
  values (current_year, 1)
  on conflict (year)
  do update set current_value = order_counters.current_value + 1
  returning current_value into next_value;

  return 'BEN-' || current_year || '-' || lpad(next_value::text, 6, '0');
end;
$$;

-- -------------------------------------------------------------------------
-- create_order() — point d'entrée unique et transactionnel pour créer une
-- commande. SECURITY DEFINER : les clients (anonymes ou connectés) peuvent
-- l'appeler via RPC, mais ne peuvent pas écrire directement dans orders,
-- order_items, fulfillment_orders ou décrémenter products.stock_quantity —
-- tout passe par cette fonction, qui revalide chaque donnée sensible.
--
-- payload attendu (jsonb) :
-- {
--   "items": [{ "product_id": "uuid", "quantity": 2 }, ...],
--   "reception_method": "DELIVERY" | "STORE_PICKUP",
--   "payment_method": "CASH_ON_DELIVERY" | "PAY_IN_STORE",
--   "customer_first_name": "...", "customer_last_name": "...",
--   "customer_phone": "...", "customer_email": "..." (optionnel),
--   "shipping_zone_id": "uuid" (si DELIVERY),
--   "address_line": "...", "neighborhood": "...", "instructions": "..." (si DELIVERY),
--   "store_id": "uuid" (si STORE_PICKUP)
-- }
-- -------------------------------------------------------------------------
create or replace function create_order(payload jsonb)
returns table (order_id uuid, order_number text, total numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items jsonb := payload->'items';
  v_item jsonb;
  v_reception reception_method := (payload->>'reception_method')::reception_method;
  v_payment payment_method := (payload->>'payment_method')::payment_method;
  v_customer_id uuid := auth.uid();
  v_shipping_address_id uuid;
  v_store_id uuid;
  v_shipping_fee numeric := 0;
  v_subtotal numeric := 0;
  v_total numeric := 0;
  v_order_id uuid;
  v_order_number text;
  v_product record;
  v_quantity integer;
  v_cod_blocked boolean := false;
  v_pickup_blocked boolean := false;
  v_supplier record;
begin
  if v_items is null or jsonb_array_length(v_items) = 0 then
    raise exception 'Le panier est vide.' using errcode = 'BEND1';
  end if;

  if v_reception is null or v_payment is null then
    raise exception 'Mode de réception ou de paiement manquant.' using errcode = 'BEND2';
  end if;

  if trim(coalesce(payload->>'customer_first_name', '')) = ''
     or trim(coalesce(payload->>'customer_last_name', '')) = ''
     or trim(coalesce(payload->>'customer_phone', '')) = '' then
    raise exception 'Vos informations de contact sont incomplètes.' using errcode = 'BEND3';
  end if;

  -- ---------------------------------------------------------------------
  -- Réception : livraison (zone + tarif réel) ou retrait magasin (magasin actif)
  -- ---------------------------------------------------------------------
  if v_reception = 'DELIVERY' then
    select fee into v_shipping_fee
    from shipping_zones
    where id = (payload->>'shipping_zone_id')::uuid
      and is_active = true;

    if v_shipping_fee is null then
      raise exception 'Cette zone de livraison n''est pas desservie.' using errcode = 'BEND4';
    end if;
  else
    select id into v_store_id
    from stores
    where id = (payload->>'store_id')::uuid
      and is_active = true;

    if v_store_id is null then
      raise exception 'Ce magasin n''est pas disponible pour le retrait.' using errcode = 'BEND5';
    end if;
  end if;

  -- ---------------------------------------------------------------------
  -- Ligne de commande temporaire pour valider chaque produit
  -- ---------------------------------------------------------------------
  create temporary table tmp_order_items (
    product_id uuid,
    quantity integer,
    unit_price numeric,
    product_name text,
    fulfillment_type fulfillment_type,
    cod_available boolean,
    store_pickup_available boolean
  ) on commit drop;

  for v_item in select * from jsonb_array_elements(v_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Quantité invalide pour un article du panier.' using errcode = 'BEND6';
    end if;

    -- Verrouille la ligne produit pour éviter une vente concurrente du même stock.
    select id, name, price, stock_quantity, status, fulfillment_type,
           cod_available, store_pickup_available
    into v_product
    from products
    where id = (v_item->>'product_id')::uuid
    for update;

    if v_product.id is null or v_product.status <> 'PUBLISHED' then
      raise exception 'Un des produits de votre panier n''est plus disponible.' using errcode = 'BEND7';
    end if;

    if v_product.stock_quantity < v_quantity then
      raise exception 'Stock insuffisant pour "%".', v_product.name using errcode = 'BEND8';
    end if;

    if not v_product.cod_available then
      v_cod_blocked := true;
    end if;
    if not v_product.store_pickup_available then
      v_pickup_blocked := true;
    end if;

    insert into tmp_order_items
      (product_id, quantity, unit_price, product_name, fulfillment_type, cod_available, store_pickup_available)
    values
      (v_product.id, v_quantity, v_product.price, v_product.name, v_product.fulfillment_type,
       v_product.cod_available, v_product.store_pickup_available);

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  end loop;

  if v_reception = 'STORE_PICKUP' and v_pickup_blocked then
    raise exception 'Le retrait en magasin n''est pas disponible pour un des articles de votre panier.' using errcode = 'BEND9';
  end if;

  if v_payment = 'CASH_ON_DELIVERY' then
    if v_cod_blocked then
      raise exception 'Le paiement à la livraison n''est pas disponible pour un des articles de votre panier.' using errcode = 'BEND10';
    end if;
    if v_reception = 'DELIVERY' then
      perform 1 from shipping_zones
        where id = (payload->>'shipping_zone_id')::uuid and cod_allowed = true;
      if not found then
        raise exception 'Le paiement à la livraison n''est pas disponible dans cette zone.' using errcode = 'BEND11';
      end if;
    end if;
  end if;

  v_total := v_subtotal + v_shipping_fee;

  -- ---------------------------------------------------------------------
  -- Adresse de livraison (si applicable)
  -- ---------------------------------------------------------------------
  if v_reception = 'DELIVERY' then
    insert into shipping_addresses (profile_id, full_name, phone, city, neighborhood, address_line, instructions)
    select
      v_customer_id,
      payload->>'customer_first_name' || ' ' || payload->>'customer_last_name',
      payload->>'customer_phone',
      sz.city,
      coalesce(payload->>'neighborhood', sz.neighborhood),
      payload->>'address_line',
      payload->>'instructions'
    from shipping_zones sz
    where sz.id = (payload->>'shipping_zone_id')::uuid
    returning id into v_shipping_address_id;
  end if;

  -- ---------------------------------------------------------------------
  -- Commande
  -- ---------------------------------------------------------------------
  v_order_number := next_order_number();

  insert into orders (
    order_number, customer_id, status, reception_method,
    shipping_address_id, store_id, subtotal, shipping_fee, discount_total, total,
    payment_method, payment_status,
    customer_first_name, customer_last_name, customer_phone, customer_email
  ) values (
    v_order_number, v_customer_id, 'PENDING', v_reception,
    v_shipping_address_id, v_store_id, v_subtotal, v_shipping_fee, 0, v_total,
    v_payment, 'PENDING',
    payload->>'customer_first_name', payload->>'customer_last_name',
    payload->>'customer_phone', nullif(payload->>'customer_email', '')
  )
  returning id into v_order_id;

  -- ---------------------------------------------------------------------
  -- Lignes de commande + décrément de stock + fulfillment dropshipping
  -- ---------------------------------------------------------------------
  for v_item in select * from tmp_order_items
  loop
    insert into order_items (order_id, product_id, product_name_snapshot, unit_price, quantity, fulfillment_type)
    values (
      v_order_id, (v_item->>'product_id')::uuid, v_item->>'product_name',
      (v_item->>'unit_price')::numeric, (v_item->>'quantity')::integer,
      (v_item->>'fulfillment_type')::fulfillment_type
    );

    update products
    set stock_quantity = stock_quantity - (v_item->>'quantity')::integer,
        updated_at = now()
    where id = (v_item->>'product_id')::uuid;

    if (v_item->>'fulfillment_type')::fulfillment_type in ('DROPSHIPPING', 'MIXED') then
      select sp.supplier_id, sp.supplier_cost, sp.shipping_cost
      into v_supplier
      from supplier_products sp
      where sp.product_id = (v_item->>'product_id')::uuid
        and sp.status = 'ACTIVE'
        and sp.supplier_stock > 0
      order by sp.priority asc
      limit 1;

      if v_supplier.supplier_id is not null then
        insert into fulfillment_orders
          (order_id, supplier_id, product_id, quantity, supplier_cost, shipping_cost, status)
        values (
          v_order_id, v_supplier.supplier_id, (v_item->>'product_id')::uuid,
          (v_item->>'quantity')::integer, v_supplier.supplier_cost, v_supplier.shipping_cost,
          'PENDING_SUPPLIER'
        );
      end if;
    end if;
  end loop;

  if v_reception = 'STORE_PICKUP' then
    insert into store_pickups (order_id, store_id) values (v_order_id, v_store_id);
  end if;

  insert into audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (v_customer_id, 'ORDER_CREATED', 'orders', v_order_id, jsonb_build_object('order_number', v_order_number, 'total', v_total));

  return query select v_order_id, v_order_number, v_total;
end;
$$;

grant execute on function create_order(jsonb) to anon, authenticated;
grant execute on function next_order_number() to anon, authenticated;

-- -------------------------------------------------------------------------
-- Permettre à un invité (customer_id null) de relire la commande qu'il
-- vient de créer dans la même requête RPC n'est pas nécessaire (la fonction
-- retourne déjà les données) — aucune policy de lecture supplémentaire
-- n'est ouverte ici pour ne pas permettre l'énumération des commandes.
-- -------------------------------------------------------------------------
