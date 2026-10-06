-- =========================================================
-- 0018 — Droits par rôle (défense en profondeur côté base)
--
-- Groupes de rôles :
--   managers    = SUPER_ADMIN, ADMIN, MANAGER      (is_admin_or_manager)
--   commandes   = managers + LOGISTICS + CUSTOMER_SUPPORT
--   catalogue   = managers + MARKETING
--   avis        = managers + CUSTOMER_SUPPORT + MARKETING
--   logistique  = managers + LOGISTICS
--
-- + FERMETURE D'UNE FUITE : products.cost_price (prix d'achat) était lisible
--   par n'importe qui via l'API publique. La colonne n'est plus accessible
--   qu'au service_role ; le back-office la lit via une action serveur gardée.
-- NB : toute NOUVELLE colonne de `products` devra recevoir un
--   `grant select (colonne) on products to anon, authenticated`.
-- =========================================================

create or replace function can_manage_orders() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(auth_role() in ('SUPER_ADMIN','ADMIN','MANAGER','LOGISTICS','CUSTOMER_SUPPORT'), false);
$$;

create or replace function can_edit_catalog() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(auth_role() in ('SUPER_ADMIN','ADMIN','MANAGER','MARKETING'), false);
$$;

create or replace function can_moderate_reviews() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(auth_role() in ('SUPER_ADMIN','ADMIN','MANAGER','CUSTOMER_SUPPORT','MARKETING'), false);
$$;

create or replace function can_handle_fulfillment() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(auth_role() in ('SUPER_ADMIN','ADMIN','MANAGER','LOGISTICS'), false);
$$;

-- Commandes, lignes, paiements ------------------------------------------
alter policy orders_owner_or_staff_select on orders using ((customer_id = auth.uid()) or can_manage_orders());
alter policy orders_staff_update on orders using (can_manage_orders());
alter policy orders_staff_insert on orders with check (can_manage_orders());
alter policy order_items_owner_or_staff on order_items using (exists (
  select 1 from orders o where o.id = order_items.order_id
    and ((o.customer_id = auth.uid()) or can_manage_orders())));
alter policy order_items_staff_insert on order_items with check (can_manage_orders());
alter policy payments_staff_write on payments using (can_manage_orders()) with check (can_manage_orders());
alter policy payments_staff_or_owner_select on payments using (can_manage_orders() or exists (
  select 1 from orders o where o.id = payments.order_id and o.customer_id = auth.uid()));
alter policy store_pickups_staff_only on store_pickups using (can_manage_orders()) with check (can_manage_orders());

-- Fournisseurs, coûts, dropshipping ---------------------------------------
alter policy suppliers_staff_only on suppliers using (is_admin_or_manager()) with check (is_admin_or_manager());
alter policy supplier_products_staff_only on supplier_products using (is_admin_or_manager()) with check (is_admin_or_manager());
alter policy supplier_inventory_staff_only on supplier_inventory using (is_admin_or_manager()) with check (is_admin_or_manager());
alter policy supplier_orders_staff_only on supplier_orders using (is_admin_or_manager()) with check (is_admin_or_manager());
alter policy fulfillment_orders_staff_only on fulfillment_orders using (can_handle_fulfillment()) with check (can_handle_fulfillment());
-- La logistique doit voir le nom du fournisseur d'une commande à traiter (lecture seule).
create policy suppliers_logistics_read on suppliers for select using (can_handle_fulfillment());

-- Catalogue ----------------------------------------------------------------
alter policy products_staff_write on products using (can_edit_catalog()) with check (can_edit_catalog());
alter policy categories_staff_write on categories using (can_edit_catalog()) with check (can_edit_catalog());
alter policy subcategories_staff_write on subcategories using (can_edit_catalog()) with check (can_edit_catalog());
alter policy brands_staff_write on brands using (can_edit_catalog()) with check (can_edit_catalog());
alter policy product_images_staff_write on product_images using (can_edit_catalog()) with check (can_edit_catalog());
alter policy product_variants_staff_write on product_variants using (can_edit_catalog()) with check (can_edit_catalog());
alter policy inventory_staff_only on inventory using (can_edit_catalog()) with check (can_edit_catalog());
alter policy store_inventory_staff_only on store_inventory using (can_edit_catalog()) with check (can_edit_catalog());
alter policy banners_staff_write on banners using (can_edit_catalog()) with check (can_edit_catalog());
alter policy coupons_staff_write on coupons using (can_edit_catalog()) with check (can_edit_catalog());

-- Avis ---------------------------------------------------------------------
alter policy reviews_staff_moderate on reviews using (can_moderate_reviews());
alter policy reviews_staff_delete on reviews using (can_moderate_reviews());

-- Réglages ------------------------------------------------------------------
alter policy settings_staff_only on settings using (is_admin_or_manager()) with check (is_admin_or_manager());
alter policy shipping_zones_staff_write on shipping_zones using (is_admin_or_manager()) with check (is_admin_or_manager());
alter policy stores_staff_write on stores using (is_admin_or_manager()) with check (is_admin_or_manager());
alter policy audit_logs_staff_read on audit_logs using (is_admin_or_manager());

-- Fuite du prix d'achat -----------------------------------------------------
revoke select on products from anon, authenticated;
do $$
declare cols text;
begin
  select string_agg(quote_ident(column_name), ', ') into cols
  from information_schema.columns
  where table_schema = 'public' and table_name = 'products' and column_name <> 'cost_price';
  execute format('grant select (%s) on products to anon, authenticated', cols);
end $$;
