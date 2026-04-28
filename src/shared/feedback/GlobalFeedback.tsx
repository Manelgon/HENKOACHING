'use client'

import { useFeedback } from './FeedbackContext'

export default function GlobalFeedback() {
  const { loading, toasts, dismissToast } = useFeedback()
  const isLoading = loading.length > 0
  const currentDescription = loading[loading.length - 1]?.description

  return (
    <>
      {/* Loading overlay */}
      {isLoading && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <div className="bg-white rounded-3xl shadow-2xl px-8 py-7 flex items-center gap-4 max-w-sm border border-black/5">
            <Spinner />
            <p className="font-raleway text-sm text-gray-700 font-medium">
              {currentDescription ?? 'Procesando...'}
            </p>
          </div>
        </div>
      )}

      {/* Toast stack */}
      <div className="fixed top-6 right-6 z-[110] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-lg border min-w-[280px] max-w-md backdrop-blur-sm font-raleway text-sm animate-toast-in ${
              t.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
            role={t.type === 'error' ? 'alert' : 'status'}
          >
            <span className="mt-0.5 shrink-0">
              {t.type === 'success' ? (
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                </svg>
              )}
            </span>
            <p className="flex-1 leading-snug font-medium">{t.description}</p>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Cerrar"
              className="text-current/60 hover:text-current transition-colors -mt-0.5 -mr-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

function Spinner() {
  return (
    <span className="relative inline-flex w-7 h-7" aria-hidden>
      <span className="absolute inset-0 rounded-full border-[3px] border-henko-turquoise/15" />
      <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-henko-turquoise animate-spin" />
    </span>
  )
}
