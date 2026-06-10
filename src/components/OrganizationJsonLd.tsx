import { SITE_URL } from '@/features/blog/lib/site-config'

export default function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    // ProfessionalService es un subtipo de LocalBusiness: mejor para un servicio local
    // de coaching/consultoría que el Organization genérico (alimenta respuestas locales de IA/Google).
    '@type': 'ProfessionalService',
    name: 'Henkoaching',
    legalName: 'Jennifer Cervera Alzate',
    url: SITE_URL,
    logo: `${SITE_URL}/henkologo.png`,
    image: `${SITE_URL}/henkologo.png`,
    description:
      'Coaching y mindfulness empresarial. Consultoría de operaciones, reclutamiento consciente y desarrollo de liderazgo.',
    email: 'info@henkoaching.com',
    telephone: '+34633657665',
    priceRange: '€€',
    founder: {
      '@type': 'Person',
      name: 'Jennifer Cervera Alzate',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Calle Pere Quintana 25',
      addressLocality: 'Palma de Mallorca',
      postalCode: '07008',
      addressRegion: 'Illes Balears',
      addressCountry: 'ES',
    },
    // Coordenadas aproximadas de la zona (Palma 07008). Ajustar a la ubicación exacta si se desea.
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 39.5734,
      longitude: 2.6612,
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Illes Balears' },
      { '@type': 'Country', name: 'España' },
    ],
    // Horario orientativo: ajustar al horario real de atención.
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@henkoaching.com',
      telephone: '+34633657665',
      contactType: 'customer service',
      availableLanguage: ['es'],
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
