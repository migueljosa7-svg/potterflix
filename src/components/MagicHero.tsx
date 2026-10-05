import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Info, Play, Star } from 'lucide-react'
import type { Movie } from '../types'
import { HOUSE_ACCENTS } from '../data/mockMovies'
import { backdropFor } from '../data/filmArt'

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
 * magicos y los botones de hechizo Lumos (Ver Ahora) y Revelio (Informacion).
 *
 * CONTRASTE: titulos en oro claro y textos secundarios en vellum, ambos con
 * sombra oscura. El boton secundario usa texto blanco bold sobre fondo
 * translucido con borde dorado, nunca texto oscuro sobre fondo oscuro.
 */
function MagicHero({ movie, onPlay, onInfo }: MagicHeroProps) {
  const accent = HOUSE_ACCENTS[movie.house]
  const backdrop = backdropFor(movie)

  // Las brasas se generan una sola vez por pelicula para mantener la animacion fluida.
  const embers = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => ({
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
        key={movie.id}
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <img src={backdrop} alt="" className="h-full w-full object-cover" />
      </motion.div>

      {/* Velo de Sombras de Hogwarts */}
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/60" />
      <div
        className="absolute inset-0 opacity-50"
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
                background: ember.gold ? '#fff3c4' : '#a9c8ff',
                boxShadow: '0 0 8px 2px ' + (ember.gold ? 'rgba(255,243,196,0.75)' : 'rgba(169,200,255,0.6)'),
              } as React.CSSProperties
            }
          />
        ))}
      </div>
{/* Contenido */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-24 sm:px-8 lg:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          {/* Distintivo de la casa */}
          <span
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-display text-[0.6rem] font-bold uppercase tracking-[0.28em]"
            style={{
              borderColor: accent + '99',
              color: accent,
              background: 'rgba(8,9,15,0.75)',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
            Destacado del Pensadero
          </span>

          {/* Titulo en oro brillante con drop-shadow */}
          <h1 className="glow-effect font-display text-4xl font-black leading-[1.05] sm:text-6xl lg:text-7xl">
            {movie.title}
          </h1>

          <p className="mt-3 font-display text-sm italic text-gold/90 sm:text-base">
            {movie.tagline}
          </p>

          {/* Metadatos en vellum claro */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-vellum">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-gold text-gold" />
              <span className="font-bold text-gold-light">{movie.score.toFixed(1)}</span>
              <span className="hidden sm:inline">Galeones de Oro</span>
            </span>
            <span className="tabular-nums">{movie.year}</span>
            <span className="rounded border border-gold/45 px-1.5 py-0.5 font-semibold">
              {movie.rating}
            </span>
            <span className="tabular-nums">{formatDuration(movie.durationMinutes)}</span>
          </div>

          {/* Sinopsis en blanco pergamino */}
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-vellum sm:text-base">
            {movie.synopsis}
          </p>

          {/* Botones magicos de alto contraste */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <motion.button
              type="button"
              onClick={() => onPlay(movie)}
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
              onClick={() => onInfo(movie)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2.5 rounded-md border-2 border-gold/80 bg-night/70 px-7 py-3 font-display text-sm font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:bg-gold hover:text-night"
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

export default memo(MagicHero)