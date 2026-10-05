import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Category, Movie } from '../types'
import MovieCard from './MovieCard'

interface CategoryRowProps {
  category: Category
  movies: Movie[]
  onSelect: (movie: Movie) => void
}

/** Ancho de cada tarjeta en px, usado para calcular el desplazamiento. */
const CARD_WIDTH = 196
/** Margen lateral del area desplazable. */
const GAP = 14

/**
 * CategoryRow - Fila horizontal de peliculas con scroll fluido, flechas
 * doradas en escritorio y soporte swipe en moviles.
 */
export default function CategoryRow({ category, movies, onSelect }: CategoryRowProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  /** Sincroniza la visibilidad de las flechas con la posicion del scroll. */
  const syncArrows = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const maxScroll = track.scrollWidth - track.clientWidth
    setCanScrollLeft(track.scrollLeft > 8)
    setCanScrollRight(track.scrollLeft < maxScroll - 8)
  }, [])

  useEffect(() => {
    syncArrows()
    const track = trackRef.current
    if (!track) return

    track.addEventListener('scroll', syncArrows, { passive: true })
    window.addEventListener('resize', syncArrows)
    return () => {
      track.removeEventListener('scroll', syncArrows)
      window.removeEventListener('resize', syncArrows)
    }
  }, [syncArrows, movies.length])

  /** Desplaza la fila una tarjeta completa hacia el lado indicado. */
  const scrollByCards = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({
      left: direction * (CARD_WIDTH + GAP) * 2,
      behavior: 'smooth',
    })
  }

  if (movies.length === 0) return null

  return (
    <motion.section
      id={category.id}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="group/row relative mb-14 scroll-mt-28"
    >
      {/* Encabezado de la fila */}
      <div className="mb-4 flex items-end justify-between gap-4 px-4 sm:px-8 lg:px-12">
        <div>
          <h2 className="glow-effect flex items-center gap-2.5 font-display text-xl font-bold sm:text-2xl">
            <span aria-hidden="true">{category.icon}</span>
            {category.title}
          </h2>
          <p className="mt-1 text-xs text-parchment/45 sm:text-sm">{category.description}</p>
        </div>

        {/* Flechas doradas (solo escritorio) */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            disabled={!canScrollLeft}
            aria-label={'Ver anterior en ' + category.title}
            className={
              'flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold transition-all duration-300 ' +
              (canScrollLeft
                ? 'bg-gold/10 opacity-100 hover:bg-gold hover:text-night'
                : 'cursor-not-allowed border-parchment/15 text-parchment/20 opacity-40')
            }
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            disabled={!canScrollRight}
            aria-label={'Ver siguiente en ' + category.title}
            className={
              'flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold transition-all duration-300 ' +
              (canScrollRight
                ? 'bg-gold/10 opacity-100 hover:bg-gold hover:text-night'
                : 'cursor-not-allowed border-parchment/15 text-parchment/20 opacity-40')
            }
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Pista de peliculas */}
      <div className="relative">
        {/* Desvanecido lateral izquierdo */}
        <div
          className={
            'pointer-events-none absolute inset-y-0 left-0 z-20 w-10 bg-gradient-to-r from-night to-transparent transition-opacity duration-300 ' +
            (canScrollLeft ? 'opacity-100' : 'opacity-0')
          }
        />
        {/* Desvanecido lateral derecho */}
        <div
          className={
            'pointer-events-none absolute inset-y-0 right-0 z-20 w-10 bg-gradient-to-l from-night to-transparent transition-opacity duration-300 ' +
            (canScrollRight ? 'opacity-100' : 'opacity-0')
          }
        />

        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 sm:px-8 lg:px-12"
          style={{ scrollbarWidth: 'none' }}
        >
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className="w-[150px] shrink-0 snap-start sm:w-[180px] lg:w-[196px]"
            >
              <MovieCard movie={movie} index={index} onSelect={onSelect} />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
