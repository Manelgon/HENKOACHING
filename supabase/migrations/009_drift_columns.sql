-- Migración 009: Formaliza columnas que existen en BD remota pero no en migraciones previas
-- factura_rectificada_id y motivo_rectificacion fueron usadas en triggers desde 003 sin ADD COLUMN
-- Las columnas SEO de blog_posts se añadieron directamente en Supabase

alter table public.facturas
  add column if not exists factura_rectificada_id uuid references public.facturas(id) on delete restrict,
  add column if not exists motivo_rectificacion text;

alter table public.blog_posts
  add column if not exists og_image_url text,
  add column if not exists keywords text[] default '{}',
  add column if not exists canonical_url text,
  add column if not exists imagen_portada_alt text;