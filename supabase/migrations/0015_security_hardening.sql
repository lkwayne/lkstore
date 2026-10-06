-- =========================================================
-- 0015 — Durcissement de sécurité (audit du 2026-10-06)
-- 1. Tables de compteurs : RLS activée, aucun accès direct client.
-- 2. Fonctions internes : EXECUTE retiré aux rôles publics. Elles restent
--    utilisables par create_order (SECURITY DEFINER, propriétaire postgres)
--    et par les triggers (le droit EXECUTE n'est pas contrôlé au déclenchement).
-- =========================================================

alter table order_counters enable row level security;
alter table fulfillment_number_counters enable row level security;
revoke all on order_counters from anon, authenticated;
revoke all on fulfillment_number_counters from anon, authenticated;

revoke execute on function next_order_number() from public, anon, authenticated;
revoke execute on function generate_fulfillment_reference() from public, anon, authenticated;
revoke execute on function handle_new_user() from public, anon, authenticated;
revoke execute on function prevent_self_role_change() from public, anon, authenticated;
revoke execute on function enforce_review_rules() from public, anon, authenticated;
