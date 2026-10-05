import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { LoadState, MediaItem } from '../types/tmdb'
import { HOUSES } from '../services/tmdb'
import CromoSkeleton from './CromoSkeleton'
import MovieCard from './MovieCard'

interface CategoryRowProps {
  title: string
  icon: string
  description: string
  items: MediaItem[]
  state: LoadState
  /** Id de la fila, para el anclaje del menu. */
  id: string
  onSelect: (item: MediaItem, origin?: DOMRect) => void
  /**
   * Posicion de la fila (0-3). Desfasa su revelado tras un cambio de
   * pestana para que las filas aparezcan en cascada (stagger) y no todas
   * a la vez. No genera re-renders: es un `transition-delay` en CSS.
   */
  revealIndex?: number
  savedIds: Set<string>
  onToggleSave: (item: MediaItem) => void
  /**
   * Autoplay opcional/progresivo: desplaza la pista ~1 carta cada
   * `autoplayIntervalMs`, en pausa con hover/foco/tacto y con movimiento
   * reducido. Por defecto desactivado (modo exhibición bajo demanda).
   */
  autoplay?: boolean
  autoplayIntervalMs?: number
}

/**
 * Ancho de cada tarjeta en px, sincronizado con MovieCard V4.0 (240px).
 * El gap lateral es 16px.
 */
const CARD_WIDTH = 240
const GAP = 16

/**
 * CategoryRow V4.4 — Carrusel horizontal masivo (240×360px) con Autoplay.
 *
 * Sin limites duros: pinta todas las `items` que lleguen (TVMaze/TMDB/local).
 * OPTIMIZACION: `syncArrows` se agrupa por fotograma con `requestAnimationFrame`.
 * IntersectionObserver controla la entrada lazy de la seccion completa.
 * AUTOPLAY: `setInterval` progresivo (~1 carta) con pausa en hover/foco/tacto,
 * off con `prefers-reduced-motion` y respeto a interacción manual del usuario.
 */
function CategoryRow({
  title,
  icon,
  description,
  items,
  state,
  id,
  onSelect,
  revealIndex = 0,
  savedIds,
  onToggleSave,
  autoplay = false,
  autoplayIntervalMs = 3200,
}: CategoryRowProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  /** Contenedor de la pista: sobre el se mide y pinta el spotlight. */
  const areaRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [visible, setVisible] = useState(false)
  /** Pausa del autoplay por interacción (hover/foco/tacto/manual). */
  const [autoplayPaused, setAutoplayPaused] = useState(false)
  const resumeTimer = useRef(0)

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

  /**
   * SPOTLIGHT RADIAL — el halo sigue al puntero escribiendo `--pointer-x` y
   * `--pointer-y` sobre el contenedor de la pista.
   *
   * REQUISITO DE RENDIMIENTO: nunca se llama a `setState`, asi que la fila
   * ni se re-renderiza ni se vuelve a pintar por React. Como mucho hay UNA
   * escritura de variables CSS por fotograma (batching con `requestAnimationFrame`)
   * y el navegador solo repinta el gradiente de la capa afectada.
   */
  useEffect(() => {
    const area = areaRef.current
    if (!area) return
    // Sin puntero fisico o con movimiento reducido no se instala nada.
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let nextX = 0
    let nextY = 0

    const apply = () => {
      frame = 0
      area.style.setProperty('--pointer-x', nextX + 'px')
      area.style.setProperty('--pointer-y', nextY + 'px')
    }

    const onMove = (event: PointerEvent) => {
      const rect = area.getBoundingClientRect()
      nextX = event.clientX - rect.left
      nextY = event.clientY - rect.top
      // Una escritura por fotograma como maximo.
      if (!frame) frame = window.requestAnimationFrame(apply)
    }

    area.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      area.removeEventListener('pointermove', onMove)
    }
  }, [])

  /** Desplaza la fila dos tarjetas hacia el lado indicado. */
  const scrollByCards = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    pauseAutoplay()
    track.scrollBy({
      left: direction * (CARD_WIDTH + GAP) * 2,
      behavior: 'smooth',
    })
  }

  /**
   * AUTOPLAY PROGRESIVO — avanza ~1 carta por intervalo con rebote en los
   * extremos (ida y vuelta, sin saltos). Se pausa con hover/foco/tacto,
   * con interacción manual y con `prefers-reduced-motion`. Sin re-renders:
   * solo `scrollBy/scrollTo` nativo (composición GPU del scroll).
   */
  const pauseAutoplay = useCallback(() => {
    setAutoplayPaused(true)
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current)
    resumeTimer.current = window.setTimeout(() => setAutoplayPaused(false), 6000)
  }, [])

  useEffect(() => {
    if (!autoplay || autoplayPaused || !visible || items.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const track = trackRef.current
    if (!track) return
    let direction: 1 | -1 = 1
    const timer = window.setInterval(() => {
      const maxScroll = track.scrollWidth - track.clientWidth
      if (maxScroll <= 8) return
      if (track.scrollLeft >= maxScroll - 8) direction = -1
      else if (track.scrollLeft <= 8) direction = 1
      track.scrollBy({ left: direction * (CARD_WIDTH + GAP), behavior: 'smooth' })
    }, Math.max(autoplayIntervalMs, 1200))
    return () => window.clearInterval(timer)
  }, [autoplay, autoplayIntervalMs, autoplayPaused, visible, items.length])

  useEffect(
    () => () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current)
    },
    [],
  )

  return (
    <section
      ref={sectionRef}
      id={id}
      className="group/row category-row relative mb-16 scroll-mt-28 transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? undefined : 'translate3d(0, 32px, 0)',
        /* Cascada entre filas tras un cambio de pestana (CSS puro). */
        transitionDelay: visible ? Math.min(revealIndex * 90, 300) + 'ms' : undefined,
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
          {/* Píldoras de géneros globales de la casa (solo lectura, GPU) */}
          <div className="mt-2.5 flex flex-wrap gap-1.5" aria-label={'Géneros de ' + title}>
            {(HOUSES.find((house) => house.id === id)?.genreLabels ?? []).slice(0, 5).map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-gold/30 bg-night/70 px-2.5 py-0.5 font-display text-[0.58rem] font-bold uppercase tracking-[0.14em] text-gold-light/90"
              >
                {genre}
              </span>
            ))}
          </div>
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
      <div ref={areaRef} className="relative">
        {/* Halo magico que sigue al puntero (solo escritorio, GPU) */}
        <span className="row-spotlight" aria-hidden="true" />

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

        {/* Estado de carga: cromos de Hogwarts que conservan el alto de la fila. */}
        {state === 'loading' && items.length === 0 && (
          <div className="flex gap-4 overflow-hidden px-4 sm:px-8 lg:px-12">
            {Array.from({ length: 6 }, (_, index) => (
              <CromoSkeleton key={index} index={index} className="h-[360px] w-[240px]" />
            ))}
          </div>
        )}

        {/* Estado vacio explicito. */}
        {state === 'ready' && items.length === 0 && (
          <p className="px-4 py-6 text-sm font-medium text-vellum/70 sm:px-8 lg:px-12">
            No hay hechizos de este tipo en {title} todavia.
          </p>
        )}

        {/* Carrusel horizontal masivo de tarjetas grandes (sin límite duro) */}
        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-8 lg:px-12"
          style={{ scrollbarWidth: 'none' }}
          onPointerEnter={autoplay ? pauseAutoplay : undefined}
          onPointerDown={autoplay ? pauseAutoplay : undefined}
          onFocusCapture={autoplay ? pauseAutoplay : undefined}
          onTouchStart={autoplay ? pauseAutoplay : undefined}
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
