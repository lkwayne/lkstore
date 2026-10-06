-- =========================================================================
-- SENDUU — Zones de livraison réelles pour Douala (3 paliers)
--
-- Remplace les 4 zones génériques du seed de démonstration par une vraie
-- liste de quartiers de Douala, sur 3 paliers de tarif :
--   1000 FCFA — Bonamoussadi et son corridor jusqu'à Akwa (le magasin
--               SENDUU se trouve à Bonamoussadi, carrefour lycée d'Akwa
--               Nord — au cœur de ce corridor)
--   1500 FCFA — autres quartiers de Douala
--   2000 FCFA — quartiers les plus éloignés de Bonamoussadi
--
-- Yaoundé et Bafoussam ne sont pas encore couvertes : aucune grille
-- tarifaire n'a été fournie pour ces villes. À ajouter une fois les
-- quartiers et tarifs définis (voir README).
-- =========================================================================

delete from shipping_zones where city = 'Douala';

insert into shipping_zones (city, neighborhood, fee, estimated_days, cod_allowed, is_active) values
  ('Douala', 'Bonamoussadi', 1000, 1, true, true),
  ('Douala', 'Makepe', 1000, 1, true, true),
  ('Douala', 'Denver', 1000, 1, true, true),
  ('Douala', 'Santa Barbara', 1000, 1, true, true),
  ('Douala', 'Kotto', 1000, 1, true, true),
  ('Douala', 'Logbessou', 1000, 1, true, true),
  ('Douala', 'Bepanda', 1000, 1, true, true),
  ('Douala', 'Ndokoti', 1000, 1, true, true),
  ('Douala', 'Akwa', 1000, 1, true, true),
  ('Douala', 'Akwa Nord', 1000, 1, true, true),
  ('Douala', 'Bonanjo', 1000, 1, true, true),
  ('Douala', 'Bonapriso', 1000, 1, true, true),
  ('Douala', 'Deido', 1000, 1, true, true),
  ('Douala', 'Bali', 1000, 1, true, true),
  ('Douala', 'Bessengue', 1000, 1, true, true),
  ('Douala', 'New Bell', 1000, 1, true, true),
  ('Douala', 'Ndogpassi', 1500, 1, true, true),
  ('Douala', 'Ndogbong', 1500, 1, true, true),
  ('Douala', 'Cite des Palmiers', 1500, 1, true, true),
  ('Douala', 'Cite SIC', 1500, 1, true, true),
  ('Douala', 'Village', 1500, 1, true, true),
  ('Douala', 'Bonamikengue', 1500, 1, true, true),
  ('Douala', 'Ndogsimbi', 1500, 1, true, true),
  ('Douala', 'Bonadibong', 1500, 1, true, true),
  ('Douala', 'Nylon', 1500, 1, true, true),
  ('Douala', 'Ngodi Bakoko', 1500, 1, true, true),
  ('Douala', 'PK8', 1500, 1, true, true),
  ('Douala', 'PK9', 1500, 1, true, true),
  ('Douala', 'PK10', 1500, 1, true, true),
  ('Douala', 'Logbaba', 1500, 1, true, true),
  ('Douala', 'Ndogmbe', 1500, 1, true, true),
  ('Douala', 'Bonaberi', 2000, 2, true, true),
  ('Douala', 'Bassa', 2000, 2, true, true),
  ('Douala', 'Kassalafam', 2000, 2, true, true),
  ('Douala', 'Nyalla', 2000, 2, true, true),
  ('Douala', 'PK12', 2000, 2, true, true),
  ('Douala', 'PK14', 2000, 2, true, true),
  ('Douala', 'PK17', 2000, 2, true, true),
  ('Douala', 'PK21', 2000, 2, true, true),
  ('Douala', 'PK24', 2000, 2, true, true),
  ('Douala', 'Bonassama', 2000, 2, true, true),
  ('Douala', 'Japoma', 2000, 2, true, true),
  ('Douala', 'Youpwe', 2000, 2, true, true),
  ('Douala', 'Ndobo', 2000, 2, true, true),
  ('Douala', 'Mambanda', 2000, 2, true, true),
  ('Douala', 'Song-Mahop', 2000, 2, true, true),
  ('Douala', 'Yansoki', 2000, 2, true, true);
