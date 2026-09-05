-- =========================================================================
-- SENDUU — Migration de rebrand (ex-BENDO)
-- L'enseigne a été renommée BENDO → SENDUU. Cette migration met à jour les
-- éléments du schéma qui portaient encore l'ancien nom en dur : la valeur
-- d'enum désignant le stock propre, et le préfixe du numéro de commande.
-- Renommer une valeur d'enum PostgreSQL met à jour toutes les lignes
-- existantes qui l'utilisent automatiquement — aucune perte de données.
-- =========================================================================

alter type fulfillment_type rename value 'BENDO_STOCK' to 'SENDUU_STOCK';

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

  return 'SEN-' || current_year || '-' || lpad(next_value::text, 6, '0');
end;
$$;

-- Corrige les données de démonstration déjà semées avant le rebrand (sans
-- effet si le seed n'a pas encore été exécuté ou utilise déjà les noms
-- SENDUU — clause WHERE idempotente).
update brands set name = 'SENDUU Essentials', slug = 'senduu-essentials' where slug = 'bendo-essentials';
update stores set name = 'SENDUU Bepanda' where name = 'BENDO Bepanda';
