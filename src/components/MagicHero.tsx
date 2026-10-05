import { memo, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Info, Play, Plus, Star } from 'lucide-react'
import type { LoadState, MediaItem } from '../types/tmdb'
import { HOUSES } from '../services/tmdb'

interface MagicHeroProps {
  /** Titulos destacados (GET /trending/all/week). */
  items: MediaItem[]
  state: LoadState
  /** Abre el modal reproductor (Ver Ahora / Más información). */
  onSelect: (item: MediaItem) => void
  /** Si el titulo destacado esta en Mi Lista (se evalua por titulo rotado). */
  isSaved: (item: MediaItem) => boolean
  onToggleSave: (item: MediaItem) => void
}

/** Formatea los minutos como "2h 14min"; '' si la pieza no reporta duracion. */
const formatDuration = (minutes: number): string =>
  minutes > 0 ? Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'min' : ''

/** Cantidad de titulos que rotan en el banner. */
const SPOTLIGHT_LIMIT = 5
/** Milisegundos que dura cada destacado antes de rotar. */
const ROTATION_MS = 9000

/**
 * MagicHero - Banner cinematico del Pensadero con los destacados de la semana
 * de TMDB. Rota automaticamente entre los primeros titulos (salvo que el
 * usuario prefiera movimiento reducido) y abre el modal reproductor con el
 * trailer oficial.
 *
 * RENDIMIENTO: las brasas se generan una vez por titulo con `useMemo` y son
 * CSS puro (`animate-ember`), de modo que no hay repintados por frame. La
 * rotacion es un `setInterval` de estado: solo re-renderiza este componente,
 * nunca las filas ni las tarjetas.
 */
function MagicHero({
  items,
  state,
  onSelect,
  isSaved,
  onToggleSave,
}: MagicHeroProps) {
  const [index, setIndex] = useState(0)

  /** Solo los titulos con fondo panoramico sirven para el banner. */
  const spotlights = useMemo(
    () => items.filter((item) => item.backdrop).slice(0, SPOTLIGHT_LIMIT),
    [items],
  )

  // Si cambia el catalogo, se vuelve al primer destacado.
  useEffect(() => setIndex(0), [spotlights])

  // Rotacion automatica, desactivada con preferencia de movimiento reducido.
  useEffect(() => {
    if (spotlights.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % spotlights.length),
      ROTATION_MS,
    )
    return () => window.clearInterval(timer)
  }, [spotlights.length])

  const current = spotlights[Math.min(index, spotlights.length - 1)] ?? null
  const accent =
    HOUSES.find((house) => house.id === (current?.house ?? 'gryffindor'))?.accent ?? '#ffd75e'
  /** Estado del destacado visible respecto a Mi Lista. */
  const saved = current ? isSaved(current) : false

  // Brasas flotantes: se recalculan solo cuando cambia el titulo en pantalla.
  const embers = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 7,
        duration: 6 + Math.random() * 6,
        size: 1.5 + Math.random() * 3.5,
        drift: (Math.random() - 0.5) * 160,
        gold: Math.random() > 0.3,
      })),
    [current?.id],
  )

  /* ---------- Estado de carga / vacio: esqueleto que conserva la altura ---------- */
  if (!current) {
    return (
      <section className="relative flex h-[88vh] min-h-[560px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#141623] via-night to-[#0b0c14]">
        <div className="px-6 text-center">
          <p className="glow-effect font-display text-2xl font-bold sm:text-4xl">
            {state === 'loading' ? 'Encendiendo el Pensadero…' : 'El Pensadero está vacío'}
          </p>
          {state === 'loading' && (
            <div className="mx-auto mt-6 h-1 w-56 overflow-hidden rounded-full bg-ink">
              <div className="h-full w-1/3 animate-shimmer rounded-full bg-gold" />
            </div>
          )}
          <p className="mt-4 max-w-md text-sm text-vellum/80">
            {state === 'loading'
              ? 'Invocando los titulos en tendencia de TMDB.'
              : 'No hay destacados disponibles ahora mismo. Prueba con la busqueda magica.'}
          </p>
        </div>
      </section>
    )
  }

  const duration = formatDuration(current.durationMinutes)

  return (
    <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
      {/* Fondo cinematico: cross-fade entre destacados */}
      <motion.div
        key={current.id}
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <img
          src={current.backdrop}
          alt=""
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
      </motion.div>

      {/* Velo de sombras: contraste garantizado para el texto claro */}
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/60" />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(circle at 30% 40%, ' + accent + '55, transparent 60%)',
        }}
      />

      {/* Brasas y polvo magico (CSS puro, sin coste en JS) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {embers.map((ember) => (
          <span
            key={ember.id}
            className="absolute bottom-[-10%] rounded-full animate-ember"
            style={
              {
                left: ember.left + '%',
                width: ember.size + 'px',
                height: ember.size + 'px',
                animationDelay: ember.delay + 's',
                animationDuration: ember.duration + 's',
                '--drift': ember.drift + 'px',
                background: ember.gold ? '#fff3c4' : '#a9c8ff',
                boxShadow:
                  '0 0 8px 2px ' +
                  (ember.gold ? 'rgba(255,243,196,0.75)' : 'rgba(169,200,255,0.6)'),
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-24 sm:px-8 lg:px-12 lg:pb-32">
        <motion.div
          key={current.id + '-content'}
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Distintivo de la casa / tipo de medio */}
          <span
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-display text-[0.6rem] font-bold uppercase tracking-[0.28em]"
            style={{
              borderColor: accent + '99',
              color: accent,
              background: 'rgba(8,9,15,0.75)',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
            Destacado del Pensadero · {current.mediaType === 'tv' ? 'Serie' : 'Película'}
          </span>

          <h1 className="glow-effect font-display text-4xl font-black leading-[1.05] sm:text-6xl lg:text-7xl">
            {current.title}
          </h1>

          {current.tagline && (
            <p className="mt-3 font-display text-sm italic text-gold/90 sm:text-base">
              {current.tagline}
            </p>
          )}

          {/* Metadatos en vellum claro */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-vellum">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-gold text-gold" />
              <span className="font-bold text-gold-light">{current.score.toFixed(1)}</span>
              <span className="hidden sm:inline">Galeones de Oro</span>
            </span>
            {current.year > 0 && <span className="tabular-nums">{current.year}</span>}
            {duration && <span className="tabular-nums">{duration}</span>}
            {current.genres.length > 0 && (
              <span className="rounded border border-gold/45 px-1.5 py-0.5 font-semibold text-vellum">
                {current.genres.slice(0, 3).join(' · ')}
              </span>
            )}
          </div>

          {/* Sinopsis en pergamino claro */}
          <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-relaxed text-vellum sm:text-base">
            {current.synopsis}
          </p>
          {/* Botones magicos de alto contraste */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <motion.button
              type="button"
              onClick={() => onSelect(current)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-md bg-gold px-7 py-3 font-display text-sm font-black uppercase tracking-wider text-night shadow-[0_0_30px_-6px_rgba(255,215,0,0.9)]"
            >
              {/* Barrido de luz del hechizo Lumos */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Play className="h-4 w-4 fill-night" />
              Ver Ahora
            </motion.button>

            <motion.button
              type="button"
              onClick={() => onSelect(current)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2.5 rounded-md border-2 border-gold/80 bg-night/70 px-7 py-3 font-display text-sm font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:bg-gold hover:text-night"
            >
              <Info className="h-4 w-4" />
              Más Información
            </motion.button>

            <motion.button
              type="button"
              onClick={() => onToggleSave(current)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              aria-pressed={saved}
              className={
                'flex items-center gap-2.5 rounded-md border-2 px-5 py-3 font-display text-sm font-bold uppercase tracking-wider backdrop-blur-sm transition-colors ' +
                (saved
                  ? 'border-gold bg-gold text-night'
                  : 'border-gold/60 bg-night/70 text-gold-light hover:border-gold')
              }
            >
              {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {saved ? 'En Mi Lista' : 'Mi Lista'}
            </motion.button>
          </div>
        </motion.div>

        {/* Puntos de rotacion entre destacados */}
        {spotlights.length > 1 && (
          <div className="mt-6 flex items-center gap-2" aria-hidden="true">
            {spotlights.map((spotlight, i) => (
              <button
                key={spotlight.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={'Ver destacado ' + (i + 1)}
                className={
                  'h-1 rounded-full transition-all duration-500 ' +
                  (i === index ? 'w-8 bg-gold' : 'w-3 bg-vellum/35 hover:bg-vellum/60')
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Desvanecido inferior hacia las filas */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night to-transparent" />
    </section>
  )
}

export default memo(MagicHero)

