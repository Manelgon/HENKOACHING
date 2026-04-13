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

export const metadata: Metadata = {
  title: 'Henkoaching — Coaching & Mindfulness Empresarial',
  description: 'Orden para tu empresa, tu liderazgo y tu mente. Consultoría de operaciones, reclutamiento consciente y desarrollo de liderazgo con Jennifer Cervera.',
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
