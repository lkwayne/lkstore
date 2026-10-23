-- 0026 — « En promotion » devient automatique : un produit est en promotion
-- dès qu'il a un prix barré supérieur à son prix de vente.
create or replace function products_set_on_sale()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.is_on_sale := new.compare_at_price is not null and new.compare_at_price > new.price;
  return new;
end;
$$;

create trigger products_auto_on_sale
before insert or update on products
for each row execute function products_set_on_sale();

-- Rattrapage des produits existants.
update products
set is_on_sale = (compare_at_price is not null and compare_at_price > price)
where is_on_sale is distinct from (compare_at_price is not null and compare_at_price > price);
