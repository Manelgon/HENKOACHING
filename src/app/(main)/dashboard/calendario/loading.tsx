export default function CalendarioLoading() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-auto"
      role="status"
      aria-live="polite"
    >
      <div className="bg-white rounded-3xl shadow-2xl px-8 py-7 flex items-center gap-4 max-w-sm border border-black/5">
        <span className="relative inline-flex w-7 h-7 shrink-0" aria-hidden>
          <span className="absolute inset-0 rounded-full border-[3px] border-henko-turquoise/15" />
          <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-henko-turquoise animate-spin" />
        </span>
        <p className="font-raleway text-sm text-gray-700 font-medium">Cargando calendario…</p>
      </div>
    </div>
  )
}
