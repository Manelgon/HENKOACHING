import type { Metadata } from 'next'
import { Raleway } from 'next/font/google'
import './globals.css'
import ScrollAnimationProvider from '@/components/ScrollAnimationProvider'
import { FeedbackProvider } from '@/shared/feedback/FeedbackContext'
import GlobalFeedback from '@/shared/feedback/GlobalFeedback'
import OrganizationJsonLd from '@/components/OrganizationJsonLd'

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-raleway',
  display: 'swap',
})

const siteUrl = 'https://henkoaching.com'
const siteTitle = 'Henkoaching — Coaching & Mindfulness Empresarial'
const siteDescription = 'Orden para tu empresa, tu liderazgo y tu mente. Consultoría de operaciones, reclutamiento consciente y desarrollo de liderazgo con Jennifer Cervera.'

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: '/hk.png',
    apple: '/hk.png',
  },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: siteUrl,
    siteName: 'Henkoaching',
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={raleway.variable}>
      <head>
        <OrganizationJsonLd />
      </head>
      <body className="antialiased">
        <FeedbackProvider>
          <ScrollAnimationProvider>
            {children}
          </ScrollAnimationProvider>
          <GlobalFeedback />
        </FeedbackProvider>
      </body>
    </html>
  )
}
