-- =========================================================
-- 0013 — Avis clients
-- Règles : un avis par client et par produit, réservé aux clients ayant
-- reçu le produit (commande DELIVERED/COMPLETED), toujours en attente de
-- modération à la création. Le client ne peut jamais s'auto-approuver.
-- =========================================================

create unique index if not exists reviews_one_per_customer_product
  on reviews (customer_id, product_id);

create index if not exists reviews_product_approved_idx
  on reviews (product_id) where is_approved;

-- Trigger : force la modération et vérifie l'achat -----------------------
create or replace function enforce_review_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item uuid;
begin
  if is_staff() then
    return new;
  end if;

  select oi.id into v_item
  from order_items oi
  join orders o on o.id = oi.order_id
  where o.customer_id = new.customer_id
    and oi.product_id = new.product_id
    and o.status in ('DELIVERED', 'COMPLETED')
  order by o.created_at desc
  limit 1;

  if v_item is null then
    raise exception 'Vous ne pouvez noter que les produits que vous avez reçus.';
  end if;

  new.order_item_id := v_item;
  new.is_approved := false;
  new.comment := nullif(left(btrim(coalesce(new.comment, '')), 1000), '');
  return new;
end;
$$;

drop trigger if exists reviews_enforce_rules on reviews;
create trigger reviews_enforce_rules
  before insert on reviews
  for each row execute function enforce_review_rules();

-- Lecture publique des avis approuvés (prénom + initiale uniquement) ------
create or replace function get_product_reviews(p_product_id uuid)
returns table (
  id uuid,
  rating integer,
  comment text,
  created_at timestamptz,
  reviewer_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select r.id, r.rating, r.comment, r.created_at,
         coalesce(nullif(btrim(p.first_name), ''), 'Client')
           || coalesce(' ' || left(nullif(btrim(p.last_name), ''), 1) || '.', '')
  from reviews r
  left join profiles p on p.id = r.customer_id
  where r.product_id = p_product_id and r.is_approved
  order by r.created_at desc
  limit 50;
$$;

create or replace function get_product_rating_stats(p_product_id uuid)
returns table (average_rating numeric, review_count integer)
language sql
stable
security definer
set search_path = public
as $$
  select round(avg(rating)::numeric, 1), count(*)::integer
  from reviews
  where product_id = p_product_id and is_approved;
$$;

-- Statut du client connecté vis-à-vis du produit : 'ANONYMOUS',
-- 'NOT_PURCHASED', 'CAN_REVIEW', 'PENDING' (avis en attente), 'REVIEWED'.
create or replace function get_my_review_status(p_product_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_approved boolean;
begin
  if v_uid is null then
    return 'ANONYMOUS';
  end if;

  select is_approved into v_approved
  from reviews where customer_id = v_uid and product_id = p_product_id;
  if found then
    return case when v_approved then 'REVIEWED' else 'PENDING' end;
  end if;

  if exists (
    select 1 from order_items oi join orders o on o.id = oi.order_id
    where o.customer_id = v_uid and oi.product_id = p_product_id
      and o.status in ('DELIVERED', 'COMPLETED')
  ) then
    return 'CAN_REVIEW';
  end if;

  return 'NOT_PURCHASED';
end;
$$;

grant execute on function get_product_reviews(uuid) to anon, authenticated;
grant execute on function get_product_rating_stats(uuid) to anon, authenticated;
grant execute on function get_my_review_status(uuid) to anon, authenticated;
