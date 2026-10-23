-- 0025 — create_order n'est plus appelable directement depuis le navigateur.
-- Seul le serveur (service_role, via l'action de commande) peut la lancer ;
-- le client connecté est transmis par l'action serveur (voir 0019).
revoke execute on function create_order(jsonb) from public, anon, authenticated;
grant execute on function create_order(jsonb) to service_role;
