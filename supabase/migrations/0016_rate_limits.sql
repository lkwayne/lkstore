-- =========================================================
-- 0016 — Limitation de débit (anti-abus)
-- Fenêtre fixe par clé (ex: "login:ip:1.2.3.4"). La table n'est accessible
-- qu'au service_role, via la fonction rate_limit_hit appelée côté serveur.
-- =========================================================

create table if not exists rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 0
);

alter table rate_limits enable row level security;
revoke all on rate_limits from anon, authenticated;

-- Retourne true si l'appel est autorisé, false si la limite est dépassée.
create or replace function rate_limit_hit(p_key text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hits integer;
begin
  insert into rate_limits as r (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update
    set window_start = case
          when r.window_start < now() - make_interval(secs => p_window_seconds)
          then now() else r.window_start end,
        hits = case
          when r.window_start < now() - make_interval(secs => p_window_seconds)
          then 1 else r.hits + 1 end
  returning hits into v_hits;

  -- Nettoyage opportuniste des anciennes fenêtres (1 appel sur ~50).
  if random() < 0.02 then
    delete from rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_max;
end;
$$;

revoke execute on function rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function rate_limit_hit(text, integer, integer) to service_role;
