import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, Calendar, Check, Clock, ExternalLink, Loader2, Play, Star, X } from 'lucide-react'
import type { MediaItem } from '../types/tmdb'
import { HOUSES, getDetails, hasApiKey } from '../services/tmdb'
import { useTrailer } from '../hooks/useCatalog'

interface MagicModalProps {
  /** Titulo seleccionado; `null` cierra el modal. */
  item: MediaItem | null
  onClose: () => void
  /** Si el titulo esta en Mi Lista de Hechizos. */
  saved: boolean
  onToggleSave: (item: MediaItem) => void
}

/** Formatea los minutos como "2h 14min"; '' si no hay duracion. */
const formatDuration = (minutes: number): string =>
  minutes > 0 ? Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'min' : ''

/** Incrustado seguro de YouTube sin cookies publicitarias, con autoplay. */
const youtubeEmbedUrl = (key: string): string =>
  `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&rel=0&modestbranding=1`

/** Enlace canonico a YouTube para el fallback. */
const youtubeWatchUrl = (key: string): string => `https://www.youtube.com/watch?v=${key}`

/** Enlace al titulo original en TMDB (solo para titulos reales de la API). */
const tmdbUrl = (item: MediaItem): string | null =>
  item.tmdbId === 0 ? null : `https://www.themoviedb.org/${item.mediaType}/${item.tmdbId}`

/**
 * Reproductor de trailer con recurso.
 *
 * Incrusta el trailer oficial en `youtube-nocookie.com` con `autoplay=1`. Si el
 * embed no responde en 12 s (bloqueo de red, video retirado) se muestra una
 * pantalla de recurso con el boton para abrirlo en YouTube, de modo que el
 * usuario nunca se queda mirando un rectangulo negro.
 */
function TrailerPlayer({
  item,
  videoKey,
  loading,
}: {
  item: MediaItem
  videoKey: string | null
  loading: boolean
}) {
  const [failed, setFailed] = useState(false)

  // Un cambio de titulo reinicia el estado del reproductor.
  useEffect(() => setFailed(false), [item.id, videoKey])

  // Margen para que el iframe responda antes de ofrecer el recurso.
  useEffect(() => {
    if (!videoKey || failed) return
    const timer = window.setTimeout(() => setFailed(true), 12000)
    return () => window.clearTimeout(timer)
  }, [videoKey, failed])

  const showEmbed = Boolean(videoKey) && !failed

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      {showEmbed ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={youtubeEmbedUrl(videoKey as string)}
          title={'Tráiler de ' + item.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <>
          <img
            src={item.backdrop}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-night/30" />

          {loading && !videoKey ? (
            /* ---------- Cargando trailer ---------- */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
              <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-gold-light">
                Invocando el tráiler oficial…
              </p>
            </div>
          ) : videoKey && failed ? (
            /* ---------- Recurso: embed no disponible ---------- */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-gold-light">
                El hechizo de reproducción está sellado
              </p>
              <p className="max-w-sm text-xs leading-relaxed text-vellum/90">
                No hemos podido incrustar el tráiler aquí. Ábrelo directamente en YouTube, donde se
                verá sin interrupciones.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={youtubeWatchUrl(videoKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-night transition-transform hover:scale-105"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir en YouTube
                </a>
                <button
                  type="button"
                  onClick={() => setFailed(false)}
                  className="rounded-md border border-gold/60 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-gold-light transition-colors hover:bg-gold/15"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : (
            /* ---------- Sin trailer disponible ---------- */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <Play className="h-8 w-8 text-gold/70" />
              <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-gold-light">
                Sin tráiler oficial
              </p>
              <p className="max-w-sm text-xs leading-relaxed text-vellum/85">
                TMDB no tiene un vídeo de YouTube para este título. Disfruta de la sinopsis y del
                reparto más abajo.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
/**
 * MagicModal - Modal de detalle con reproductor de trailer de YouTube y
 * ficha completa de TMDB.
 *
 * El trailer se resuelve de forma perezosa (`useTrailer` →
 * `GET /movie/{id}/videos` o `/tv/{id}/videos`) y el reparto, la duración y
 * los géneros reales se amplian con `getDetails` al abrir, sin penalizar la
 * navegación. Escape y el clic en el fondo cierran el modal, y el scroll del
 * cuerpo se bloquea mientras está visible.
 */
export default function MagicModal({ item, onClose, saved, onToggleSave }: MagicModalProps) {
  const { trailerKey, loading: trailerLoading } = useTrailer(item)
  /** Ficha ampliada (reparto, géneros, duración); null mientras carga. */
  const [details, setDetails] = useState<MediaItem | null>(null)

  // Pide el detalle completo solo cuando el modal esta abierto.
  useEffect(() => {
    if (!item) {
      setDetails(null)
      return
    }
    setDetails(null)
    // El catalogo local ya trae reparto: no hay nada que pedir.
    if (item.tmdbId === 0) return

    const controller = new AbortController()
    getDetails(item, controller.signal).then((enriched) => {
      if (!controller.signal.aborted) setDetails(enriched)
    })
    return () => controller.abort()
  }, [item])

  // Bloquea el scroll de fondo y cierra con Escape.
  useEffect(() => {
    if (!item) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [item, onClose])

  const title = item?.title ?? ''
  /** Datos enriquecidos si ya llegaron; si no, el item base. */
  const media = details ?? item
  const house = HOUSES.find((entry) => entry.id === (media?.house ?? 'gryffindor')) ?? HOUSES[0]
  const accent = house.accent
  const duration = media ? formatDuration(media.durationMinutes) : ''
  const tmdbLink = media ? tmdbUrl(media) : null

  return (
    <AnimatePresence>
      {item && media && (
        <motion.div
          key="magic-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm sm:p-6 lg:p-10"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={'Ficha de ' + title}
        >
          <motion.article
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="parchment speaking-frame relative w-full max-w-4xl overflow-hidden rounded-xl"
          >
            {/* Boton de cierre */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ficha"
              className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-gold/60 bg-night/90 text-gold-light transition-colors hover:bg-gold hover:text-night"
            >
              <X className="h-5 w-5" />
            </button>

            {/* ---------- Reproductor de trailer ---------- */}
            <TrailerPlayer item={item} videoKey={trailerKey} loading={trailerLoading} />
            <div className="px-5 pb-8 pt-6 sm:px-8">
              {/* Titulo y lema */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="glow-effect font-display text-2xl font-bold sm:text-4xl">
                    {title}
                  </h2>
                  {media.tagline && (
                    <p className="mt-1.5 font-display text-sm italic text-gold/90">
                      «{media.tagline}»
                    </p>
                  )}
                </div>

                {/* Guardar en Mi Lista de Hechizos */}
                <button
                  type="button"
                  onClick={() => onToggleSave(item)}
                  aria-pressed={saved}
                  className={
                    'flex shrink-0 items-center gap-2 rounded-md border-2 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-colors ' +
                    (saved
                      ? 'border-gold bg-gold text-night'
                      : 'border-gold/70 text-gold-light hover:bg-gold/15')
                  }
                >
                  {saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {saved ? 'En Mi Lista' : 'Añadir a Mi Lista'}
                </button>
              </div>

              {/* Metadatos: puntuación, año, duración, tipo y casa */}
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-vellum">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-bold text-gold-light">{media.score.toFixed(1)}</span>
                  <span className="text-vellum/85">Galeones de Oro</span>
                </span>
                {media.year > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gold/80" />
                    {media.year}
                  </span>
                )}
                {duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gold/80" />
                    {duration}
                  </span>
                )}
                <span className="rounded border border-gold/45 px-1.5 py-0.5 font-semibold text-vellum">
                  {media.mediaType === 'tv' ? 'Serie' : 'Película'}
                </span>
                {media.seasons && <span>{media.seasons} temporadas</span>}
                <span
                  className="rounded-full border px-2 py-0.5 font-display text-[0.6rem] font-bold uppercase tracking-[0.18em]"
                  style={{ borderColor: accent + '99', color: accent }}
                >
                  {house.sigil} {house.name}
                </span>
              </div>
              {/* Sinopsis en pergamino: fondo oscuro, texto claro garantizado */}
              <div className="mt-6 rounded-lg border border-gold/25 bg-ink p-5 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
                <h3 className="mb-2 font-display text-xs font-bold uppercase tracking-[0.26em] text-gold">
                  Sinopsis
                </h3>
                <p className="text-sm leading-relaxed text-vellum">{media.synopsis}</p>
              </div>

              {/* Etiquetas de genero */}
              {media.genres.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {media.genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[0.7rem] font-semibold text-gold-light"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Reparto */}
              {media.cast.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-[0.26em] text-gold">
                    Reparto
                  </h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {media.cast.map((member) => (
                      <li
                        key={member.name + member.character}
                        className="flex items-baseline gap-2 rounded border border-gold/20 bg-ink px-3 py-2"
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
              )}

              {/* Enlaces externos: YouTube (si hay trailer) y TMDB */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {trailerKey && (
                  <a
                    href={youtubeWatchUrl(trailerKey)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-gold/60 bg-night/85 px-4 py-2 font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold-light transition-colors hover:bg-gold hover:text-night"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver el tráiler en YouTube
                  </a>
                )}
                {tmdbLink && (
                  <a
                    href={tmdbLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-vellum/30 px-4 py-2 font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-vellum transition-colors hover:border-gold hover:text-gold-light"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ficha en TMDB
                  </a>
                )}
                {!hasApiKey && (
                  <span className="text-[0.68rem] text-vellum/60">
                    Modo demo: datos del catálogo local de respaldo.
                  </span>
                )}
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

