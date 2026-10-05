import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { LoadState, MediaItem } from '../types/tmdb'
import MovieCard from './MovieCard'

interface CategoryRowProps {
  title: string
  icon: string
  description: string
  items: MediaItem[]
  state: LoadState
  /** Identificador de la fila, para el anclaje del menu. */
  id: string
  onSelect: (item: MediaItem) => void
  savedIds: Set<string>
  onToggleSave: (item: MediaItem) => void
}

/**
 * Ancho de cada tarjeta en px, sincronizado con MovieCard V4.0 (240px).
 * El gap lateral es 16px.
 */
const CARD_WIDTH = 240
const GAP = 16

/**
 * CategoryRow V4.0 — Carrusel horizontal con tarjetas grandes (240×360px).
 *
 * OPTIMIZACION: `syncArrows` se agrupa por fotograma con `requestAnimationFrame`.
 * IntersectionObserver controla la entrada lazy de la seccion completa.
 */
function CategoryRow({
  title,
  icon,
  description,
  items,
  state,
  id,
  onSelect,
  savedIds,
  onToggleSave,
}: CategoryRowProps) {
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
  }, [syncArrows, items.length])

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

  return (
    <section
      ref={sectionRef}
      id={id}
      className="group/row relative mb-16 scroll-mt-28 transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? undefined : 'translate3d(0, 32px, 0)',
      }}
    >
      {/* Encabezado de la fila */}
      <div className="mb-5 flex items-end justify-between gap-4 px-4 sm:px-8 lg:px-12">
        <div>
          <h2 className="glow-effect flex items-center gap-3 font-display text-xl font-bold sm:text-2xl lg:text-3xl">
            <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]" aria-hidden="true">
              {icon}
            </span>
            {title}
          </h2>
          <p className="mt-1.5 text-xs font-medium text-vellum/75 sm:text-sm">
            {description}
          </p>
        </div>

        {/* Flechas doradas (solo escritorio) */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            disabled={!canScrollLeft}
            aria-label={'Ver anterior en ' + title}
            className={
              'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ' +
              (canScrollLeft
                ? 'border-gold bg-gold/15 text-gold-light shadow-[0_0_16px_rgba(255,215,0,0.3)] hover:bg-gold hover:text-night'
                : 'cursor-not-allowed border-gold/20 text-vellum/25')
            }
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            disabled={!canScrollRight}
            aria-label={'Ver siguiente en ' + title}
            className={
              'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ' +
              (canScrollRight
                ? 'border-gold bg-gold/15 text-gold-light shadow-[0_0_16px_rgba(255,215,0,0.3)] hover:bg-gold hover:text-night'
                : 'cursor-not-allowed border-gold/20 text-vellum/25')
            }
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Pista de peliculas */}
      <div className="relative">
        {/* Velos laterales de fundido */}
        <div
          className={
            'pointer-events-none absolute inset-y-0 left-0 z-20 w-14 bg-gradient-to-r from-night to-transparent transition-opacity duration-300 ' +
            (canScrollLeft ? 'opacity-100' : 'opacity-0')
          }
        />
        <div
          className={
            'pointer-events-none absolute inset-y-0 right-0 z-20 w-14 bg-gradient-to-l from-night to-transparent transition-opacity duration-300 ' +
            (canScrollRight ? 'opacity-100' : 'opacity-0')
          }
        />

        {/* Estado de carga: pulsos que conservan el alto de la fila. */}
        {state === 'loading' && items.length === 0 && (
          <div className="flex gap-4 overflow-hidden px-4 sm:px-8 lg:px-12">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-[360px] w-[240px] shrink-0 animate-pulse rounded-xl border border-gold/20 bg-ink"
              />
            ))}
          </div>
        )}

        {/* Estado vacio explicito. */}
        {state === 'ready' && items.length === 0 && (
          <p className="px-4 py-6 text-sm font-medium text-vellum/70 sm:px-8 lg:px-12">
            No hay hechizos de este tipo en {title} todavia.
          </p>
        )}

        {/* Carrusel horizontal de tarjetas grandes */}
        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-8 lg:px-12"
          style={{ scrollbarWidth: 'none' }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className="shrink-0 snap-start"
              style={{ width: CARD_WIDTH + 'px' }}
            >
              <MovieCard
                item={item}
                index={index}
                onSelect={onSelect}
                saved={savedIds.has(item.id)}
                onToggleSave={onToggleSave}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default memo(CategoryRow)
