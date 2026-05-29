import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCandidatos } from '@/actions/candidatos-admin'
import CandidatosTable from '@/features/candidatos/components/CandidatosTable'

export const metadata = { title: 'Candidatos — Henkoaching' }
export const dynamic = 'force-dynamic'

export default async function CandidatosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const candidatos = await getCandidatos()

  return (
    <div className="w-full">
      <div className="mb-8 md:mb-10">
        <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-2">Candidatos</h1>
        <p className="font-raleway text-gray-500 font-light">
          Gestiona los candidatos registrados en el portal de empleo.
        </p>
      </div>
      <CandidatosTable candidatos={candidatos} />
    </div>
  )
}
