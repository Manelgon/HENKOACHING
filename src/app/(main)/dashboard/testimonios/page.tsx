import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TestimoniosManager from '@/features/testimonios/components/TestimoniosManager'

export const metadata = { title: 'Testimonios — Henkoaching' }

export const dynamic = 'force-dynamic'

export default async function TestimoniosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: testimonios } = await supabase
    .from('testimonios')
    .select('*')
    .is('deleted_at', null)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-8 md:mb-10">
        <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-2">Testimonios</h1>
        <p className="font-raleway text-gray-500 font-light">
          Gestiona las reseñas que se muestran en la home. Copia y pega desde Google Reviews, LinkedIn, email, etc.
        </p>
      </div>

      <TestimoniosManager testimonios={testimonios ?? []} />
    </div>
  )
}
