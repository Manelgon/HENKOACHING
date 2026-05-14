import { redirect } from 'next/navigation'
import { crearArticulo } from '@/actions/blog'

export const dynamic = 'force-dynamic'

export default async function NuevoArticuloPage() {
  const result = await crearArticulo({})
  if ('error' in result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-roxborough text-2xl text-gray-900 mb-2">No se pudo crear el artículo</h1>
        <p className="font-raleway text-gray-500 mb-6">{result.error}</p>
        <a
          href="/dashboard/blog"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors"
        >
          Volver al listado
        </a>
      </div>
    )
  }
  redirect(`/dashboard/blog/${result.data!.id}`)
}
