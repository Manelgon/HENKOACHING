'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { signout } from '@/actions/auth'

const IDLE_MINUTES = 30
const WARNING_SECONDS = 60

const IDLE_MS = IDLE_MINUTES * 60 * 1000
const WARNING_MS = WARNING_SECONDS * 1000

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const

export default function IdleTimeout() {
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(WARNING_SECONDS)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearAllTimers = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    if (warnTimer.current) clearTimeout(warnTimer.current)
    if (countdownInterval.current) clearInterval(countdownInterval.current)
  }

  const handleLogout = useCallback(async () => {
    clearAllTimers()
    await signout()
  }, [])

  const startCountdown = useCallback(() => {
    setShowWarning(true)
    setCountdown(WARNING_SECONDS)
    countdownInterval.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    warnTimer.current = setTimeout(() => {
      handleLogout()
    }, WARNING_MS)
  }, [handleLogout])

  const resetTimer = useCallback(() => {
    if (showWarning) return
    clearAllTimers()
    idleTimer.current = setTimeout(startCountdown, IDLE_MS - WARNING_MS)
  }, [showWarning, startCountdown])

  const handleStayActive = () => {
    clearAllTimers()
    setShowWarning(false)
    setCountdown(WARNING_SECONDS)
    idleTimer.current = setTimeout(startCountdown, IDLE_MS - WARNING_MS)
  }

  useEffect(() => {
    idleTimer.current = setTimeout(startCountdown, IDLE_MS - WARNING_MS)

    EVENTS.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))

    return () => {
      clearAllTimers()
      EVENTS.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [resetTimer, startCountdown])

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
