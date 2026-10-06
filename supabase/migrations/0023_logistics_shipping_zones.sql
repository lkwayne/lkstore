-- 0023 — Le rôle LOGISTICS peut gérer les zones et tarifs de livraison
-- (can_handle_fulfillment = SUPER_ADMIN, ADMIN, MANAGER, LOGISTICS).
alter policy shipping_zones_staff_write on shipping_zones
  using (can_handle_fulfillment()) with check (can_handle_fulfillment());
