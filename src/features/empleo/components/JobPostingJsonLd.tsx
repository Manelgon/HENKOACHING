import { SITE_URL } from '@/features/blog/lib/site-config'
import type { OfertaDetalle } from '@/features/empleo/queries'

// Mapea slug de jornada a employmentType de schema.org
function mapEmploymentType(jornadaSlug: string): string[] {
  const map: Record<string, string> = {
    'completa': 'FULL_TIME',
    'parcial': 'PART_TIME',
    'por-horas': 'PART_TIME',
  }
  return [map[jornadaSlug.toLowerCase()] ?? 'OTHER']
}

// Si la ubicación contiene "Mallorca" o ciudad balear, devuelve PostalAddress con ES.
function buildJobLocation(ubicacion: string) {
  if (!ubicacion) return undefined
  const isMallorca = /mallorca|palma|inca|manacor|alcudia/i.test(ubicacion)
  return {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: isMallorca ? 'Palma de Mallorca' : ubicacion,
      addressRegion: isMallorca ? 'Illes Balears' : undefined,
      addressCountry: 'ES',
    },
  }
}

function buildBaseSalary(min: number | null, max: number | null) {
  if (!min && !max) return undefined
  return {
    '@type': 'MonetaryAmount',
    currency: 'EUR',
    value: {
      '@type': 'QuantitativeValue',
      minValue: min ?? max,
      maxValue: max ?? min,
      unitText: 'YEAR',
    },
  }
}

// Construye un texto HTML mínimo a partir de descripcion + funciones + requisitos + competencias + ofrecemos.
// Google for Jobs acepta plain text o HTML simple.
function buildDescription(o: OfertaDetalle): string {
  let html = `<p>${escape(o.descripcion)}</p>`
  if (o.reportaA) {
    html += `<p><strong>Reporta a:</strong> ${escape(o.reportaA)}</p>`
  }
  if (o.contrato) {
    html += `<p><strong>Contrato:</strong> ${escape(o.contrato)}</p>`
  }
  if (o.funciones.length > 0) {
    html += `<p><strong>Funciones principales:</strong></p><ul>${o.funciones.map((r) => `<li>${escape(r)}</li>`).join('')}</ul>`
  }
  if (o.requisitos.length > 0) {
    html += `<p><strong>Requisitos:</strong></p><ul>${o.requisitos.map((r) => `<li>${escape(r)}</li>`).join('')}</ul>`
  }
  if (o.competencias.length > 0) {
    html += `<p><strong>Competencias clave:</strong></p><ul>${o.competencias.map((r) => `<li>${escape(r)}</li>`).join('')}</ul>`
  }
  if (o.ofrecemos.length > 0) {
    html += `<p><strong>Se ofrece:</strong></p><ul>${o.ofrecemos.map((r) => `<li>${escape(r)}</li>`).join('')}</ul>`
  }
  return html
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default function JobPostingJsonLd({ oferta }: { oferta: OfertaDetalle }) {
  const isRemoto = oferta.modalidadSlug === 'remoto'

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: oferta.titulo,
    description: buildDescription(oferta),
    datePosted: oferta.fechaPublicacionISO,
    validThrough: oferta.fechaExpiracionISO,
    employmentType: mapEmploymentType(oferta.jornada),
    hiringOrganization: {
      '@type': 'Organization',
      name: oferta.empresa || 'Henkoaching',
      sameAs: SITE_URL,
    },
    identifier: {
      '@type': 'PropertyValue',
      name: oferta.empresa || 'Henkoaching',
      value: oferta.id,
    },
    url: `${SITE_URL}/empleo/${oferta.slug}`,
    industry: oferta.sector || undefined,
    directApply: false,
  }

  const location = buildJobLocation(oferta.ubicacion)
  if (location) data.jobLocation = location

  if (isRemoto) {
    data.jobLocationType = 'TELECOMMUTE'
    data.applicantLocationRequirements = {
      '@type': 'Country',
      name: 'ES',
    }
  }

  const salary = buildBaseSalary(oferta.salarioMin, oferta.salarioMax)
  if (salary) data.baseSalary = salary

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
