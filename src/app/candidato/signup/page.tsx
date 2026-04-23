import { Metadata } from 'next'
import CandidatoSignupFlow from '@/features/empleo/components/CandidatoSignupFlow'

export const metadata: Metadata = {
  title: 'Crear perfil de candidato — Henkoaching',
}

export default function CandidatoSignupPage() {
  return <CandidatoSignupFlow />
}
