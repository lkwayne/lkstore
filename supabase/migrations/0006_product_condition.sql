-- =========================================================================
-- SENDUU — État du produit (neuf / occasion)
-- =========================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_condition') then
    create type product_condition as enum ('NEUF', 'OCCASION');
  end if;
end $$;

alter table products
  add column if not exists condition product_condition not null default 'NEUF';
