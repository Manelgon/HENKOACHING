'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type PerfilInput = {
  nombre: string
  email: string | null
  telefono: string | null
  descripcion: string | null
  logoUrl: string | null
  ubicacion: string | null
  webUrl: string | null
  linkedinUrl: string | null
  nifCif: string | null
}

export async function actualizarPerfilEmpresa(clienteId: string, input: PerfilInput) {
  if (!input.nombre.trim()) return { error: 'El nombre es obligatorio' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Segunda línea de defensa: verificar que owner_user_id coincide
  const { data: cliente } = await supabase
    .from('clientes')
    .select('id')
    .eq('id', clienteId)
    .eq('owner_user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!cliente) return { error: 'No tienes permiso para editar este perfil' }

  const { error } = await supabase
    .from('clientes')
    .update({
      nombre: input.nombre.trim(),
      email: input.email || null,
      telefono: input.telefono || null,
      descripcion: input.descripcion || null,
      logo_url: input.logoUrl || null,
      ubicacion: input.ubicacion || null,
      web_url: input.webUrl || null,
      linkedin_url: input.linkedinUrl || null,
      nif_cif: input.nifCif || null,
    })
    .eq('id', clienteId)
    .eq('owner_user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/empresa/perfil')
  revalidatePath('/empresa/dashboard')
  return { ok: true }
}
