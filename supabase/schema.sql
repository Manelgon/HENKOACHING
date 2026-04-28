-- =============================================================================
-- HENKOACHING — SCHEMA MAESTRO
-- =============================================================================
-- Este archivo es la FUENTE DE VERDAD del schema de la base de datos.
-- Cualquier modificación (vía MCP, migración o dashboard) DEBE reflejarse aquí.
-- Ejecutarlo en una BD limpia debe recrear el estado completo del proyecto.
--
-- ORDEN ESTRUCTURAL:
--   1. Extensiones
--   2. Enums
--   3. Funciones helper genéricas (sin dependencias de tablas)
--   4. Tablas catálogo
--   5. Tablas principales (auth + perfiles)
--   6. Tablas candidato (experiencia, educación, idiomas, CVs)
--   7. Tablas empresa + ofertas
--   8. Tablas solicitudes
--   9. Tabla leads
--   10. Tablas blog
--   11. Funciones helper de rol (dependen de profiles)
--   12. Triggers
--   13. RLS policies
--   14. Storage buckets + policies
--   15. Seeds (catálogos + ofertas iniciales)
-- =============================================================================


-- =============================================================================
-- 1. EXTENSIONES
-- =============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- =============================================================================
-- 2. ENUMS
-- =============================================================================
do $$ begin
  create type user_role as enum ('admin', 'recruiter', 'candidato', 'empresa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_solicitud as enum ('nuevo', 'revisando', 'entrevista', 'descartado', 'contratado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_oferta as enum ('borrador', 'publicada', 'pausada', 'cerrada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_post as enum ('borrador', 'publicado', 'archivado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tipo_lead as enum ('contacto_general', 'trabaja_conmigo', 'consulta_servicio');
exception when duplicate_object then null; end $$;

do $$ begin
  create type nivel_idioma as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo');
exception when duplicate_object then null; end $$;


-- =============================================================================
-- 3. FUNCIONES HELPER GENÉRICAS (sin dependencias de tablas)
-- =============================================================================

-- Trigger reutilizable para mantener updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Genera slug a partir de un texto (para blog y ofertas)
-- Uso 'lower' simple en vez de unaccent para no requerir extensión externa
create or replace function public.slugify(text)
returns text
language sql
immutable
as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower($1),
        '[^a-z0-9]+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
$$;

-- Calcula tiempo de lectura aproximado (200 palabras/min)
create or replace function public.calcular_tiempo_lectura(contenido text)
returns integer
language sql
immutable
as $$
  select greatest(1, ceil(array_length(string_to_array(contenido, ' '), 1) / 200.0)::integer);
$$;


-- =============================================================================
-- 4. TABLAS CATÁLOGO
-- =============================================================================

create table if not exists public.sectores (
  id serial primary key,
  slug text unique not null,
  nombre text not null,
  orden integer default 0,
  activo boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.modalidades (
  id serial primary key,
  slug text unique not null,
  nombre text not null,
  orden integer default 0,
  activo boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.jornadas (
  id serial primary key,
  slug text unique not null,
  nombre text not null,
  orden integer default 0,
  activo boolean default true,
  created_at timestamptz default now()
);


-- =============================================================================
-- 5. TABLAS PRINCIPALES (PROFILES)
-- =============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role user_role not null default 'candidato',
  nombre text default '',
  apellidos text default '',
  avatar_url text,
  telefono text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index if not exists idx_profiles_role on public.profiles(role) where deleted_at is null;
create index if not exists idx_profiles_email on public.profiles(email);


-- =============================================================================
-- 6. TABLAS CANDIDATO (perfil extendido + experiencia + educación + idiomas + CVs)
-- =============================================================================

create table if not exists public.candidato_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  ubicacion text,
  cargo_actual text,
  resumen text,
  linkedin_url text,
  web_url text,
  disponibilidad text,
  pretension_salarial text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.candidato_experiencias (
  id uuid primary key default uuid_generate_v4(),
  candidato_id uuid not null references public.candidato_profiles(user_id) on delete cascade,
  empresa text not null,
  cargo text not null,
  desde text,
  hasta text,
  descripcion text,
  orden integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_exp_candidato on public.candidato_experiencias(candidato_id);

create table if not exists public.candidato_educacion (
  id uuid primary key default uuid_generate_v4(),
  candidato_id uuid not null references public.candidato_profiles(user_id) on delete cascade,
  centro text not null,
  titulo text not null,
  ano_fin text,
  orden integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_edu_candidato on public.candidato_educacion(candidato_id);

create table if not exists public.candidato_idiomas (
  id uuid primary key default uuid_generate_v4(),
  candidato_id uuid not null references public.candidato_profiles(user_id) on delete cascade,
  idioma text not null,
  nivel nivel_idioma not null,
  orden integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_idiomas_candidato on public.candidato_idiomas(candidato_id);

create table if not exists public.cvs (
  id uuid primary key default uuid_generate_v4(),
  candidato_id uuid not null references public.candidato_profiles(user_id) on delete cascade,
  nombre_archivo text not null,
  storage_path text not null unique,
  tamano_bytes bigint,
  es_principal boolean default false,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

create index if not exists idx_cvs_candidato on public.cvs(candidato_id) where deleted_at is null;
create unique index if not exists idx_cvs_principal_unico
  on public.cvs(candidato_id) where es_principal = true and deleted_at is null;


-- =============================================================================
-- 7. EMPRESAS + OFERTAS
-- =============================================================================

create table if not exists public.empresas (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  nombre text not null,
  descripcion text,
  logo_url text,
  web_url text,
  ubicacion text,
  -- Si en el futuro las empresas tienen login propio, se llena este campo
  owner_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index if not exists idx_empresas_owner on public.empresas(owner_user_id) where deleted_at is null;

create table if not exists public.ofertas (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  titulo text not null,
  empresa_id uuid not null references public.empresas(id) on delete restrict,
  sector_id integer references public.sectores(id) on delete set null,
  modalidad_id integer references public.modalidades(id) on delete set null,
  jornada_id integer references public.jornadas(id) on delete set null,
  ubicacion text,
  salario_min integer,
  salario_max integer,
  salario_texto text,
  descripcion text not null,
  requisitos text[] default '{}',
  ofrecemos text[] default '{}',
  estado estado_oferta not null default 'borrador',
  fecha_publicacion timestamptz,
  fecha_expiracion timestamptz,
  publicado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index if not exists idx_ofertas_estado on public.ofertas(estado) where deleted_at is null;
create index if not exists idx_ofertas_empresa on public.ofertas(empresa_id);
create index if not exists idx_ofertas_sector on public.ofertas(sector_id);
create index if not exists idx_ofertas_publicacion on public.ofertas(fecha_publicacion desc) where deleted_at is null;

-- Computed: oferta visible públicamente
create or replace view public.ofertas_publicadas as
  select * from public.ofertas
  where deleted_at is null
    and estado = 'publicada'
    and (fecha_expiracion is null or fecha_expiracion > now())
    and (fecha_publicacion is null or fecha_publicacion <= now());


-- =============================================================================
-- 8. SOLICITUDES (+ historial + notas)
-- =============================================================================

create table if not exists public.solicitudes (
  id uuid primary key default uuid_generate_v4(),
  candidato_id uuid not null references public.candidato_profiles(user_id) on delete cascade,
  oferta_id uuid not null references public.ofertas(id) on delete cascade,
  cv_id uuid references public.cvs(id) on delete set null,  -- snapshot del CV usado
  mensaje text,
  estado estado_solicitud not null default 'nuevo',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (candidato_id, oferta_id)
);

create index if not exists idx_solicitudes_oferta on public.solicitudes(oferta_id);
create index if not exists idx_solicitudes_candidato on public.solicitudes(candidato_id);
create index if not exists idx_solicitudes_estado on public.solicitudes(estado);

create table if not exists public.solicitud_eventos (
  id uuid primary key default uuid_generate_v4(),
  solicitud_id uuid not null references public.solicitudes(id) on delete cascade,
  estado_anterior estado_solicitud,
  estado_nuevo estado_solicitud not null,
  cambiado_por uuid references public.profiles(id) on delete set null,
  nota text,
  created_at timestamptz default now()
);

create index if not exists idx_eventos_solicitud on public.solicitud_eventos(solicitud_id, created_at desc);

create table if not exists public.solicitud_notas (
  id uuid primary key default uuid_generate_v4(),
  solicitud_id uuid not null references public.solicitudes(id) on delete cascade,
  autor_id uuid references public.profiles(id) on delete set null,
  contenido text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_notas_solicitud on public.solicitud_notas(solicitud_id, created_at desc);


-- =============================================================================
-- 9. LEADS (formularios de contacto + trabaja conmigo)
-- =============================================================================

create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  tipo tipo_lead not null,
  nombre text not null,
  email text not null,
  telefono text,
  asunto text,
  mensaje text not null,
  servicio_interes text,
  origen text,  -- ej: 'web', 'instagram', 'referido'
  leido boolean default false,
  archivado boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_leads_tipo on public.leads(tipo);
create index if not exists idx_leads_no_leidos on public.leads(created_at desc) where leido = false and archivado = false;


-- =============================================================================
-- 10. BLOG
-- =============================================================================

create table if not exists public.blog_categorias (
  id serial primary key,
  slug text unique not null,
  nombre text not null,
  descripcion text,
  orden integer default 0,
  activo boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  titulo text not null,
  extracto text,
  contenido text not null,  -- markdown
  imagen_portada text,  -- storage path
  imagen_alt text,
  categoria_id integer references public.blog_categorias(id) on delete set null,
  autor_id uuid references public.profiles(id) on delete set null,
  estado estado_post not null default 'borrador',
  fecha_publicacion timestamptz,
  tiempo_lectura integer,  -- minutos, calculado
  meta_titulo text,
  meta_descripcion text,
  vistas integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index if not exists idx_posts_estado on public.blog_posts(estado) where deleted_at is null;
create index if not exists idx_posts_categoria on public.blog_posts(categoria_id);
create index if not exists idx_posts_publicacion on public.blog_posts(fecha_publicacion desc) where deleted_at is null;

create table if not exists public.blog_tags (
  id serial primary key,
  slug text unique not null,
  nombre text not null,
  created_at timestamptz default now()
);

create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id integer not null references public.blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create index if not exists idx_post_tags_tag on public.blog_post_tags(tag_id);

-- View: posts publicados (uso público)
create or replace view public.blog_posts_publicados as
  select * from public.blog_posts
  where deleted_at is null
    and estado = 'publicado'
    and (fecha_publicacion is null or fecha_publicacion <= now());


-- =============================================================================
-- 11. FUNCIONES HELPER DE ROL (dependen de profiles)
-- =============================================================================

-- Crea profile automático al registrarse en auth.users
-- IMPORTANTE: Cambiar 'henkoaching@gmail.com' por el email real de Jennifer
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rol user_role;
begin
  -- Auto-asignar admin a Jennifer
  if new.email = 'henkoaching@gmail.com' then
    rol := 'admin';
  else
    -- Por defecto, todos los signups son candidatos
    rol := coalesce((new.raw_user_meta_data->>'role')::user_role, 'candidato');
  end if;

  insert into public.profiles (id, email, role, nombre, apellidos)
  values (
    new.id,
    new.email,
    rol,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    coalesce(new.raw_user_meta_data->>'apellidos', '')
  );

  -- Si es candidato, crear su candidato_profile vacío
  if rol = 'candidato' then
    insert into public.candidato_profiles (user_id) values (new.id);
  end if;

  return new;
end;
$$;

-- Helpers de rol para RLS limpio
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_recruiter()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'recruiter')
  );
$$;

create or replace function public.is_candidato()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'candidato'
  );
$$;


-- =============================================================================
-- 12. TRIGGERS
-- =============================================================================

-- Trigger: auto-crear profile al registrarse
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: actualizar updated_at en todas las tablas relevantes
do $$
declare
  t text;
  tablas text[] := array[
    'profiles', 'candidato_profiles', 'candidato_experiencias', 'candidato_educacion',
    'empresas', 'ofertas', 'solicitudes', 'solicitud_notas',
    'leads', 'blog_posts'
  ];
begin
  foreach t in array tablas loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.handle_updated_at()',
      t
    );
  end loop;
end $$;

-- Trigger: registrar cambio de estado de solicitud automáticamente
create or replace function public.log_solicitud_estado()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.solicitud_eventos (solicitud_id, estado_anterior, estado_nuevo, cambiado_por)
    values (new.id, null, new.estado, auth.uid());
  elsif (tg_op = 'UPDATE' and old.estado is distinct from new.estado) then
    insert into public.solicitud_eventos (solicitud_id, estado_anterior, estado_nuevo, cambiado_por)
    values (new.id, old.estado, new.estado, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_solicitud_estado on public.solicitudes;
create trigger trg_log_solicitud_estado
  after insert or update of estado on public.solicitudes
  for each row execute function public.log_solicitud_estado();

-- Trigger: calcular tiempo de lectura del post antes de guardar
create or replace function public.set_blog_post_metadata()
returns trigger
language plpgsql
as $$
begin
  new.tiempo_lectura := public.calcular_tiempo_lectura(new.contenido);
  -- Si pasa a publicado y no tiene fecha, asignar ahora
  if new.estado = 'publicado' and new.fecha_publicacion is null then
    new.fecha_publicacion := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_blog_post_metadata on public.blog_posts;
create trigger trg_blog_post_metadata
  before insert or update on public.blog_posts
  for each row execute function public.set_blog_post_metadata();


-- =============================================================================
-- 13. RLS POLICIES
-- =============================================================================

-- Habilitar RLS en todas las tablas
alter table public.profiles enable row level security;
alter table public.candidato_profiles enable row level security;
alter table public.candidato_experiencias enable row level security;
alter table public.candidato_educacion enable row level security;
alter table public.candidato_idiomas enable row level security;
alter table public.cvs enable row level security;
alter table public.empresas enable row level security;
alter table public.ofertas enable row level security;
alter table public.solicitudes enable row level security;
alter table public.solicitud_eventos enable row level security;
alter table public.solicitud_notas enable row level security;
alter table public.leads enable row level security;
alter table public.sectores enable row level security;
alter table public.modalidades enable row level security;
alter table public.jornadas enable row level security;
alter table public.blog_categorias enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_post_tags enable row level security;

-- ----- PROFILES -----
drop policy if exists "Profiles: ver el suyo" on public.profiles;
create policy "Profiles: ver el suyo" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "Profiles: recruiters ven todos" on public.profiles;
create policy "Profiles: recruiters ven todos" on public.profiles
  for select using (public.is_recruiter());

drop policy if exists "Profiles: actualizar el suyo" on public.profiles;
create policy "Profiles: actualizar el suyo" on public.profiles
  for update using (id = auth.uid());

drop policy if exists "Profiles: admin actualiza cualquiera" on public.profiles;
create policy "Profiles: admin actualiza cualquiera" on public.profiles
  for update using (public.is_admin());

-- ----- CANDIDATO_PROFILES -----
drop policy if exists "CandProfile: dueño lee" on public.candidato_profiles;
create policy "CandProfile: dueño lee" on public.candidato_profiles
  for select using (user_id = auth.uid());

drop policy if exists "CandProfile: recruiter lee todos" on public.candidato_profiles;
create policy "CandProfile: recruiter lee todos" on public.candidato_profiles
  for select using (public.is_recruiter());

drop policy if exists "CandProfile: dueño escribe" on public.candidato_profiles;
create policy "CandProfile: dueño escribe" on public.candidato_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----- CANDIDATO_EXPERIENCIAS / EDUCACION / IDIOMAS (mismo patrón) -----
drop policy if exists "Exp: dueño lee/escribe" on public.candidato_experiencias;
create policy "Exp: dueño lee/escribe" on public.candidato_experiencias
  for all using (candidato_id = auth.uid()) with check (candidato_id = auth.uid());

drop policy if exists "Exp: recruiter lee" on public.candidato_experiencias;
create policy "Exp: recruiter lee" on public.candidato_experiencias
  for select using (public.is_recruiter());

drop policy if exists "Edu: dueño lee/escribe" on public.candidato_educacion;
create policy "Edu: dueño lee/escribe" on public.candidato_educacion
  for all using (candidato_id = auth.uid()) with check (candidato_id = auth.uid());

drop policy if exists "Edu: recruiter lee" on public.candidato_educacion;
create policy "Edu: recruiter lee" on public.candidato_educacion
  for select using (public.is_recruiter());

drop policy if exists "Idiomas: dueño lee/escribe" on public.candidato_idiomas;
create policy "Idiomas: dueño lee/escribe" on public.candidato_idiomas
  for all using (candidato_id = auth.uid()) with check (candidato_id = auth.uid());

drop policy if exists "Idiomas: recruiter lee" on public.candidato_idiomas;
create policy "Idiomas: recruiter lee" on public.candidato_idiomas
  for select using (public.is_recruiter());

-- ----- CVS -----
drop policy if exists "CVs: dueño lee/escribe" on public.cvs;
create policy "CVs: dueño lee/escribe" on public.cvs
  for all using (candidato_id = auth.uid()) with check (candidato_id = auth.uid());

drop policy if exists "CVs: recruiter lee" on public.cvs;
create policy "CVs: recruiter lee" on public.cvs
  for select using (public.is_recruiter());

-- ----- EMPRESAS -----
drop policy if exists "Empresas: lectura pública" on public.empresas;
create policy "Empresas: lectura pública" on public.empresas
  for select using (deleted_at is null);

drop policy if exists "Empresas: admin escribe" on public.empresas;
create policy "Empresas: admin escribe" on public.empresas
  for all using (public.is_recruiter()) with check (public.is_recruiter());

-- ----- OFERTAS -----
drop policy if exists "Ofertas: lectura pública si publicada" on public.ofertas;
create policy "Ofertas: lectura pública si publicada" on public.ofertas
  for select using (
    deleted_at is null
    and estado = 'publicada'
    and (fecha_expiracion is null or fecha_expiracion > now())
    and (fecha_publicacion is null or fecha_publicacion <= now())
  );

drop policy if exists "Ofertas: recruiter ve todas" on public.ofertas;
create policy "Ofertas: recruiter ve todas" on public.ofertas
  for select using (public.is_recruiter());

drop policy if exists "Ofertas: recruiter escribe" on public.ofertas;
create policy "Ofertas: recruiter escribe" on public.ofertas
  for all using (public.is_recruiter()) with check (public.is_recruiter());

-- ----- SOLICITUDES -----
drop policy if exists "Solicitudes: candidato ve las suyas" on public.solicitudes;
create policy "Solicitudes: candidato ve las suyas" on public.solicitudes
  for select using (candidato_id = auth.uid());

drop policy if exists "Solicitudes: candidato crea las suyas" on public.solicitudes;
create policy "Solicitudes: candidato crea las suyas" on public.solicitudes
  for insert with check (candidato_id = auth.uid());

drop policy if exists "Solicitudes: recruiter ve todas" on public.solicitudes;
create policy "Solicitudes: recruiter ve todas" on public.solicitudes
  for select using (public.is_recruiter());

drop policy if exists "Solicitudes: recruiter actualiza" on public.solicitudes;
create policy "Solicitudes: recruiter actualiza" on public.solicitudes
  for update using (public.is_recruiter());

-- ----- SOLICITUD_EVENTOS -----
drop policy if exists "Eventos: candidato ve los suyos" on public.solicitud_eventos;
create policy "Eventos: candidato ve los suyos" on public.solicitud_eventos
  for select using (
    exists (select 1 from public.solicitudes s
            where s.id = solicitud_id and s.candidato_id = auth.uid())
  );

drop policy if exists "Eventos: recruiter ve todos" on public.solicitud_eventos;
create policy "Eventos: recruiter ve todos" on public.solicitud_eventos
  for select using (public.is_recruiter());

-- ----- SOLICITUD_NOTAS (privadas, solo recruiters) -----
drop policy if exists "Notas: recruiter all" on public.solicitud_notas;
create policy "Notas: recruiter all" on public.solicitud_notas
  for all using (public.is_recruiter()) with check (public.is_recruiter());

-- ----- LEADS -----
drop policy if exists "Leads: insert público" on public.leads;
create policy "Leads: insert público" on public.leads
  for insert with check (true);

drop policy if exists "Leads: recruiter all" on public.leads;
create policy "Leads: recruiter all" on public.leads
  for all using (public.is_recruiter()) with check (public.is_recruiter());

-- ----- CATÁLOGOS (lectura pública, escritura admin) -----
drop policy if exists "Sectores: lectura pública" on public.sectores;
create policy "Sectores: lectura pública" on public.sectores for select using (true);

drop policy if exists "Sectores: admin escribe" on public.sectores;
create policy "Sectores: admin escribe" on public.sectores
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Modalidades: lectura pública" on public.modalidades;
create policy "Modalidades: lectura pública" on public.modalidades for select using (true);

drop policy if exists "Modalidades: admin escribe" on public.modalidades;
create policy "Modalidades: admin escribe" on public.modalidades
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Jornadas: lectura pública" on public.jornadas;
create policy "Jornadas: lectura pública" on public.jornadas for select using (true);

drop policy if exists "Jornadas: admin escribe" on public.jornadas;
create policy "Jornadas: admin escribe" on public.jornadas
  for all using (public.is_admin()) with check (public.is_admin());

-- ----- BLOG -----
drop policy if exists "Categorías: lectura pública" on public.blog_categorias;
create policy "Categorías: lectura pública" on public.blog_categorias for select using (true);

drop policy if exists "Categorías: admin escribe" on public.blog_categorias;
create policy "Categorías: admin escribe" on public.blog_categorias
  for all using (public.is_recruiter()) with check (public.is_recruiter());

drop policy if exists "Posts: lectura pública si publicado" on public.blog_posts;
create policy "Posts: lectura pública si publicado" on public.blog_posts
  for select using (
    deleted_at is null
    and estado = 'publicado'
    and (fecha_publicacion is null or fecha_publicacion <= now())
  );

drop policy if exists "Posts: autor ve los suyos (drafts)" on public.blog_posts;
create policy "Posts: autor ve los suyos (drafts)" on public.blog_posts
  for select using (autor_id = auth.uid());

drop policy if exists "Posts: recruiter ve todos" on public.blog_posts;
create policy "Posts: recruiter ve todos" on public.blog_posts
  for select using (public.is_recruiter());

drop policy if exists "Posts: recruiter escribe" on public.blog_posts;
create policy "Posts: recruiter escribe" on public.blog_posts
  for all using (public.is_recruiter()) with check (public.is_recruiter());

drop policy if exists "Tags: lectura pública" on public.blog_tags;
create policy "Tags: lectura pública" on public.blog_tags for select using (true);

drop policy if exists "Tags: recruiter escribe" on public.blog_tags;
create policy "Tags: recruiter escribe" on public.blog_tags
  for all using (public.is_recruiter()) with check (public.is_recruiter());

drop policy if exists "PostTags: lectura pública" on public.blog_post_tags;
create policy "PostTags: lectura pública" on public.blog_post_tags for select using (true);

drop policy if exists "PostTags: recruiter escribe" on public.blog_post_tags;
create policy "PostTags: recruiter escribe" on public.blog_post_tags
  for all using (public.is_recruiter()) with check (public.is_recruiter());


-- =============================================================================
-- 14. STORAGE BUCKETS + POLICIES
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cvs', 'cvs', false, 5242880, array['application/pdf']::text[]),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('ofertas', 'ofertas', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('blog', 'blog', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']::text[])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ----- CVs (privado: dueño + recruiters) -----
drop policy if exists "CVs storage: dueño sube" on storage.objects;
create policy "CVs storage: dueño sube" on storage.objects
  for insert with check (
    bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "CVs storage: dueño lee" on storage.objects;
create policy "CVs storage: dueño lee" on storage.objects
  for select using (
    bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "CVs storage: recruiter lee" on storage.objects;
create policy "CVs storage: recruiter lee" on storage.objects
  for select using (bucket_id = 'cvs' and public.is_recruiter());

drop policy if exists "CVs storage: dueño borra" on storage.objects;
create policy "CVs storage: dueño borra" on storage.objects
  for delete using (
    bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----- Avatars (público lectura, dueño escribe) -----
drop policy if exists "Avatars: lectura pública" on storage.objects;
create policy "Avatars: lectura pública" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "Avatars: dueño escribe" on storage.objects;
create policy "Avatars: dueño escribe" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Avatars: dueño actualiza" on storage.objects;
create policy "Avatars: dueño actualiza" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Avatars: dueño borra" on storage.objects;
create policy "Avatars: dueño borra" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----- Ofertas (público lectura, recruiters escriben) -----
drop policy if exists "Ofertas storage: lectura pública" on storage.objects;
create policy "Ofertas storage: lectura pública" on storage.objects
  for select using (bucket_id = 'ofertas');

drop policy if exists "Ofertas storage: recruiter escribe" on storage.objects;
create policy "Ofertas storage: recruiter escribe" on storage.objects
  for all using (bucket_id = 'ofertas' and public.is_recruiter())
  with check (bucket_id = 'ofertas' and public.is_recruiter());

-- ----- Blog (público lectura, recruiters escriben) -----
drop policy if exists "Blog storage: lectura pública" on storage.objects;
create policy "Blog storage: lectura pública" on storage.objects
  for select using (bucket_id = 'blog');

drop policy if exists "Blog storage: recruiter escribe" on storage.objects;
create policy "Blog storage: recruiter escribe" on storage.objects
  for all using (bucket_id = 'blog' and public.is_recruiter())
  with check (bucket_id = 'blog' and public.is_recruiter());


-- =============================================================================
-- 15. SEEDS
-- =============================================================================

-- ----- Sectores -----
insert into public.sectores (slug, nombre, orden) values
  ('operaciones', 'Operaciones', 1),
  ('recursos-humanos', 'Recursos Humanos', 2),
  ('comercial', 'Comercial', 3),
  ('tecnologia', 'Tecnología', 4),
  ('finanzas', 'Finanzas', 5),
  ('marketing', 'Marketing', 6),
  ('hosteleria', 'Hostelería', 7),
  ('inmobiliario', 'Inmobiliario', 8)
on conflict (slug) do nothing;

-- ----- Modalidades -----
insert into public.modalidades (slug, nombre, orden) values
  ('presencial', 'Presencial', 1),
  ('hibrido', 'Híbrido', 2),
  ('remoto', 'Remoto', 3)
on conflict (slug) do nothing;

-- ----- Jornadas -----
insert into public.jornadas (slug, nombre, orden) values
  ('completa', 'Completa', 1),
  ('parcial', 'Parcial', 2),
  ('por-horas', 'Por horas', 3)
on conflict (slug) do nothing;

-- ----- Empresas mock -----
insert into public.empresas (slug, nombre, ubicacion) values
  ('grupo-mediterraneo', 'Grupo Mediterráneo', 'Palma, Mallorca'),
  ('techmallorca', 'TechMallorca SL', 'Palma, Mallorca'),
  ('inmobiliaria-ruiz', 'Inmobiliaria Ruiz', 'Mallorca'),
  ('restaurantes-ona', 'Restaurantes Ona', 'Mallorca'),
  ('ferrer-e-hijos', 'Ferrer e Hijos', 'Inca, Mallorca')
on conflict (slug) do nothing;

-- ----- Categorías de blog (ejemplo) -----
insert into public.blog_categorias (slug, nombre, descripcion, orden) values
  ('liderazgo', 'Liderazgo', 'Reflexiones sobre liderazgo y gestión de equipos', 1),
  ('coaching', 'Coaching', 'Procesos de coaching empresarial', 2),
  ('rrhh', 'Recursos Humanos', 'Tendencias y buenas prácticas en RRHH', 3),
  ('cultura', 'Cultura organizacional', 'Construcción de culturas sólidas', 4)
on conflict (slug) do nothing;

-- =============================================================================
-- FIN DEL SCHEMA
-- =============================================================================
