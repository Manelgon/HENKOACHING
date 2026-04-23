import { Metadata } from 'next'
import CandidatoLoginForm from '@/features/empleo/components/CandidatoLoginForm'

export const metadata: Metadata = {
  title: 'Acceso candidatos — Henkoaching',
}

export default function CandidatoLoginPage() {
  return <CandidatoLoginForm />
}
