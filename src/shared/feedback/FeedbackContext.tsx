'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

export type Toast = {
  id: number
  type: 'success' | 'error'
  description: string
}

type LoadingItem = {
  id: number
  description: string
}

export type ConfirmOptions = {
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
}

export type ConfirmRequest = ConfirmOptions & {
  id: number
  resolve: (value: boolean) => void
}

type FeedbackContextValue = {
  loading: LoadingItem[]
  toasts: Toast[]
  confirmRequest: ConfirmRequest | null
  pushToast: (type: Toast['type'], description: string) => void
  dismissToast: (id: number) => void
  confirm: (options: ConfirmOptions) => Promise<boolean>
  resolveConfirm: (id: number, value: boolean) => void
  runAction: <T>(
    description: string,
    fn: () => Promise<T>,
    options?: {
      successMessage?: string | ((result: T) => string)
      errorMessage?: string | ((err: unknown) => string)
      silentSuccess?: boolean
    },
  ) => Promise<{ ok: true; data: T } | { ok: false; error: string }>
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<LoadingItem[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null)
  const idRef = useRef(0)
  const nextId = () => ++idRef.current

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const id = nextId()
      setConfirmRequest({ id, resolve, ...options })
    })
  }, [])

  const resolveConfirm = useCallback((id: number, value: boolean) => {
    setConfirmRequest((current) => {
      if (!current || current.id !== id) return current
      current.resolve(value)
      return null
    })
  }, [])

  const pushToast = useCallback((type: Toast['type'], description: string) => {
    const id = nextId()
    setToasts((prev) => [...prev, { id, type, description }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const runAction = useCallback<FeedbackContextValue['runAction']>(
    async (description, fn, options) => {
      const id = nextId()
      setLoading((prev) => [...prev, { id, description }])

      try {
        const data = await fn()

        if (data && typeof data === 'object' && 'error' in data && (data as { error: unknown }).error) {
          const errMsg = String((data as { error: unknown }).error)
          pushToast('error', errMsg)
          return { ok: false, error: errMsg }
        }

        if (!options?.silentSuccess) {
          const successMsg = typeof options?.successMessage === 'function'
            ? options.successMessage(data)
            : options?.successMessage ?? defaultSuccessFromDescription(description)
          pushToast('success', successMsg)
        }

        return { ok: true, data }
      } catch (err) {
        const errMsg = options?.errorMessage
          ? (typeof options.errorMessage === 'function' ? options.errorMessage(err) : options.errorMessage)
          : err instanceof Error
            ? err.message
            : 'Ha ocurrido un error inesperado'
        pushToast('error', errMsg)
        return { ok: false, error: errMsg }
      } finally {
        setLoading((prev) => prev.filter((l) => l.id !== id))
      }
    },
    [pushToast],
  )

  const value = useMemo<FeedbackContextValue>(
    () => ({ loading, toasts, confirmRequest, pushToast, dismissToast, confirm, resolveConfirm, runAction }),
    [loading, toasts, confirmRequest, pushToast, dismissToast, confirm, resolveConfirm, runAction],
  )

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback debe usarse dentro de <FeedbackProvider>')
  return ctx
}

export function useAction() {
  const { runAction } = useFeedback()
  return runAction
}

export function useToast() {
  const { pushToast } = useFeedback()
  return pushToast
}

export function useConfirm() {
  const { confirm } = useFeedback()
  return confirm
}

function defaultSuccessFromDescription(description: string): string {
  const lower = description.trim()
  if (!lower) return 'Acción completada'
  return `${lower} — completado`
}
