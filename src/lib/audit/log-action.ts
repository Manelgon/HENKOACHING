import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type LogActionInput = {
  accion: string
  recursoTipo: string
  recursoId?: string | null
  recursoLabel?: string | null
  metadata?: Record<string, unknown>
  actorId?: string | null
  actorEmail?: string | null
}

export async function logAction(input: LogActionInput): Promise<void> {
  let actorId = input.actorId ?? null
  let actorEmail = input.actorEmail ?? null

  if (!actorId || !actorEmail) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      actorId = actorId ?? user?.id ?? null
      actorEmail = actorEmail ?? user?.email ?? null
    } catch {
      // Acción anónima (formularios públicos): se permite actor null
    }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('audit_logs').insert({
    actor_id: actorId,
    actor_email: actorEmail,
    accion: input.accion,
    recurso_tipo: input.recursoTipo,
    recurso_id: input.recursoId ?? null,
    recurso_label: input.recursoLabel ?? null,
    metadata: (input.metadata ?? {}) as never,
  })

  if (error) {
    console.error('[audit] No se pudo escribir el log:', error.message, input)
  }
}
