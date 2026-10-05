import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Clock, Play, Star, X } from 'lucide-react'
import type { Movie } from '../types'
import { HOUSE_COLORS, HOUSES } from '../data/mockMovies'

interface MagicModalProps {
  movie: Movie | null
  onClose: () => void
}

/** Formatea los minutos como "2h 14min". */
const formatDuration = (minutes: number) =>
  Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'min'

/**
 * MagicModal - Ventana flotante con marco parlante de Hogwarts, sinopsis en
 * pergamino, ficha tecnica, reparto y un reproductor de trailer embebido.
 */
export default function MagicModal({ movie, onClose }: MagicModalProps) {
  const [showTrailer, setShowTrailer] = useState(false)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  // Reinicia el reproductor y bloquea el scroll del fondo con cada apertura.
  useEffect(() => {
    if (!movie) return
    setShowTrailer(false)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [movie, onClose])

  const house = movie ? HOUSES.find((item) => item.id === movie.house) : undefined
  const accent = movie ? HOUSE_COLORS[movie.house] : '#d4af37'

  return (
    <AnimatePresence>
      {movie && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={movie.title}
        >
          {/* Fondo con hechizo de Norden */}
          <motion.button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(8px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 cursor-default bg-night/85"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="speaking-frame parchment relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl"
          >
            {/* Cabecera cinematica */}
            <div className="relative h-56 overflow-hidden sm:h-72">
              {showTrailer ? (
                <div className="absolute inset-0 bg-black">
                  <iframe
                    className="h-full w-full"
                    src={
                      'https://www.youtube-nocookie.com/embed/' +
                      movie.trailerId +
                      '?autoplay=1&rel=0'
                    }
                    title={'Trailer de ' + movie.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <>
                  <img
                    src={movie.backdrop}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-parchment via-parchment/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-night/70 to-transparent" />

                  {/* Boton de trailer */}
                  <button
                    type="button"
                    onClick={() => setShowTrailer(true)}
                    className="group absolute inset-0 flex items-center justify-center"
                    aria-label={'Reproducir trailer de ' + movie.title}
                  >
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold/70 bg-night/55 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <span className="absolute inset-0 animate-pulse-ring rounded-full border border-gold/60" />
                      <Play className="h-6 w-6 translate-x-0.5 fill-gold text-gold" />
                    </span>
                  </button>
                </>
              )}
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-night/80 text-gold backdrop-blur-sm transition-all duration-300 hover:bg-gold hover:text-night"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative -mt-16 px-5 pb-7 sm:-mt-20 sm:px-9 sm:pb-9">
              {/* Distintivo de la casa */}
              {house && (
                <span
                  className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-display text-[0.6rem] uppercase tracking-[0.24em]"
                  style={{ borderColor: accent + '88', color: accent, background: accent + '14' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                  {house.name}
                </span>
              )}

              <h2 className="glow-effect font-display text-2xl font-bold sm:text-4xl">
                {movie.title}
              </h2>
              <p className="mt-1.5 font-display text-xs italic text-gold/75 sm:text-sm">
                {movie.tagline}
              </p>

              {/* Ficha tecnica */}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-gold/15 py-3 text-xs text-parchment/70">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-semibold text-gold-light">{movie.score.toFixed(1)}</span>
                  Galeones de Oro
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {movie.year}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(movie.durationMinutes)}
                </span>
                <span className="rounded border border-parchment/25 px-1.5 py-0.5">
                  {movie.rating}
                </span>
                {movie.seasons && <span>{movie.seasons} temporadas</span>}
              </div>

              {/* Sinopsis en pergamino antiguo */}
              <div className="parchment mt-6 rounded-lg border border-gold/20 p-5 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
                <h3 className="mb-2 font-display text-xs uppercase tracking-[0.26em] text-gold/80">
                  Sinopsis
                </h3>
                <p className="text-sm leading-relaxed text-parchment/80">{movie.synopsis}</p>
              </div>

              {/* Generos */}
              <div className="mt-5 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-gold/25 bg-gold/8 px-3 py-1 text-[0.7rem] text-gold/85"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Reparto */}
              <div className="mt-6">
                <h3 className="mb-3 font-display text-xs uppercase tracking-[0.26em] text-gold/80">
                  Reparto
                </h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {movie.cast.map((member) => (
                    <li
                      key={member.name + member.character}
                      className="flex items-baseline gap-2 rounded border border-parchment/12 bg-ink/40 px-3 py-2"
                    >
                      <span className="font-display text-sm text-gold-light">{member.name}</span>
                      <span className="text-xs text-parchment/50">como</span>
                      <span className="truncate text-xs italic text-parchment/70">
                        {member.character}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
