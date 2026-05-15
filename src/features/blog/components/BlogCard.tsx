import Link from 'next/link'
import Image from 'next/image'

export type BlogCardData = {
  slug: string
  titulo: string
  extracto: string | null
  imagen_portada: string | null
  imagen_portada_alt: string | null
  fecha_publicacion: string | null
  tiempo_lectura: number | null
  categoria: { slug: string; nombre: string } | null
}

export default function BlogCard({ post, compact = false }: { post: BlogCardData; compact?: boolean }) {
  const fecha = post.fecha_publicacion
    ? new Date(post.fecha_publicacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div
          className={`relative w-full overflow-hidden bg-gray-100 ${
            compact ? 'rounded-[1.5rem] mb-4 aspect-[16/9]' : 'rounded-[2rem] mb-5 aspect-[16/10]'
          }`}
        >
          {post.imagen_portada ? (
            <Image
              src={post.imagen_portada}
              alt={post.imagen_portada_alt ?? post.titulo}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-henko-greenblue/30 to-henko-turquoise/20" />
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          {post.categoria && (
            <span className="text-[10px] tracking-[0.2em] uppercase font-raleway font-bold text-henko-turquoise">
              {post.categoria.nombre}
            </span>
          )}
          {post.categoria && fecha && <span className="text-gray-300">·</span>}
          {fecha && <span className="text-xs text-gray-400 font-raleway">{fecha}</span>}
        </div>

        <h2
          className={`font-roxborough text-gray-900 group-hover:text-henko-turquoise transition-colors leading-tight ${
            compact ? 'mb-2 text-lg md:text-xl' : 'mb-3 text-xl md:text-2xl'
          }`}
        >
          {post.titulo}
        </h2>

        {post.extracto && (
          <p
            className={`font-raleway text-gray-600 leading-relaxed ${
              compact ? 'text-sm line-clamp-2 mb-3' : 'line-clamp-3 mb-4'
            }`}
          >
            {post.extracto}
          </p>
        )}

        {post.tiempo_lectura && (
          <p className="font-raleway text-xs text-gray-400">{post.tiempo_lectura} min de lectura</p>
        )}
      </Link>
    </article>
  )
}
