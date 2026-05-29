'use client'

import { useEffect } from 'react'
import { contarCandidatosNuevos } from '@/actions/candidatos-admin'
import { useCandidatosStore } from '@/features/candidatos/store/candidatosStore'

export default function CandidatosPoller({ initialCount }: { initialCount: number }) {
  const setNuevosCount = useCandidatosStore((s) => s.setNuevosCount)

  useEffect(() => {
    setNuevosCount(initialCount)
  }, [initialCount, setNuevosCount])

  useEffect(() => {
    const poll = () => {
      contarCandidatosNuevos().then(setNuevosCount).catch(() => {})
    }
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') poll()
    }, 120_000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
