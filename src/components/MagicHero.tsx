import { memo, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Info, Play, Plus, Star } from 'lucide-react'
import type { LoadState, MediaItem } from '../types/tmdb'
import { HOUSES } from '../services/tmdb'
import { burstFromElement, emitListUpdate } from '../lib/magicFx'

interface MagicHeroProps {
  items: MediaItem[]
  state: LoadState
  onSelect: (item: MediaItem, origin?: DOMRect) => void
  isSaved: (item: MediaItem) => boolean
  onToggleSave: (item: MediaItem) => void
}

const formatDuration = (minutes: number): string =>
  minutes > 0 ? Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'min' : ''

const SPOTLIGHT_LIMIT = 5
const ROTATION_MS = 9000

/**
 * MagicHero V4.0 — Banner cinematográfico "El Pensadero".
 *
 * Rota automáticamente entre los primeros 5 títulos trending de TMDB.
 * Incluye botón "Ver Tráiler" prominente y metadatos con valoración en Galeones.
 */
function MagicHero({ items, state, onSelect, isSaved, onToggleSave }: MagicHeroProps) {
  const [index, setIndex] = useState(0)

  const spotlights = useMemo(
    () => items.filter((item) => item.backdrop).slice(0, SPOTLIGHT_LIMIT),
    [items],
  )

  useEffect(() => setIndex(0), [spotlights])

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
  const houseData = HOUSES.find((h) => h.id === (current?.house ?? 'gryffindor')) ?? HOUSES[0]
  const saved = current ? isSaved(current) : false

  // Brasas flotantes generadas una sola vez por título
  const embers = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 7,
        duration: 6 + Math.random() * 6,
        size: 1.5 + Math.random() * 3.5,
        drift: (Math.random() - 0.5) * 180,
        gold: Math.random() > 0.3,
      })),
    [current?.id],
  )

  if (!current) {
    return (
      <section className="relative flex h-[90vh] min-h-[600px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#141623] via-night to-[#0b0c14]">
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
              ? 'Invocando los títulos en tendencia de TMDB.'
              : 'No hay destacados disponibles ahora mismo. Prueba con la búsqueda mágica.'}
          </p>
        </div>
      </section>
    )
  }

  const duration = formatDuration(current.durationMinutes)

  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden">
      {/* Fondo cinématico: cross-fade entre destacados */}
      <motion.div
        key={current.id}
        initial={{ opacity: 0, scale: 1.07 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <img
          src={current.backdrop}
          alt=""
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
          onError={(event) => {
            // Sin 404 visibles: cae al poster (una sola vez, sin bucles).
            const image = event.currentTarget
            if (image.dataset.fallback === '1') return
            image.dataset.fallback = '1'
            image.src = current.poster
          }}
        />
      </motion.div>

      {/* Capas de velo: contraste máximo garantizado */}
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/88 to-night/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/55" />
      {/* Aura de la casa */}
      <div
        className="absolute inset-0 opacity-45 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse at 28% 45%, ${accent}50, transparent 62%)`,
        }}
      />

      {/* Brasas mágicas (CSS puro) */}
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
                background: ember.gold ? '#fff3c4' : accent + 'cc',
                boxShadow:
                  '0 0 8px 2px ' +
                  (ember.gold ? 'rgba(255,243,196,0.75)' : `${accent}88`),
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-28 sm:px-8 lg:px-12 lg:pb-36">
        <motion.div
          key={current.id + '-content'}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Distintivo de la casa */}
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-display text-[0.62rem] font-bold uppercase tracking-[0.3em]"
            style={{
              borderColor: accent + '90',
              color: accent,
              background: 'rgba(8,9,15,0.82)',
              boxShadow: `0 0 20px ${accent}30`,
            }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: accent }} />
            {houseData.sigil} {houseData.name} · {current.mediaType === 'tv' ? 'Serie' : 'Película'}
          </motion.span>

          {/* Título principal */}
          <h1 className="glow-effect font-display text-4xl font-black leading-[1.04] sm:text-6xl lg:text-7xl xl:text-8xl">
            {current.title}
          </h1>

          {current.tagline && (
            <p className="mt-3 font-display text-sm italic text-gold/88 sm:text-base lg:text-lg">
              "{current.tagline}"
            </p>
          )}

          {/* Metadatos */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-vellum">
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-gold text-gold" />
              <span className="text-base font-black text-gold-light">{current.score.toFixed(1)}</span>
              <span className="hidden text-xs text-vellum/65 sm:inline">Galeones de Oro</span>
            </span>
            {current.year > 0 && <span className="tabular-nums text-vellum/85">{current.year}</span>}
            {duration && <span className="tabular-nums text-vellum/85">{duration}</span>}
            {current.genres.length > 0 && (
              <span
                className="rounded border px-2 py-0.5 font-semibold text-xs text-vellum"
                style={{ borderColor: accent + '55' }}
              >
                {current.genres.slice(0, 3).join(' · ')}
              </span>
            )}
          </div>

          {/* Sinopsis */}
          <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-relaxed text-vellum/90 sm:text-base lg:max-w-2xl">
            {current.synopsis}
          </p>

          {/* Botones de acción */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {/* Ver Tráiler — botón principal dorado */}
            <motion.button
              type="button"
              onClick={(event) => onSelect(current, event.currentTarget.getBoundingClientRect())}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-lg bg-gold px-7 py-3.5 font-display text-sm font-black uppercase tracking-wider text-night shadow-[0_0_40px_-6px_rgba(255,215,0,0.95)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Play className="relative z-10 h-4 w-4 fill-night" />
              <span className="relative z-10">Ver Tráiler</span>
            </motion.button>

            {/* Más información */}
            <motion.button
              type="button"
              onClick={(event) => onSelect(current, event.currentTarget.getBoundingClientRect())}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 rounded-lg border-2 border-gold/75 bg-night/72 px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:bg-gold hover:text-night hover:border-gold"
            >
              <Info className="h-4 w-4" />
              Más Información
            </motion.button>

            {/* Mi Lista */}
            <motion.button
              type="button"
              onClick={(event) => {
                onToggleSave(current)
                // Chispas doradas + bump del contador (bus, sin setState).
                burstFromElement(event.currentTarget, saved ? 12 : 26)
                emitListUpdate({ saved: !saved })
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              aria-pressed={saved}
              className={
                'flex items-center gap-2.5 rounded-lg border-2 px-5 py-3.5 font-display text-sm font-bold uppercase tracking-wider backdrop-blur-sm transition-all duration-300 ' +
                (saved
                  ? 'border-gold bg-gold text-night shadow-[0_0_25px_rgba(255,215,0,0.5)]'
                  : 'border-gold/55 bg-night/70 text-gold-light hover:border-gold')
              }
            >
              {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {saved ? 'En Mi Lista' : 'Mi Lista'}
            </motion.button>
          </div>
        </motion.div>

        {/* Puntos de rotación */}
        {spotlights.length > 1 && (
          <div className="mt-7 flex items-center gap-2" aria-hidden="true">
            {spotlights.map((spotlight, i) => (
              <button
                key={spotlight.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={'Ver destacado ' + (i + 1)}
                className={
                  'h-1 rounded-full transition-all duration-500 ' +
                  (i === index ? 'w-10 opacity-100' : 'w-3 bg-vellum/30 hover:bg-vellum/55')
                }
                style={i === index ? { background: accent } : {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desvanecido inferior hacia las filas */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-night to-transparent" />
    </section>
  )
}

export default memo(MagicHero)
