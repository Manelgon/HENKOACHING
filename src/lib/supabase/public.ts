import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Cliente Supabase de SOLO LECTURA para contenido público (blog, ofertas
 * publicadas, etc.). No lee cookies, por lo que NO fuerza render dinámico:
 * permite que las páginas públicas usen ISR (`export const revalidate`).
 *
 * Usa la anon key y respeta RLS — solo accede a filas legibles por anónimos.
 * Para datos por-usuario o autenticados usa `createClient` de `./server`.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}
