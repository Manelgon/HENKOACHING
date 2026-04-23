import AdminSolicitudes from '@/features/empleo/components/AdminSolicitudes'

export const metadata = {
  title: 'Solicitudes — Henkoaching',
}

export default function DashboardSolicitudesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <AdminSolicitudes />
    </div>
  )
}
