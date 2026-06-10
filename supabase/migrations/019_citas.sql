-- 019_citas.sql — Historial de citas y tareas vinculadas a recursos del CRM
-- Cada cita/tarea agendada via agendarCita/crearTareaVinculada se persiste aquí.
-- Es la fuente del historial por recurso; Google sigue siendo la fuente de la agenda.
-- Los eventos/tareas creados sin vínculo NO generan fila.

create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  recurso_tipo text not null check (recurso_tipo in ('lead','cliente','candidato','solicitud')),
  recurso_id uuid not null,                -- sin FK: apunta a tablas distintas según tipo
  clase text not null default 'cita' check (clase in ('cita','tarea')),
  tipo text,                               -- 'Sesión de coaching', 'Entrevista', … (null si "Otro")
  titulo text not null,
  contacto_nombre text not null,           -- snapshot
  contacto_email text,                     -- snapshot del email usado en la invitación
  start_at timestamptz not null,
  end_at timestamptz,
  invitado boolean not null default false, -- se envió invitación + Meet
  google_event_id text,                    -- clase 'cita'
  calendar_id text,
  google_task_id text,                     -- clase 'tarea'
  task_list_id text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_citas_recurso on public.citas(recurso_tipo, recurso_id, start_at desc);
create index if not exists idx_citas_start on public.citas(start_at desc);

alter table public.citas enable row level security;

-- Solo admin (Jennifer) lee y escribe; mismo patrón que el resto de tablas del panel
drop policy if exists "Citas: admin todo" on public.citas;
create policy "Citas: admin todo" on public.citas
  for all using (public.is_admin()) with check (public.is_admin());
