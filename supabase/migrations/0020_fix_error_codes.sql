-- 0020 — Corrige les codes d'erreur de create_order : un SQLSTATE fait 5 caractères.
-- 'BEND10'/'BEND11' (et 'BEND12') provoquaient « unrecognized exception condition »
-- au lieu du message lisible côté client (bug présent depuis 0002).
create or replace function create_order(payload jsonb)
returns table(order_id uuid, order_number text, total numeric)
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
  v_order_item record;
  v_coupon_code text := nullif(upper(btrim(coalesce(payload->>'coupon_code', ''))), '');
  v_coupon_id uuid;
  v_discount numeric := 0;
  v_coupon_error text;
begin
  -- Appel serveur (service_role) : le client connecté est transmis par l'action serveur.
  if v_customer_id is null and coalesce(auth.role(), '') = 'service_role' then
    v_customer_id := nullif(payload->>'customer_id', '')::uuid;
  end if;

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
      raise exception 'Le paiement à la livraison n''est pas disponible pour un des articles de votre panier.' using errcode = 'BENDA';
    end if;
    if v_reception = 'DELIVERY' then
      perform 1 from shipping_zones
        where id = (payload->>'shipping_zone_id')::uuid and cod_allowed = true;
      if not found then
        raise exception 'Le paiement à la livraison n''est pas disponible dans cette zone.' using errcode = 'BENDB';
      end if;
    end if;
  end if;

  -- Code promo : la remise est toujours recalculée ici, jamais fournie par le client.
  if v_coupon_code is not null then
    perform 1 from coupons where upper(code) = v_coupon_code for update;
    select cc.coupon_id, cc.discount, cc.error_message
    into v_coupon_id, v_discount, v_coupon_error
    from check_coupon(v_coupon_code, v_subtotal) cc;

    if v_coupon_error is not null then
      raise exception '%', v_coupon_error using errcode = 'BENDC';
    end if;

    update coupons set usage_count = usage_count + 1 where id = v_coupon_id;
  end if;

  v_total := v_subtotal - v_discount + v_shipping_fee;

  if v_reception = 'DELIVERY' then
    insert into shipping_addresses (profile_id, full_name, phone, city, neighborhood, address_line, instructions)
    select
      v_customer_id,
      (payload->>'customer_first_name') || ' ' || (payload->>'customer_last_name'),
      payload->>'customer_phone',
      sz.city,
      coalesce(payload->>'neighborhood', sz.neighborhood),
      payload->>'address_line',
      payload->>'instructions'
    from shipping_zones sz
    where sz.id = (payload->>'shipping_zone_id')::uuid
    returning id into v_shipping_address_id;
  end if;

  v_order_number := next_order_number();

  insert into orders (
    order_number, customer_id, status, reception_method,
    shipping_address_id, store_id, subtotal, shipping_fee, discount_total, total,
    payment_method, payment_status, coupon_id,
    customer_first_name, customer_last_name, customer_phone, customer_email
  ) values (
    v_order_number, v_customer_id, 'PENDING', v_reception,
    v_shipping_address_id, v_store_id, v_subtotal, v_shipping_fee, v_discount, v_total,
    v_payment, 'PENDING', v_coupon_id,
    payload->>'customer_first_name', payload->>'customer_last_name',
    payload->>'customer_phone', nullif(payload->>'customer_email', '')
  )
  returning id into v_order_id;

  for v_order_item in select * from tmp_order_items
  loop
    insert into order_items (order_id, product_id, product_name_snapshot, unit_price, quantity, fulfillment_type)
    values (
      v_order_id, v_order_item.product_id, v_order_item.product_name,
      v_order_item.unit_price, v_order_item.quantity, v_order_item.fulfillment_type
    );

    update products
    set stock_quantity = stock_quantity - v_order_item.quantity,
        updated_at = now()
    where id = v_order_item.product_id;

    if v_order_item.fulfillment_type in ('DROPSHIPPING', 'MIXED') then
      select sp.supplier_id, sp.supplier_cost, sp.shipping_cost
      into v_supplier
      from supplier_products sp
      where sp.product_id = v_order_item.product_id
        and sp.status = 'ACTIVE'
        and sp.supplier_stock > 0
      order by sp.priority asc
      limit 1;

      if v_supplier.supplier_id is not null then
        insert into fulfillment_orders
          (order_id, supplier_id, product_id, quantity, supplier_cost, shipping_cost, status)
        values (
          v_order_id, v_supplier.supplier_id, v_order_item.product_id,
          v_order_item.quantity, v_supplier.supplier_cost, v_supplier.shipping_cost,
          'PENDING_SUPPLIER'
        );
      end if;
    end if;
  end loop;

  if v_reception = 'STORE_PICKUP' then
    insert into store_pickups (order_id, store_id) values (v_order_id, v_store_id);
  end if;

  insert into audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (v_customer_id, 'ORDER_CREATED', 'orders', v_order_id,
          jsonb_build_object('order_number', v_order_number, 'total', v_total, 'discount', v_discount));

  return query select v_order_id, v_order_number, v_total;
end;
$$;
