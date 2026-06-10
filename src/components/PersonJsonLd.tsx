import { SITE_URL } from '@/features/blog/lib/site-config'

// Schema Person para Jennifer Cervera: hace legible por máquina la autoría y
// las credenciales de /sobre-mi, y la enlaza con la Organización (worksFor).
export default function PersonJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Jennifer Cervera',
    alternateName: 'Jennifer Cervera Alzate',
    url: `${SITE_URL}/sobre-mi`,
    jobTitle: 'Consultora de operaciones y coach ejecutiva',
    description:
      'Consultora de operaciones, coach ejecutiva e instructora de meditación. Acompaña a empresas en crecimiento o cambio a poner orden en sus operaciones, su liderazgo y sus equipos.',
    worksFor: {
      '@type': 'Organization',
      name: 'Henkoaching',
      url: SITE_URL,
    },
    knowsAbout: [
      'Coaching ejecutivo',
      'Consultoría de operaciones',
      'Reclutamiento consciente',
      'Liderazgo y desarrollo de equipos',
      'Mindfulness empresarial',
      'Transformación organizativa',
    ],
    alumniOf: [
      {
        '@type': 'EducationalOrganization',
        name: 'EAE Business School',
      },
      {
        '@type': 'EducationalOrganization',
        name: 'Universitat de les Illes Balears',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Palma de Mallorca',
      addressRegion: 'Illes Balears',
      addressCountry: 'ES',
    },
    sameAs: [
      'https://www.instagram.com/henkoaching/',
      'https://es.linkedin.com/in/jennifer-cervera-3b66a2136',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
