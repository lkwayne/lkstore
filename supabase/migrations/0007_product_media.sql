-- =========================================================================
-- SENDUU — Médias produit : photos ET vidéo (jusqu'à 7 par produit)
-- =========================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_media_type') then
    create type product_media_type as enum ('IMAGE', 'VIDEO');
  end if;
end $$;

alter table product_images
  add column if not exists media_type product_media_type not null default 'IMAGE';

-- Chemin dans le bucket de stockage — nul pour les URLs collées manuellement
-- (celles-ci ne peuvent pas être supprimées du stockage, seulement de la base).
alter table product_images
  add column if not exists storage_path text;

-- -------------------------------------------------------------------------
-- Bucket de stockage public pour les médias produit.
-- -------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

drop policy if exists "product_media_public_read" on storage.objects;
create policy "product_media_public_read" on storage.objects
  for select using (bucket_id = 'product-media');

drop policy if exists "product_media_staff_insert" on storage.objects;
create policy "product_media_staff_insert" on storage.objects
  for insert with check (bucket_id = 'product-media' and public.is_staff());

drop policy if exists "product_media_staff_update" on storage.objects;
create policy "product_media_staff_update" on storage.objects
  for update using (bucket_id = 'product-media' and public.is_staff());

drop policy if exists "product_media_staff_delete" on storage.objects;
create policy "product_media_staff_delete" on storage.objects
  for delete using (bucket_id = 'product-media' and public.is_staff());
