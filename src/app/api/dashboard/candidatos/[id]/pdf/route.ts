import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanySettings, downloadAssetBytes } from '@/lib/company-settings'
import { buildCandidatoPdf, type CandidatoPdfData, type EmisorPdf } from '@/lib/pdf/candidato'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const admin = createAdminClient()

  const [{ data: p }, { data: cp }, { data: experiencias }, { data: educacion }, { data: idiomas }] = await Promise.all([
    admin.from('profiles').select('nombre, apellidos, email, telefono').eq('id', id).maybeSingle(),
    admin.from('candidato_profiles').select('cargo_actual, ubicacion, localidad, resumen, linkedin_url, disponibilidad, pretension_salarial, tipo_jornada, modalidad_trabajo, fecha_nacimiento').eq('user_id', id).maybeSingle(),
    admin.from('candidato_experiencias').select('empresa, cargo, desde, hasta, descripcion').eq('candidato_id', id).order('orden'),
    admin.from('candidato_educacion').select('centro, titulo, ano_fin').eq('candidato_id', id).order('orden'),
    admin.from('candidato_idiomas').select('idioma, nivel').eq('candidato_id', id),
  ])

  if (!p) return NextResponse.json({ error: 'Candidato no encontrado' }, { status: 404 })

  type PRow = { nombre: string | null; apellidos: string | null; email: string; telefono: string | null }
  type CpRow = { cargo_actual: string | null; ubicacion: string | null; localidad: string | null; resumen: string | null; linkedin_url: string | null; disponibilidad: string | null; pretension_salarial: string | null; tipo_jornada: string | null; modalidad_trabajo: string | null; fecha_nacimiento: string | null }
  type ExpRow = { empresa: string; cargo: string; desde: string | null; hasta: string | null; descripcion: string | null }
  type EduRow = { centro: string; titulo: string; ano_fin: string | null }
  type IdiomaRow = { idioma: string; nivel: string }

  const pr = p as unknown as PRow
  const cr = cp as unknown as CpRow | null

  const nombre = [pr.nombre, pr.apellidos].filter(Boolean).join(' ') || pr.email

  const data: CandidatoPdfData = {
    nombre,
    email: pr.email,
    telefono: pr.telefono ?? null,
    ubicacion: [cr?.localidad, cr?.ubicacion].filter(Boolean).join(', ') || null,
    cargo: cr?.cargo_actual ?? null,
    resumen: cr?.resumen ?? null,
    linkedin: cr?.linkedin_url ?? null,
    disponibilidad: cr?.disponibilidad ?? null,
    pretension: cr?.pretension_salarial ?? null,
    tipoJornada: cr?.tipo_jornada ?? null,
    modalidad: cr?.modalidad_trabajo ?? null,
    fechaNacimiento: cr?.fecha_nacimiento ?? null,
    experiencias: ((experiencias ?? []) as unknown as ExpRow[]).map(e => ({
      empresa: e.empresa, cargo: e.cargo, desde: e.desde, hasta: e.hasta, descripcion: e.descripcion,
    })),
    educacion: ((educacion ?? []) as unknown as EduRow[]).map(e => ({
      centro: e.centro, titulo: e.titulo, ano_fin: e.ano_fin,
    })),
    idiomas: ((idiomas ?? []) as unknown as IdiomaRow[]).map(i => ({
      idioma: i.idioma, nivel: i.nivel,
    })),
  }

  const settings = await getCompanySettings()
  const logoBytes = await downloadAssetBytes(settings.logo_path)
  const emisor: EmisorPdf = { nombre: settings.emisor_nombre || 'Henkoaching', web: settings.emisor_web }

  const pdfBytes = await buildCandidatoPdf(data, emisor, { logoBytes })
  const filename = `candidato-${slugify(nombre)}.pdf`

  return new NextResponse(pdfBytes as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
