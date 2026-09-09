-- =========================================================================
-- SENDUU — Référence interne automatique pour fulfillment_orders
-- Le numéro de suivi transporteur (tracking_number) ne peut venir que du
-- fournisseur réel une fois l'envoi effectué — impossible à générer
-- honnêtement. En revanche, une référence interne SENDUU peut et doit être
-- attribuée automatiquement dès la création de la commande fournisseur,
-- pour que le staff ait immédiatement un identifiant à utiliser en
-- attendant le vrai numéro de suivi.
-- =========================================================================

create table if not exists fulfillment_number_counters (
  year integer primary key,
  current_value bigint not null default 0
);

alter table fulfillment_orders add column if not exists reference text unique;

create or replace function generate_fulfillment_reference()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_year integer := extract(year from now())::integer;
  next_value bigint;
begin
  if new.reference is not null then
    return new;
  end if;

  insert into fulfillment_number_counters (year, current_value)
  values (current_year, 1)
  on conflict (year)
  do update set current_value = fulfillment_number_counters.current_value + 1
  returning current_value into next_value;

  new.reference := 'FUL-' || current_year || '-' || lpad(next_value::text, 6, '0');
  return new;
end;
$$;

drop trigger if exists trg_fulfillment_reference on fulfillment_orders;
create trigger trg_fulfillment_reference
  before insert on fulfillment_orders
  for each row execute function generate_fulfillment_reference();

-- Rétro-attribution d'une référence aux commandes fournisseur déjà créées
-- avant cette migration (le cas échéant).
do $$
declare
  r record;
  current_year integer;
  next_value bigint;
begin
  for r in select id, created_at from fulfillment_orders where reference is null order by created_at
  loop
    current_year := extract(year from r.created_at)::integer;
    insert into fulfillment_number_counters (year, current_value)
    values (current_year, 1)
    on conflict (year)
    do update set current_value = fulfillment_number_counters.current_value + 1
    returning current_value into next_value;

    update fulfillment_orders
    set reference = 'FUL-' || current_year || '-' || lpad(next_value::text, 6, '0')
    where id = r.id;
  end loop;
end $$;

alter table fulfillment_orders alter column reference set not null;
