import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanySettings, downloadAssetBytes } from '@/lib/company-settings'
import { buildOfertaPdf, type OfertaPdfData, type EmisorOfertaPdf } from '@/lib/pdf/oferta'
import { EMPRESA_CONFIDENCIAL } from '@/features/empleo/queries'
import { slugify } from '@/shared/utils/slug'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  // Sólo administradores pueden descargar PDFs (incluye borradores)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  // Lectura por admin client: el PDF debe generarse aunque la oferta esté en borrador o cerrada.
  const admin = createAdminClient()
  const { data: oferta, error } = await admin
    .from('ofertas')
    .select(`
      id, slug, titulo, ubicacion, salario_texto, fecha_publicacion, estado, empresa_oculta,
      reporta_a, contrato, descripcion, funciones, requisitos, competencias, ofrecemos,
      clientes(nombre),
      sectores(nombre),
      modalidades(nombre),
      jornadas(nombre)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  if (error || !oferta) {
    return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 })
  }

  const empresaReal = (oferta.clientes as unknown as { nombre: string } | null)?.nombre ?? ''
  const oculta = !!oferta.empresa_oculta

  const data: OfertaPdfData = {
    titulo: oferta.titulo,
    empresa: oculta ? EMPRESA_CONFIDENCIAL : empresaReal,
    empresaOculta: oculta,
    ubicacion: oferta.ubicacion ?? '',
    modalidad: (oferta.modalidades as unknown as { nombre: string } | null)?.nombre ?? '',
    jornada: (oferta.jornadas as unknown as { nombre: string } | null)?.nombre ?? '',
    sector: (oferta.sectores as unknown as { nombre: string } | null)?.nombre ?? '',
    salario: oferta.salario_texto ?? '',
    reportaA: oferta.reporta_a ?? '',
    contrato: oferta.contrato ?? '',
    descripcion: oferta.descripcion ?? '',
    funciones: oferta.funciones ?? [],
    requisitos: oferta.requisitos ?? [],
    competencias: oferta.competencias ?? [],
    ofrecemos: oferta.ofrecemos ?? [],
    estado: oferta.estado,
    fechaPublicacion: oferta.fecha_publicacion ?? null,
  }

  const settings = await getCompanySettings()
  const logoBytes = await downloadAssetBytes(settings.logo_path)

  const emisor: EmisorOfertaPdf = {
    nombre: settings.emisor_nombre || 'Henkoaching',
    web: settings.emisor_web,
  }

  const pdfBytes = await buildOfertaPdf(data, emisor, { logoBytes })

  const filename = `oferta-${slugify(oferta.titulo || 'sin-titulo', 60)}.pdf`

  return new NextResponse(pdfBytes as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
