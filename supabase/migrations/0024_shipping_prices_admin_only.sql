-- 0024 — Seuls ADMIN / MANAGER / SUPER_ADMIN fixent les tarifs de livraison.
-- LOGISTICS peut toujours modifier délais, paiement à la livraison et activation,
-- mais ni changer un tarif ni ajouter un quartier (le tarif est fixé à la création).
-- Les appels sans utilisateur (service_role, migrations) ne sont pas contrôlés.

create or replace function shipping_zones_guard_prices()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if coalesce(auth_role() in ('SUPER_ADMIN', 'ADMIN', 'MANAGER'), false) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    raise exception 'Seuls un admin ou un manager peuvent ajouter un quartier (le tarif est fixé à la création).';
  end if;

  if new.fee is distinct from old.fee then
    raise exception 'Seuls un admin ou un manager peuvent modifier les tarifs de livraison.';
  end if;

  return new;
end;
$$;

revoke execute on function shipping_zones_guard_prices() from public, anon, authenticated;

create trigger shipping_zones_guard_prices
before insert or update on shipping_zones
for each row execute function shipping_zones_guard_prices();
