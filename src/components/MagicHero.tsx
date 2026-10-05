import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Info, Play, Star } from 'lucide-react'
import type { Movie } from '../types'
import { HOUSE_COLORS } from '../data/mockMovies'

interface MagicHeroProps {
  movie: Movie
  onPlay: (movie: Movie) => void
  onInfo: (movie: Movie) => void
}

/** Formatea los minutos como "2h 14min". */
const formatDuration = (minutes: number) =>
  Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'min'

/**
 * MagicHero - Banner cinematico destacado con brasas flotantes, degradados
 * MAGICOS y los botones de hechizo Lumos (Ver Ahora) y Revelio (Informacion).
 */
export default function MagicHero({ movie, onPlay, onInfo }: MagicHeroProps) {
  const accent = HOUSE_COLORS[movie.house]

  // Las brasas se generan una sola vez por pelicula para mantener la animacion fluida.
  const embers = useMemo(
    () =>
      Array.from({ length: 26 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 7,
        duration: 6 + Math.random() * 6,
        size: 1.5 + Math.random() * 3.5,
        drift: (Math.random() - 0.5) * 160,
        gold: Math.random() > 0.3,
      })),
    [movie.id],
  )

  return (
    <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
      {/* Fondo cinematico */}
      <motion.div
        key={movie.backdrop}
        initial={{ scale: 1.12, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <img
          src={movie.backdrop}
          alt=""
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Velo de Sombras de Hogwarts */}
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/60" />
      <div
        className="absolute inset-0 opacity-40 mix-blend-soft-light"
        style={{ background: 'radial-gradient(circle at 30% 40%, ' + accent + '55, transparent 60%)' }}
      />

      {/* Brasas y polvo magico flotante */}
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
                background: ember.gold ? '#f3d97b' : '#8ab4f8',
                boxShadow: '0 0 8px 2px ' + (ember.gold ? 'rgba(243,217,123,0.75)' : 'rgba(138,180,248,0.6)'),
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-24 sm:px-8 lg:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          {/* Distintivo de la casa */}
          <span
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-display text-[0.6rem] uppercase tracking-[0.28em]"
            style={{ borderColor: accent + '88', color: accent, background: accent + '14' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
            Destacado del Pensadero
          </span>

          <h1 className="glow-effect font-display text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            {movie.title}
          </h1>

          <p className="mt-3 font-display text-sm italic text-gold/80 sm:text-base">
            {movie.tagline}
          </p>

          {/* Metadatos */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-parchment/70">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-gold text-gold" />
              <span className="font-semibold text-gold-light">{movie.score.toFixed(1)}</span>
              <span className="hidden sm:inline">Galeones de Oro</span>
            </span>
            <span className="tabular-nums">{movie.year}</span>
            <span className="rounded border border-parchment/25 px-1.5 py-0.5">
              {movie.rating}
            </span>
            <span className="tabular-nums">{formatDuration(movie.durationMinutes)}</span>
            {movie.seasons && <span>{movie.seasons} temporadas</span>}
          </div>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-parchment/60 sm:text-base">
            {movie.synopsis}
          </p>

          {/* Botones magicos */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <motion.button
              type="button"
              onClick={() => onPlay(movie)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-md bg-gold px-7 py-3 font-display text-sm font-bold uppercase tracking-wider text-night shadow-[0_0_30px_-6px_rgba(212,175,55,0.85)]"
            >
              {/* Barrido de luz del hechizo Lumos */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Play className="h-4 w-4 fill-night" />
              Ver Ahora
            </motion.button>

            <motion.button
              type="button"
              onClick={() => onInfo(movie)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2.5 rounded-md border border-parchment/35 bg-night/55 px-7 py-3 font-display text-sm font-bold uppercase tracking-wider text-parchment backdrop-blur-sm transition-colors hover:border-gold/70 hover:text-gold"
            >
              <Info className="h-4 w-4" />
              Mas Informacion
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Desvanecido inferior hacia la seccion de filas */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night to-transparent" />
    </section>
  )
}
