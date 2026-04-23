import type { Metadata } from 'next'
import { Raleway } from 'next/font/google'
import './globals.css'
import ScrollAnimationProvider from '@/components/ScrollAnimationProvider'

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-raleway',
  display: 'swap',
})

const siteUrl = 'https://henkoaching.automatizatelo.com'
const siteTitle = 'Henkoaching — Coaching & Mindfulness Empresarial'
const siteDescription = 'Orden para tu empresa, tu liderazgo y tu mente. Consultoría de operaciones, reclutamiento consciente y desarrollo de liderazgo con Jennifer Cervera.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: '/hk.png',
    apple: '/hk.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: siteUrl,
    siteName: 'Henkoaching',
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: '/henkologo.png',
        alt: 'Henkoaching — Coaching & Mindfulness Empresarial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/henkologo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={raleway.variable}>
      <body className="antialiased">
        <ScrollAnimationProvider>
          {children}
        </ScrollAnimationProvider>
      </body>
    </html>
  )
}
