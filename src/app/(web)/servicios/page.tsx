import { Metadata } from 'next'
import ServiciosClient from './ServiciosClient'

export const metadata: Metadata = {
  title: 'Servicios — Henkoaching',
  description: 'Operaciones, reclutamiento consciente y liderazgo. Tres líneas de trabajo para acompañar tu empresa en momentos clave.',
}

export default function ServiciosPage() {
  return <ServiciosClient />
}
