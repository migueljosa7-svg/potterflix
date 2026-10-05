import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Clock, ExternalLink, Play, Star, X } from 'lucide-react'
import type { Movie } from '../types'
import { HOUSE_ACCENTS, HOUSES, youtubeEmbedUrl, youtubeWatchUrl } from '../data/mockMovies'
import { backdropFor } from '../data/filmArt'

interface MagicModalProps {
  movie: Movie | null
  onClose: () => void
}

/** Formatea los minutos como "2h 14min". */
const formatDuration = (minutes: number) =>
  Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'min'

/**
 * Reproductor de trailer con recurso.
 *
 * Incrusta el trailer en `youtube-nocookie.com` (dominio seguro, sin cookies
 * publicitarias). Si el embed no responde en 12 s —bloqueo de red,Tracking de
 * terceros o video retirado— se muestra automaticamente una pantalla de
 * recurso con el boton para abrirlo directamente en YouTube. Asi el usuario
 * nunca se queda mirando un rectangulo negro.
 */
function TrailerPlayer({ movie }: { movie: Movie }) {
  const [started, setStarted] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setStarted(false)
    setFailed(false)
  }, [movie.id])

  // Al montar el iframe damos un margen: si no responde, activamos el fallback.
  useEffect(() => {
    if (!started || failed) return
    const timer = window.setTimeout(() => setFailed(true), 12000)
    return () => window.clearTimeout(timer)
  }, [started, failed])

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      {started && !failed ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={youtubeEmbedUrl(movie.trailerId) + '&autoplay=1'}
          title={'Tráiler de ' + movie.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <>
          <img
            src={backdropFor(movie)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-night/30" />

          {failed ? (
            /* ---------- Pantalla de recurso ---------- */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-gold-light">
                El hechizo de reproducción está sellado
              </p>
              <p className="max-w-sm text-xs leading-relaxed text-vellum/90">
                No hemos podido incrustar el tráiler aquí. Ábrelo directamente en
                YouTube, donde se verá sin interrupciones.
              </p>
              <a
                href={youtubeWatchUrl(movie.trailerId)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-night transition-transform hover:scale-105"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir en YouTube
              </a>
              <button
                type="button"
                onClick={() => {
                  setFailed(false)
                  setStarted(true)
                }}
                className="rounded-md border border-gold/70 bg-night/85 px-5 py-2 font-display text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gold hover:text-night"
              >
                Reintentar
              </button>
            </div>
          ) : (
            /* ---------- Boton de reproducción ---------- */
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="group absolute inset-0 flex flex-col items-center justify-center gap-3"
              aria-label={'Reproducir el tráiler de ' + movie.title}
            >
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-night/60 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                <span className="absolute inset-0 animate-pulse-ring rounded-full border border-gold/70" />
                <Play className="h-8 w-8 translate-x-0.5 fill-gold text-gold" />
              </span>
              <span className="rounded border border-gold/50 bg-night/85 px-4 py-1.5 font-display text-[0.6rem] font-bold uppercase tracking-[0.24em] text-gold-light">
                Ver el tráiler
              </span>
            </button>
          )}
        </>
      )}
    </div>
  )
}
/**
 * MagicModal - Ventana flotante con marco parlante de Hogwarts, sinopsis en
 * pergamino claro, ficha técnica, reparto y el reproductor de trailer.
 *
 * CONTRASTE: todo el texto usa `vellum` (claro) o dorados sobre superficies
 * oscuras. Nunca se usa `parchment`/`ink` como color de texto, que es
 * justamente lo que hacia ilegible la version anterior.
 */
export default function MagicModal({ movie, onClose }: MagicModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null)

  // Bloquea el scroll del fondo, cierra con Escape y enfoca el botón de cerrar.
  useEffect(() => {
    if (!movie) return
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
  const accent = movie ? HOUSE_ACCENTS[movie.house] : '#ffd700'

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
            className="absolute inset-0 cursor-default bg-night/88"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="speaking-frame parchment relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl"
          >
            {/* Cabecera cinematica con el reproductor */}
            <div className="relative">
              <TrailerPlayer movie={movie} />

              {/* Degradado para que el boton de cierre contraste siempre */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-night/85 to-transparent" />

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-gold/60 bg-night/90 text-gold-light backdrop-blur-sm transition-all duration-300 hover:bg-gold hover:text-night"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative px-5 pb-7 pt-5 sm:px-9 sm:pb-9">
              {/* Distintivo de la casa */}
              {house && (
                <span
                  className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-display text-[0.6rem] font-bold uppercase tracking-[0.24em]"
                  style={{
                    borderColor: accent + '99',
                    color: accent,
                    background: 'rgba(8,9,15,0.75)',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                  {house.name} · {house.motto}
                </span>
              )}

              <h2 className="glow-effect font-display text-2xl font-bold sm:text-4xl">
                {movie.title}
              </h2>
              {movie.originalTitle && (
                <p className="mt-1 text-xs italic text-vellum/70">{movie.originalTitle}</p>
              )}
              <p className="mt-2 font-display text-sm italic text-gold/85 sm:text-base">
                {movie.tagline}
              </p>
{/* Ficha tecnica */}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-gold/25 py-3 text-xs text-vellum">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-semibold text-gold-light">{movie.score.toFixed(1)}</span>
                  <span className="text-vellum/85">Galeones de Oro</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {movie.year}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(movie.durationMinutes)}
                </span>
                <span className="rounded border border-gold/45 px-1.5 py-0.5 font-semibold text-vellum">
                  {movie.rating}
                </span>
                {movie.seasons && <span>{movie.seasons} temporadas</span>}
              </div>

              {/* Sinopsis en pergamino: fondo oscuro, texto claro garantizado */}
              <div className="mt-6 rounded-lg border border-gold/25 bg-[#1e1e2d] p-5 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
                <h3 className="mb-2 font-display text-xs font-bold uppercase tracking-[0.26em] text-gold">
                  Sinopsis
                </h3>
                <p className="text-sm leading-relaxed text-vellum">{movie.synopsis}</p>
              </div>

              {/* Generos */}
              <div className="mt-5 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-gold/40 px-3 py-1 text-[0.7rem] font-semibold text-gold-light"
                    style={{ background: 'rgba(255,215,0,0.08)' }}
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Reparto: fondo #1e1e2d, nombre en blanco y personaje en oro */}
              <div className="mt-6">
                <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-[0.26em] text-gold">
                  Reparto
                </h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {movie.cast.map((member) => (
                    <li
                      key={member.name + member.character}
                      className="flex items-baseline gap-2 rounded border border-gold/20 bg-[#1e1e2d] px-3 py-2"
                    >
                      <span className="font-display text-sm font-bold text-white">
                        {member.name}
                      </span>
                      <span className="text-xs text-vellum/70">como</span>
                      <span className="truncate text-xs font-medium italic text-gold">
                        {member.character}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recurso directo al trailer, siempre disponible */}
              <a
                href={youtubeWatchUrl(movie.trailerId)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-md border border-gold/60 bg-night/85 px-4 py-2 font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold-light transition-colors hover:bg-gold hover:text-night"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver el tráiler en YouTube
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}