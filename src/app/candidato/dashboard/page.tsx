import { Metadata } from 'next'
import CandidatoDashboard from '@/features/empleo/components/CandidatoDashboard'

export const metadata: Metadata = {
  title: 'Mi área — Henkoaching',
}

export default function CandidatoDashboardPage() {
  return <CandidatoDashboard />
}
