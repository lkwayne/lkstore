-- =========================================================================
-- SENDUU — Zones de livraison de Yaoundé et Bafoussam
--
-- Même principe que Douala (0012) : le centre-ville est le moins cher,
-- les frais augmentent avec l'éloignement du centre.
--   1000 FCFA — centre-ville et quartiers centraux
--   1500 FCFA — quartiers intermédiaires
--   2000 FCFA — périphérie (délai de 2 jours)
--
-- ⚠ Tarifs alignés sur Douala à la demande du fondateur. Le magasin et le
-- stock sont à Douala : le coût réel d'acheminement vers ces villes
-- (transporteur / agence de voyage) n'est pas couvert par ces montants.
-- À réviser avec un devis transporteur. Quartiers à compléter au besoin.
-- =========================================================================

insert into shipping_zones (city, neighborhood, fee, estimated_days, cod_allowed, is_active) values
  ('Yaoundé', 'Centre-ville', 1000, 1, true, true),
  ('Yaoundé', 'Hippodrome', 1000, 1, true, true),
  ('Yaoundé', 'Bastos', 1000, 1, true, true),
  ('Yaoundé', 'Nlongkak', 1000, 1, true, true),
  ('Yaoundé', 'Tsinga', 1000, 1, true, true),
  ('Yaoundé', 'Mokolo', 1000, 1, true, true),
  ('Yaoundé', 'Elig-Essono', 1000, 1, true, true),
  ('Yaoundé', 'Mvog-Ada', 1000, 1, true, true),
  ('Yaoundé', 'Mvog-Mbi', 1000, 1, true, true),
  ('Yaoundé', 'Briqueterie', 1000, 1, true, true),
  ('Yaoundé', 'Messa', 1000, 1, true, true),
  ('Yaoundé', 'Etoa-Meki', 1000, 1, true, true),
  ('Yaoundé', 'Nkomkana', 1000, 1, true, true),
  ('Yaoundé', 'Essos', 1500, 1, true, true),
  ('Yaoundé', 'Melen', 1500, 1, true, true),
  ('Yaoundé', 'Ngoa-Ekelle', 1500, 1, true, true),
  ('Yaoundé', 'Biyem-Assi', 1500, 1, true, true),
  ('Yaoundé', 'Mvan', 1500, 1, true, true),
  ('Yaoundé', 'Mendong', 1500, 1, true, true),
  ('Yaoundé', 'Nsimeyong', 1500, 1, true, true),
  ('Yaoundé', 'Ekounou', 1500, 1, true, true),
  ('Yaoundé', 'Mimboman', 1500, 1, true, true),
  ('Yaoundé', 'Efoulan', 1500, 1, true, true),
  ('Yaoundé', 'Obili', 1500, 1, true, true),
  ('Yaoundé', 'Etoudi', 1500, 1, true, true),
  ('Yaoundé', 'Santa Barbara', 1500, 1, true, true),
  ('Yaoundé', 'Mfandena', 1500, 1, true, true),
  ('Yaoundé', 'Nsam', 1500, 1, true, true),
  ('Yaoundé', 'Awae', 1500, 1, true, true),
  ('Yaoundé', 'Nkolndongo', 1500, 1, true, true),
  ('Yaoundé', 'Emana', 1500, 1, true, true),
  ('Yaoundé', 'Odza', 2000, 2, true, true),
  ('Yaoundé', 'Ahala', 2000, 2, true, true),
  ('Yaoundé', 'Nkolbisson', 2000, 2, true, true),
  ('Yaoundé', 'Soa', 2000, 2, true, true),
  ('Yaoundé', 'Olembe', 2000, 2, true, true),
  ('Yaoundé', 'Nkoabang', 2000, 2, true, true),
  ('Yaoundé', 'Obobogo', 2000, 2, true, true),
  ('Yaoundé', 'Simbock', 2000, 2, true, true),
  ('Yaoundé', 'Nkolmesseng', 2000, 2, true, true),
  ('Yaoundé', 'Ngousso', 2000, 2, true, true),
  ('Yaoundé', 'Oyom-Abang', 2000, 2, true, true),
  ('Yaoundé', 'Nkozoa', 2000, 2, true, true),
  ('Yaoundé', 'Mbankomo', 2000, 2, true, true),
  ('Yaoundé', 'Ebang', 2000, 2, true, true),
  ('Yaoundé', 'Nsimalen', 2000, 2, true, true),
  ('Bafoussam', 'Centre-ville', 1000, 1, true, true),
  ('Bafoussam', 'Marché A', 1000, 1, true, true),
  ('Bafoussam', 'Marché B', 1000, 1, true, true),
  ('Bafoussam', 'Tamdja', 1000, 1, true, true),
  ('Bafoussam', 'Djeleng', 1000, 1, true, true),
  ('Bafoussam', 'Banengo', 1000, 1, true, true),
  ('Bafoussam', 'Kamkop', 1000, 1, true, true),
  ('Bafoussam', 'Tougang', 1500, 1, true, true),
  ('Bafoussam', 'Famla', 1500, 1, true, true),
  ('Bafoussam', 'Houkaha', 1500, 1, true, true),
  ('Bafoussam', 'Ndiangdam', 1500, 1, true, true),
  ('Bafoussam', 'Lafé', 1500, 1, true, true),
  ('Bafoussam', 'Baleng', 2000, 2, true, true),
  ('Bafoussam', 'Bamougoum', 2000, 2, true, true),
  ('Bafoussam', 'Mandjo', 2000, 2, true, true),
  ('Bafoussam', 'Djemoun', 2000, 2, true, true);
