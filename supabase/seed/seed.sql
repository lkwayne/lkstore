-- =========================================================================
-- BENDO — Seed de démonstration
-- Toutes les données ci-dessous sont fictives, à usage de test uniquement.
-- À exécuter après supabase/migrations/0001_init.sql.
-- =========================================================================

-- -------------------------------------------------------------------------
-- CATÉGORIES (sous-ensemble représentatif de la liste complète du brief)
-- -------------------------------------------------------------------------
insert into categories (id, name, slug, sort_order) values
  ('11111111-0000-0000-0000-000000000001', 'Téléphones & Tablettes', 'telephones-tablettes', 1),
  ('11111111-0000-0000-0000-000000000002', 'Informatique', 'informatique', 2),
  ('11111111-0000-0000-0000-000000000003', 'Électroménager', 'electromenager', 3),
  ('11111111-0000-0000-0000-000000000004', 'Mode', 'mode', 4),
  ('11111111-0000-0000-0000-000000000005', 'Maison', 'maison', 5),
  ('11111111-0000-0000-0000-000000000006', 'Énergie solaire', 'energie-solaire', 6);

insert into subcategories (id, category_id, name, slug, sort_order) values
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Smartphones', 'smartphones', 1),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Tablettes', 'tablettes', 2),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 'Ordinateurs portables', 'ordinateurs-portables', 1),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000002', 'Accessoires informatiques', 'accessoires-informatiques', 2),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000003', 'Réfrigérateurs', 'refrigerateurs', 1),
  ('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000006', 'Kits solaires', 'kits-solaires', 1);

-- -------------------------------------------------------------------------
-- MARQUES
-- -------------------------------------------------------------------------
insert into brands (id, name, slug) values
  ('33333333-0000-0000-0000-000000000001', 'Samsung', 'samsung'),
  ('33333333-0000-0000-0000-000000000002', 'Tecno', 'tecno'),
  ('33333333-0000-0000-0000-000000000003', 'HP', 'hp'),
  ('33333333-0000-0000-0000-000000000004', 'Hisense', 'hisense'),
  ('33333333-0000-0000-0000-000000000005', 'BENDO Essentials', 'bendo-essentials');

-- -------------------------------------------------------------------------
-- FOURNISSEUR FICTIF (pour illustrer le flux dropshipping)
-- -------------------------------------------------------------------------
insert into suppliers (id, name, company_name, country, city, phone, whatsapp, currency, average_lead_time_days, status, internal_notes) values
  ('44444444-0000-0000-0000-000000000001', 'Wei Chen', 'Chen Import Export', 'Chine', 'Guangzhou', '+86 130 0000 0000', '+86 130 0000 0000', 'USD', 12, 'ACTIVE', 'Fournisseur test — accessoires téléphonie et informatique.');

-- -------------------------------------------------------------------------
-- PRODUITS
-- -------------------------------------------------------------------------
insert into products (
  id, name, slug, sku, description, brand_id, category_id, subcategory_id,
  price, compare_at_price, cost_price, stock_quantity, low_stock_threshold,
  fulfillment_type, cod_available, store_pickup_available, status
) values
  (
    '55555555-0000-0000-0000-000000000001',
    'Samsung Galaxy A15 128 Go', 'samsung-galaxy-a15-128go', 'TEL-SAM-A15-128',
    'Écran 6,5" 90 Hz, triple caméra 50 MP, batterie 5000 mAh. Garantie 12 mois.',
    '33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
    89900, 99900, 68000, 14, 5, 'BENDO_STOCK', true, true, 'PUBLISHED'
  ),
  (
    '55555555-0000-0000-0000-000000000002',
    'Tecno Spark 20 128 Go', 'tecno-spark-20-128go', 'TEL-TEC-SP20-128',
    'Écran AMOLED 6,6", 8 Go RAM (extensible), charge rapide 33W.',
    '33333333-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
    69900, null, 52000, 22, 5, 'BENDO_STOCK', true, true, 'PUBLISHED'
  ),
  (
    '55555555-0000-0000-0000-000000000003',
    'Tablette Samsung Galaxy Tab A9', 'samsung-galaxy-tab-a9', 'TAB-SAM-A9',
    'Écran 8,7", idéale pour les enfants et l’usage quotidien.',
    '33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002',
    79900, null, 61000, 8, 5, 'BENDO_STOCK', true, false, 'PUBLISHED'
  ),
  (
    '55555555-0000-0000-0000-000000000004',
    'HP 15 Intel Core i5 8 Go / 512 Go SSD', 'hp-15-i5-8go-512go', 'PC-HP-15-I5',
    'Ordinateur portable 15,6" pour le bureau et les études. Windows 11 installé.',
    '33333333-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000003',
    329900, 359900, 265000, 5, 3, 'MIXED', true, true, 'PUBLISHED'
  ),
  (
    '55555555-0000-0000-0000-000000000005',
    'Chargeur rapide USB-C 33W', 'chargeur-rapide-usb-c-33w', 'ACC-CHG-33W',
    'Compatible avec la plupart des smartphones Android récents.',
    '33333333-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000004',
    7900, 9900, 3200, 0, 5, 'DROPSHIPPING', false, false, 'PUBLISHED'
  ),
  (
    '55555555-0000-0000-0000-000000000006',
    'Réfrigérateur Hisense 168L', 'refrigerateur-hisense-168l', 'ELEC-HIS-168L',
    'Simple porte, faible consommation, idéal pour un studio ou petit salon.',
    '33333333-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000005',
    159900, null, 128000, 3, 2, 'BENDO_STOCK', true, true, 'PUBLISHED'
  ),
  (
    '55555555-0000-0000-0000-000000000007',
    'Kit solaire 100W avec batterie', 'kit-solaire-100w-batterie', 'SOLAR-KIT-100W',
    'Panneau 100W, batterie 12V, régulateur et câblage inclus. Idéal zones sans réseau stable.',
    '33333333-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000006',
    89900, null, 71000, 6, 3, 'BENDO_STOCK', true, true, 'PUBLISHED'
  ),
  (
    '55555555-0000-0000-0000-000000000008',
    'Housse smartphone universelle', 'housse-smartphone-universelle', 'ACC-HOUSSE-UNI',
    'Housse silicone antichoc, plusieurs coloris disponibles.',
    '33333333-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000004',
    3500, null, 1200, 40, 10, 'BENDO_STOCK', true, true, 'DRAFT'
  );

-- Lien fournisseur pour le produit en dropshipping (chargeur, stock BENDO = 0)
insert into supplier_products (supplier_id, product_id, supplier_sku, supplier_cost, supplier_stock, shipping_cost, estimated_delivery_days, priority, status) values
  ('44444444-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000005', 'CN-CHG33W', 2100, 150, 800, 14, 1, 'ACTIVE');

-- -------------------------------------------------------------------------
-- IMAGES PRODUITS (placeholders — à remplacer par les vraies photos produit)
-- -------------------------------------------------------------------------
insert into product_images (product_id, url, alt_text, sort_order) values
  ('55555555-0000-0000-0000-000000000001', 'https://placehold.co/800x800/FD8701/FFFFFF?text=Galaxy+A15', 'Samsung Galaxy A15', 0),
  ('55555555-0000-0000-0000-000000000002', 'https://placehold.co/800x800/FD8701/FFFFFF?text=Spark+20', 'Tecno Spark 20', 0),
  ('55555555-0000-0000-0000-000000000003', 'https://placehold.co/800x800/001C4A/FFFFFF?text=Galaxy+Tab+A9', 'Samsung Galaxy Tab A9', 0),
  ('55555555-0000-0000-0000-000000000004', 'https://placehold.co/800x800/001C4A/FFFFFF?text=HP+15', 'HP 15', 0),
  ('55555555-0000-0000-0000-000000000005', 'https://placehold.co/800x800/FB1C32/FFFFFF?text=Chargeur+33W', 'Chargeur rapide 33W', 0),
  ('55555555-0000-0000-0000-000000000006', 'https://placehold.co/800x800/001C4A/FFFFFF?text=Refrigerateur', 'Réfrigérateur Hisense 168L', 0),
  ('55555555-0000-0000-0000-000000000007', 'https://placehold.co/800x800/FD8701/FFFFFF?text=Kit+Solaire', 'Kit solaire 100W', 0),
  ('55555555-0000-0000-0000-000000000008', 'https://placehold.co/800x800/FB1C32/FFFFFF?text=Housse', 'Housse smartphone universelle', 0);

-- -------------------------------------------------------------------------
-- MAGASIN DE DÉMONSTRATION (pour le retrait en magasin)
-- -------------------------------------------------------------------------
insert into stores (id, name, address, city, phone, is_active) values
  ('66666666-0000-0000-0000-000000000001', 'BENDO Bepanda', 'Carrefour Bepanda, Douala', 'Douala', '+237 697 094 600', true);

insert into shipping_zones (city, neighborhood, fee, estimated_days, cod_allowed, is_active) values
  ('Douala', 'Bepanda', 1000, 1, true, true),
  ('Douala', 'Akwa', 1500, 1, true, true),
  ('Douala', 'Bonamoussadi', 1500, 1, true, true),
  ('Douala', 'Autres quartiers', 2000, 2, true, true);
