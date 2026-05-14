import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import CandidatoSignupFlow from '@/features/empleo/components/CandidatoSignupFlow'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Crear perfil de candidato — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function CandidatoSignupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    redirect(profile?.role === 'candidato' ? '/candidato/dashboard' : '/dashboard')
  }

  return <CandidatoSignupFlow />
}
