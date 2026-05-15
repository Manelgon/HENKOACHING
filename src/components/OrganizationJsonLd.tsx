import { SITE_URL } from '@/features/blog/lib/site-config'

export default function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Henkoaching',
    legalName: 'Jennifer Cervera Alzate',
    url: SITE_URL,
    logo: `${SITE_URL}/henkologo.png`,
    description:
      'Coaching y mindfulness empresarial. Consultoría de operaciones, reclutamiento consciente y desarrollo de liderazgo.',
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
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@henkoaching.com',
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
