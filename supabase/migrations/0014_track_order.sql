-- =========================================================
-- 0014 — Suivi public de commande
-- Accès par numéro de commande + téléphone (9 derniers chiffres). Ne renvoie
-- ni adresse, ni email, ni identité : uniquement statut, montants et articles.
-- =========================================================
create or replace function track_order(p_order_number text, p_phone text)
returns table (
  order_number text,
  status order_status,
  reception_method reception_method,
  payment_method payment_method,
  payment_status payment_status,
  total numeric,
  created_at timestamptz,
  updated_at timestamptz,
  items jsonb
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_phone text := right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 9);
begin
  if length(v_phone) < 9 or length(btrim(coalesce(p_order_number, ''))) < 6 then
    return;
  end if;

  return query
  select o.order_number, o.status, o.reception_method, o.payment_method,
         o.payment_status, o.total, o.created_at, o.updated_at,
         coalesce((
           select jsonb_agg(jsonb_build_object('name', oi.product_name_snapshot, 'quantity', oi.quantity))
           from order_items oi where oi.order_id = o.id
         ), '[]'::jsonb)
  from orders o
  where upper(o.order_number) = upper(btrim(p_order_number))
    and right(regexp_replace(coalesce(o.customer_phone, ''), '\D', '', 'g'), 9) = v_phone;
end;
$$;

grant execute on function track_order(text, text) to anon, authenticated;
