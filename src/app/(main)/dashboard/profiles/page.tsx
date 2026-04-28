import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ProfilesAdmin from '@/features/profiles/components/ProfilesAdmin'

export const metadata = {
  title: 'Profiles — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function ProfilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: actorProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (actorProfile?.role !== 'admin') redirect('/dashboard')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, role, nombre, apellidos, telefono, created_at, updated_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Estado de baneo lo sacamos vía admin auth API
  const admin = createAdminClient()
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const banMap = new Map<string, { banned: boolean; lastSignIn: string | null; emailConfirmed: boolean }>()
  for (const u of authUsers ?? []) {
    const banned = !!u.banned_until && new Date(u.banned_until) > new Date()
    banMap.set(u.id, {
      banned,
      lastSignIn: u.last_sign_in_at ?? null,
      emailConfirmed: !!u.email_confirmed_at,
    })
  }

  const rows = (profiles ?? []).map((p) => {
    const meta = banMap.get(p.id)
    return {
      id: p.id,
      email: p.email,
      role: p.role,
      nombre: p.nombre ?? '',
      apellidos: p.apellidos ?? '',
      telefono: p.telefono ?? '',
      createdAt: p.created_at,
      banned: meta?.banned ?? false,
      lastSignIn: meta?.lastSignIn ?? null,
      emailConfirmed: meta?.emailConfirmed ?? false,
    }
  })

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Profiles</h1>
        <p className="font-raleway text-gray-500 font-light">
          Gestión de usuarios del sistema. Todas las acciones quedan registradas en el log.
        </p>
      </div>

      <ProfilesAdmin profiles={rows} />
    </div>
  )
}
