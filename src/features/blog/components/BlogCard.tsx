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
            compact ? 'rounded-[1.75rem] mb-5 aspect-[16/9]' : 'rounded-[2rem] mb-5 aspect-[16/10]'
          }`}
        >
          {post.imagen_portada ? (
            <Image
              src={post.imagen_portada}
              alt={post.imagen_portada_alt ?? post.titulo}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-henko-greenblue/30 to-henko-turquoise/20" />
          )}
        </div>

        {post.categoria && (
          <div className="flex items-center gap-3 mb-3">
            <span className="block w-6 h-px bg-henko-turquoise" />
            <span className="text-[10px] tracking-[0.22em] uppercase font-raleway font-bold text-henko-turquoise">
              {post.categoria.nombre}
            </span>
            {fecha && (
              <>
                <span className="text-henko-turquoise/30">·</span>
                <span className="text-[11px] text-gray-400 font-raleway">{fecha}</span>
              </>
            )}
          </div>
        )}
        {!post.categoria && fecha && (
          <p className="text-[11px] text-gray-400 font-raleway mb-3">{fecha}</p>
        )}

        <h2
          className={`font-roxborough text-gray-900 group-hover:text-henko-turquoise transition-colors leading-tight ${
            compact ? 'mb-2.5 text-lg md:text-xl' : 'mb-3 text-xl md:text-2xl'
          }`}
        >
          {post.titulo}
        </h2>

        {post.extracto && (
          <p
            className={`font-raleway text-gray-600 leading-relaxed ${
              compact ? 'text-sm line-clamp-2 mb-4' : 'line-clamp-3 mb-4'
            }`}
          >
            {post.extracto}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          {post.tiempo_lectura ? (
            <p className="font-raleway text-xs text-gray-400">{post.tiempo_lectura} min de lectura</p>
          ) : (
            <span />
          )}
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-henko-turquoise opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            Leer →
          </span>
        </div>
      </Link>
    </article>
  )
}
