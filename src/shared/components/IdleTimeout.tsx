'use client'

import { useEffect, useRef, useState } from 'react'
import { signout } from '@/actions/auth'
import { createClient } from '@/lib/supabase/client'

const IDLE_MINUTES = 30
const WARNING_SECONDS = 60
const IDLE_MS = IDLE_MINUTES * 60 * 1000
const WARNING_MS = WARNING_SECONDS * 1000
const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const

export default function IdleTimeout() {
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(WARNING_SECONDS)

  // Momento absoluto (epoch ms) en que la sesión debe cerrarse. Se compara
  // contra Date.now() en cada tick: si el PC estuvo suspendido, al despertar
  // el primer tick detecta que el plazo ya venció y cierra de inmediato.
  const deadline = useRef(0)
  const isWarning = useRef(false)
  const loggingOut = useRef(false)

  const forceLogout = async () => {
    if (loggingOut.current) return
    loggingOut.current = true
    try {
      await signout()
    } catch {
      // Sin red (típico al despertar de una suspensión) la server action
      // falla: cerrar la sesión localmente y forzar la redirección igualmente.
      try {
        await createClient().auth.signOut({ scope: 'local' })
      } catch { /* sin sesión local que limpiar */ }
      window.location.href = '/login'
    }
  }

  const resetDeadline = () => {
    deadline.current = Date.now() + IDLE_MS
  }

  const check = () => {
    const remaining = deadline.current - Date.now()
    if (remaining <= 0) {
      forceLogout()
      return
    }
    if (remaining <= WARNING_MS) {
      isWarning.current = true
      setShowWarning(true)
      setCountdown(Math.ceil(remaining / 1000))
    }
  }

  useEffect(() => {
    resetDeadline()
    const ticker = setInterval(check, 1000)

    const onActivity = () => {
      if (isWarning.current) return
      resetDeadline()
    }
    const onWake = () => check()

    EVENTS.forEach(e => window.addEventListener(e, onActivity, { passive: true }))
    document.addEventListener('visibilitychange', onWake)
    window.addEventListener('focus', onWake)
    return () => {
      clearInterval(ticker)
      EVENTS.forEach(e => window.removeEventListener(e, onActivity))
      document.removeEventListener('visibilitychange', onWake)
      window.removeEventListener('focus', onWake)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStayActive = () => {
    isWarning.current = false
    setShowWarning(false)
    setCountdown(WARNING_SECONDS)
    resetDeadline()
  }

  const handleLogout = () => {
    forceLogout()
  }

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">¿Sigues ahí?</h2>
        <p className="text-gray-500 text-sm mb-1">
          Por seguridad, tu sesión se cerrará en
        </p>
        <p className="text-4xl font-bold text-amber-600 mb-6">{countdown}s</p>
        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cerrar sesión
          </button>
          <button
            onClick={handleStayActive}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Seguir activo
          </button>
        </div>
      </div>
    </div>
  )
}
