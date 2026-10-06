-- 0021 — Annulation d'une commande : le stock est remis, l'usage du code promo libéré.
-- Constat (test complet) : create_order décrémente le stock mais annuler la commande
-- ne le remettait jamais -> ruptures fantômes.
-- Une commande annulée ne peut plus changer de statut (évite un double rétablissement).

create or replace function orders_restore_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'CANCELLED' and new.status <> 'CANCELLED' then
    raise exception 'Une commande annulée ne peut pas être réactivée. Créez une nouvelle commande.';
  end if;

  if new.status = 'CANCELLED' and old.status <> 'CANCELLED' then
    update products p
    set stock_quantity = p.stock_quantity + oi.quantity,
        updated_at = now()
    from order_items oi
    where oi.order_id = new.id and oi.product_id = p.id;

    if new.coupon_id is not null then
      update coupons set usage_count = greatest(usage_count - 1, 0) where id = new.coupon_id;
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function orders_restore_on_cancel() from public, anon, authenticated;

create trigger orders_restore_on_cancel
before update of status on orders
for each row execute function orders_restore_on_cancel();
