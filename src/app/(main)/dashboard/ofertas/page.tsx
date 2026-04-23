import AdminOfertas from '@/features/empleo/components/AdminOfertas'

export const metadata = {
  title: 'Ofertas de empleo — Henkoaching',
}

export default function DashboardOfertasPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <AdminOfertas />
    </div>
  )
}
