-- =========================================================
-- 0017 — Rôle SUPER_ADMIN et gestion d'équipe
-- NB : `alter type user_role add value 'SUPER_ADMIN'` doit être exécuté
-- dans une migration séparée AVANT ce fichier (0017a) : une valeur d'enum
-- fraîchement ajoutée ne peut pas être utilisée dans la même transaction.
--
-- Les rôles ne se changent QUE via des actions serveur réservées au
-- SUPER_ADMIN (service_role). Le trigger prevent_self_role_change bloque
-- déjà toute modification de rôle depuis un compte connecté.
-- =========================================================

create or replace function is_admin_or_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth_role() in ('SUPER_ADMIN', 'ADMIN', 'MANAGER'), false);
$$;

-- Il doit toujours rester au moins un SUPER_ADMIN.
create or replace function prevent_last_super_admin_loss()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role = 'SUPER_ADMIN'
     and (tg_op = 'DELETE' or new.role is distinct from 'SUPER_ADMIN')
     and (select count(*) from profiles where role = 'SUPER_ADMIN' and id <> old.id) = 0 then
    raise exception 'Il doit rester au moins un super administrateur.';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger profiles_keep_one_super_admin
  before update or delete on profiles
  for each row execute function prevent_last_super_admin_loss();

revoke execute on function prevent_last_super_admin_loss() from public, anon, authenticated;

-- Amorçage : le fondateur devient super administrateur.
update profiles
set role = 'SUPER_ADMIN'
where id = (select id from auth.users where email = 'leukeufarrel@gmail.com');
