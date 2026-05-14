import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import CandidatoLoginForm from '@/features/empleo/components/CandidatoLoginForm'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Acceso candidatos — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function CandidatoLoginPage() {
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

  return <CandidatoLoginForm />
}
