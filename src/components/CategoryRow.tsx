import { memo, useCallback, useEffect, useRef, useState } from 'react'
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
 *
 * OPTIMIZACION: `syncArrows` se agrupa por fotograma con `requestAnimationFrame`.
 * Antes, cada evento `scroll` (que puede dispararse 60 veces por segundo)
 * llamaba a `setState` de forma directa, provocando renders innecesarios.
 * Ademas se usa IntersectionObserver en vez de animaciones de framer-motion por
 * fila, que registraban un observador por seccion.
 */
function CategoryRow({ category, movies, onSelect }: CategoryRowProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [visible, setVisible] = useState(false)

  /** Sincroniza la visibilidad de las flechas, una vez por fotograma. */
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

    let raf = 0
    const onScroll = () => {
      // Se anota el trabajo y se ejecuta una sola vez por fotograma.
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        syncArrows()
      })
    }

    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [syncArrows, movies.length])

  // Revela la fila una sola vez al entrar en pantalla.
  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '80px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  /** Desplaza la fila dos tarjetas hacia el lado indicado. */
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
    <section
      ref={sectionRef}
      id={category.id}
      className="group/row relative mb-14 scroll-mt-28 transition-opacity duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translate3d(0, 28px, 0)',
      }}
    >
{/* Encabezado de la fila */}
      <div className="mb-4 flex items-end justify-between gap-4 px-4 sm:px-8 lg:px-12">
        <div>
          <h2 className="glow-effect flex items-center gap-2.5 font-display text-xl font-bold sm:text-2xl">
            <span aria-hidden="true">{category.icon}</span>
            {category.title}
          </h2>
          <p className="mt-1 text-xs font-medium text-vellum/80 sm:text-sm">
            {category.description}
          </p>
        </div>

        {/* Flechas doradas (solo escritorio) */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            disabled={!canScrollLeft}
            aria-label={'Ver anterior en ' + category.title}
            className={
              'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ' +
              (canScrollLeft
                ? 'border-gold bg-gold/15 text-gold-light hover:bg-gold hover:text-night'
                : 'cursor-not-allowed border-gold/20 text-vellum/30')
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
              'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ' +
              (canScrollRight
                ? 'border-gold bg-gold/15 text-gold-light hover:bg-gold hover:text-night'
                : 'cursor-not-allowed border-gold/20 text-vellum/30')
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
    </section>
  )
}

export default memo(CategoryRow)