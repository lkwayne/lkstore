-- =========================================================================
-- SENDUU — Durcissement sécurité (2 failles de contrôle d'accès)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Empêcher un utilisateur de modifier son propre rôle.
--
-- La policy `profiles_update_own` autorisait la modification de n'importe
-- quelle colonne de son propre profil, y compris `role` — un client pouvait
-- donc s'auto-promouvoir ADMIN. On bloque ce changement via un trigger :
-- toute tentative de modifier `role` à travers une session authentifiée
-- (auth.uid() non nul) est rejetée. Une connexion directe (service_role /
-- SQL Editor / ce backoffice), où auth.uid() est nul, reste autorisée —
-- c'est le seul chemin légitime pour promouvoir un compte aujourd'hui.
-- -------------------------------------------------------------------------

create or replace function prevent_self_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'Vous ne pouvez pas modifier votre propre rôle.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_self_role_change on profiles;
create trigger trg_prevent_self_role_change
  before update on profiles
  for each row execute function prevent_self_role_change();

-- -------------------------------------------------------------------------
-- 2. Empêcher un client d'insérer directement une commande / ligne de
-- commande, en contournant create_order() (qui revérifie prix, stock,
-- disponibilité). create_order() est SECURITY DEFINER : elle continue de
-- fonctionner normalement sans ces policies, car elle ne dépend pas des
-- droits RLS du client pour écrire.
-- -------------------------------------------------------------------------

drop policy if exists "orders_owner_insert" on orders;
create policy "orders_staff_insert" on orders for insert
  with check (is_staff());

drop policy if exists "order_items_staff_write" on order_items;
create policy "order_items_staff_insert" on order_items for insert
  with check (is_staff());
