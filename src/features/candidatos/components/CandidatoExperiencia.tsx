import type { Experiencia, CandidatoPerfil } from '../types'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
      <h3 className="font-roxborough text-lg text-gray-900 mb-5">{title}</h3>
      {children}
    </section>
  )
}

export function CandidatoExperiencia({ experiencias }: { experiencias: Experiencia[] }) {
  return (
    <Section title="Experiencia laboral">
      {experiencias.length === 0 ? (
        <p className="font-raleway text-sm text-gray-400 italic">Sin experiencia registrada.</p>
      ) : (
        <div className="space-y-5">
          {experiencias.map((e, i) => (
            <div key={e.id} className={`flex gap-4 ${i < experiencias.length - 1 ? 'pb-5 border-b border-gray-100' : ''}`}>
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-raleway font-semibold text-gray-900 text-sm">{e.cargo}</p>
                <p className="font-raleway text-sm text-henko-turquoise">{e.empresa}</p>
                {(e.desde || e.hasta) && (
                  <p className="font-raleway text-xs text-gray-400 mt-0.5">
                    {e.desde ?? '?'} — {e.hasta ?? 'Actualidad'}
                  </p>
                )}
                {e.descripcion && (
                  <p className="font-raleway text-sm text-gray-600 mt-2 leading-relaxed">{e.descripcion}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

export function CandidatoEducacion({ educacion }: { educacion: import('../types').Educacion[] }) {
  return (
    <Section title="Educación">
      {educacion.length === 0 ? (
        <p className="font-raleway text-sm text-gray-400 italic">Sin formación registrada.</p>
      ) : (
        <div className="space-y-4">
          {educacion.map((e) => (
            <div key={e.id} className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div>
                <p className="font-raleway font-semibold text-gray-900 text-sm">{e.titulo}</p>
                <p className="font-raleway text-sm text-gray-600">{e.centro}</p>
                {e.ano_fin && <p className="font-raleway text-xs text-gray-400 mt-0.5">{e.ano_fin}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

export function CandidatoIdiomas({ idiomas }: { idiomas: import('../types').Idioma[] }) {
  return (
    <Section title="Idiomas">
      {idiomas.length === 0 ? (
        <p className="font-raleway text-sm text-gray-400 italic">Sin idiomas registrados.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {idiomas.map((i) => (
            <span key={i.id} className="font-raleway text-sm px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700">
              {i.idioma} <span className="text-gray-400">·</span> <span className="text-henko-turquoise font-medium">{i.nivel}</span>
            </span>
          ))}
        </div>
      )}
    </Section>
  )
}

export function CandidatoPreferencias({ perfil }: { perfil: Pick<CandidatoPerfil, 'tipo_jornada' | 'modalidad_trabajo' | 'tipo_contrato' | 'sectores_interes' | 'disponibilidad' | 'pretension_salarial'> }) {
  const filas = [
    { label: 'Jornada', value: perfil.tipo_jornada },
    { label: 'Modalidad', value: perfil.modalidad_trabajo },
    { label: 'Contrato', value: perfil.tipo_contrato },
    { label: 'Disponibilidad', value: perfil.disponibilidad },
    { label: 'Pretensión salarial', value: perfil.pretension_salarial },
  ].filter((f) => f.value)

  const sinDatos = filas.length === 0 && (!perfil.sectores_interes || perfil.sectores_interes.length === 0)

  return (
    <Section title="Preferencias laborales">
      {sinDatos ? (
        <p className="font-raleway text-sm text-gray-400 italic">Sin preferencias registradas.</p>
      ) : (
        <div className="space-y-3">
          {filas.length > 0 && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {filas.map((f) => (
                <div key={f.label}>
                  <p className="font-raleway text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{f.label}</p>
                  <p className="font-raleway text-sm text-gray-800">{f.value}</p>
                </div>
              ))}
            </div>
          )}
          {perfil.sectores_interes && perfil.sectores_interes.length > 0 && (
            <div>
              <p className="font-raleway text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Sectores de interés</p>
              <div className="flex flex-wrap gap-1.5">
                {perfil.sectores_interes.map((s) => (
                  <span key={s} className="font-raleway text-xs px-2.5 py-1 rounded-full bg-henko-turquoise/10 text-henko-turquoise font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  )
}
