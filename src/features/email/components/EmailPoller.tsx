'use client'

import { useEffect, useRef } from 'react'
import { listarEmailsBandeja, contarEmailsFallidos } from '@/actions/email'
import { useEmailStore } from '@/features/email/store/emailStore'

type Props = {
  hasImapConfig: boolean
}

export default function EmailPoller({ hasImapConfig }: Props) {
  const { lastSeenUids, setLastSeenUids, setUnreadCount, setFailedCount } = useEmailStore()
  const isFirstLoad = useRef(true)
  const lastSeenRef = useRef(lastSeenUids)

  useEffect(() => {
    lastSeenRef.current = lastSeenUids
  }, [lastSeenUids])

  // Polling de fallos: independiente de IMAP, siempre activo
  useEffect(() => {
    contarEmailsFallidos().then(setFailedCount).catch(() => {})
    const interval = setInterval(() => {
      contarEmailsFallidos().then(setFailedCount).catch(() => {})
    }, 120_000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hasImapConfig) return

    // Pedir permiso notificaciones
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    async function poll() {
      const r = await listarEmailsBandeja()
      if ('error' in r || !r.messages) return

      const messages = r.messages
      const unread = messages.filter((m) => !m.seen)
      setUnreadCount(unread.length)

      if (isFirstLoad.current) {
        // Primera carga: guardar UIDs sin notificar
        setLastSeenUids(new Set(messages.map((m) => m.uid)))
        isFirstLoad.current = false
        return
      }

      // Detectar emails nuevos (UIDs que no habíamos visto)
      const nuevos = messages.filter((m) => !lastSeenRef.current.has(m.uid))
      if (nuevos.length > 0) {
        setLastSeenUids(new Set(messages.map((m) => m.uid)))

        if ('Notification' in window && Notification.permission === 'granted') {
          nuevos.forEach((msg) => {
            new Notification('Nuevo email · Henkoaching', {
              body: `${msg.from}\n${msg.subject}`,
              icon: '/hk.png',
              tag: `email-${msg.uid}`,
            })
          })
        }
      }
    }

    poll()
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') poll()
    }, 120_000)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasImapConfig])

  return null
}
