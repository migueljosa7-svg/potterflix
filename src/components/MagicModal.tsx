import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bookmark, Calendar, Check, Clock, ExternalLink, Loader2, Play, Star, X } from 'lucide-react'
import type { MediaItem } from '../types/tmdb'
import { HOUSES, getDetails, hasApiKey } from '../services/tmdb'
import { useTrailer } from '../hooks/useCatalog'
import { burstFromElement, emitListUpdate } from '../lib/magicFx'

interface MagicModalProps {
  /** Titulo seleccionado; `null` cierra el modal. */
  item: MediaItem | null
  /**
   * Rectangulo (en coordenadas de viewport) de la carta que abrio el modal.
   * Es el punto de partida de la animacion FLIP: la carta "se abre" y crece
   * hasta ocupar el area del reproductor. `null` => entrada por defecto.
   */
  origin: DOMRect | null
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
 * pantalla de recurso con el boton para abrirlo en YouTube.
 */
function TrailerPlayer({
  item,
  videoKey,
  loading,
  accent,
}: {
  item: MediaItem
  videoKey: string | null
  loading: boolean
  accent: string
}) {
  const [failed, setFailed] = useState(false)
  const reduceMotion = useReducedMotion()
  /** El iframe de YouTube se invoca al final de la animacion de apertura. */
  const [armed, setArmed] = useState(false)

  useEffect(() => setFailed(false), [item.id, videoKey])

  useEffect(() => {
    if (!videoKey || failed) return
    const timer = window.setTimeout(() => setFailed(true), 12000)
    return () => window.clearTimeout(timer)
  }, [videoKey, failed])

  /**
   * Retrasa el montaje del reproductor: mientras la carta vuela hacia la
   * ficha (animacion FLIP de ~0,5 s) solo se ve el fondo, sin luchar con un
   * iframe pesado por la GPU. Si el usuario tiene movimiento reducido, al
   * instante.
   */
  useEffect(() => {
    setArmed(false)
    if (!videoKey || failed) return
    const timer = window.setTimeout(() => setArmed(true), reduceMotion ? 0 : 520)
    return () => window.clearTimeout(timer)
  }, [videoKey, failed, reduceMotion])

  const showEmbed = Boolean(videoKey) && !failed && armed
  /** Falta poco para el trailer: se muestra el fondo con la espera mágica. */
  const waiting = Boolean(videoKey) && !failed && !armed

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
            onError={(event) => {
              // Sin 404 visibles: cae al poster (una sola vez, sin bucles).
              const image = event.currentTarget
              if (image.dataset.fallback === '1') return
              image.dataset.fallback = '1'
              image.src = item.poster
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-night/20" />
          {/* Velo con color de la casa */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${accent}44, transparent 70%)`,
            }}
          />

          {waiting || (loading && !videoKey) ? (
            /* ---------- Cargando trailer (o esperando a que aterrice la carta) ---------- */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-gold" />
                <div
                  className="absolute inset-0 rounded-full blur-md opacity-50"
                  style={{ background: accent }}
                />
              </div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-gold-light">
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
                No hemos podido incrustar el tráiler aquí. Ábrelo directamente en YouTube.
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
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold/40"
                style={{ background: `rgba(8,9,15,0.85)` }}
              >
                <Play className="h-7 w-7 text-gold/70" />
              </div>
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
 * MagicModal V4.0 — El Pensadero.
 *
 * Modal de detalle tamaño gigante (max-w-5xl) con reproductor de trailer de
 * YouTube y ficha completa de TMDB. Diseño de pergamino oscuro con sinopsis
 * legible, valoración en Galeones y reparto.
 */
export default function MagicModal({ item, origin, onClose, saved, onToggleSave }: MagicModalProps) {
  const { trailerKey, loading: trailerLoading } = useTrailer(item)
  const [details, setDetails] = useState<MediaItem | null>(null)
  const reduceMotion = useReducedMotion()
  /** Contenedor del dialogo: foco inicial, trampa de Tab y `outline` oculto. */
  const dialogRef = useRef<HTMLDivElement | null>(null)

  /**
   * Rectangulo final del "portal": coincide con el area de video de la ficha
   * (hoja `max-w-5xl` = 1024px centrada, con el padding `p-4/sm:p-6/lg:p-8`
   * del fondo y `aspect-video` del reproductor). Se calcula en lugar de medir
   * para no esperar un render extra: el clon aterriza exactamente donde va a
   * aparecer el trailer.
   */
  const portalTarget = useMemo(() => {
    if (!origin || typeof window === 'undefined') return null
    const vw = window.innerWidth
    const pad = vw >= 1024 ? 32 : vw >= 640 ? 24 : 16 // lg:p-8 / sm:p-6 / p-4
    const width = Math.min(1024, vw - pad * 2)
    const height = (width * 9) / 16 // aspect-video
    return { top: pad, left: (vw - width) / 2, width, height }
  }, [origin])

  useEffect(() => {
    if (!item) {
      setDetails(null)
      return
    }
    setDetails(null)
    if (item.tmdbId === 0) return

    const controller = new AbortController()
    getDetails(item, controller.signal).then((enriched) => {
      if (!controller.signal.aborted) setDetails(enriched)
    })
    return () => controller.abort()
  }, [item])

  useEffect(() => {
    if (!item) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      // Trampa de foco: Tab queda dentro de la ficha (dialogo modal).
      if (event.key !== 'Tab') return
      const dialog = dialogRef.current
      if (!dialog) return
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((node) => node.getAttribute('aria-hidden') !== 'true')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (event.shiftKey) {
        if (active === first || active === dialog) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [item, onClose])

  /**
   * Ciclo de vida del foco: al abrir entra al dialogo y al cerrar vuelve al
   * elemento que lo abrió (carta, botón del héroe…). Sin esto, el teclado
   * quedaria perdido en `<body>`.
   */
  useEffect(() => {
    if (!item) return
    const previous =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialogRef.current?.focus({ preventScroll: true })
    return () => previous?.focus({ preventScroll: true })
  }, [item])

  const title = item?.title ?? ''
  const media = details ?? item
  const house = HOUSES.find((entry) => entry.id === (media?.house ?? 'gryffindor')) ?? HOUSES[0]
  const accent = house.accent
  const duration = media ? formatDuration(media.durationMinutes) : ''
  const tmdbLink = media ? tmdbUrl(media) : null

  return (
    <>
    <AnimatePresence>
      {item && media && (
        <motion.div
          key="magic-modal"
          ref={dialogRef}
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/90 p-4 outline-none backdrop-blur-sm sm:p-6 lg:p-8"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={'Ficha de ' + title}
        >
          <motion.article
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="parchment speaking-frame relative w-full max-w-5xl overflow-hidden rounded-2xl"
          >
            {/* ---- Acento de color de la casa en la parte superior ---- */}
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{
                background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
              }}
            />

            {/* Boton de cierre */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ficha"
              className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-full border-2 border-gold/50 bg-night/95 text-gold-light shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-gold hover:bg-gold hover:text-night hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]"
            >
              <X className="h-5 w-5" />
            </button>

            {/* ---------- Reproductor de trailer ---------- */}
            <TrailerPlayer item={item} videoKey={trailerKey} loading={trailerLoading} accent={accent} />

            <div className="px-6 pb-10 pt-7 sm:px-8 lg:px-10">
              {/* Titulo y lema */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Casa badge */}
                  <span
                    className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-display text-[0.6rem] font-bold uppercase tracking-[0.26em]"
                    style={{ borderColor: accent + '80', color: accent, background: 'rgba(8,9,15,0.8)' }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                    {house.sigil} Casa {house.name}
                  </span>

                  <h2 className="glow-effect font-display text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                    {title}
                  </h2>
                  {media.tagline && (
                    <p className="mt-2 font-display text-sm italic text-gold/85">
                      «{media.tagline}»
                    </p>
                  )}
                </div>

                {/* Guardar en Mi Lista */}
                <button
                  type="button"
                  onClick={(event) => {
                    onToggleSave(item)
                    // Chispas doradas + bump del contador (bus, sin setState).
                    burstFromElement(event.currentTarget, saved ? 12 : 26)
                    emitListUpdate({ saved: !saved })
                  }}
                  aria-pressed={saved}
                  className={
                    'flex shrink-0 items-center gap-2 rounded-lg border-2 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-all duration-300 ' +
                    (saved
                      ? 'border-gold bg-gold text-night shadow-[0_0_20px_rgba(255,215,0,0.4)]'
                      : 'border-gold/60 text-gold-light hover:bg-gold/15 hover:border-gold')
                  }
                >
                  {saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {saved ? 'En Mi Lista' : 'Añadir a Mi Lista'}
                </button>
              </div>

              {/* Metadatos: puntuación, año, duración, tipo */}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm font-medium text-vellum">
                {/* Valoración en Galeones */}
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="text-lg font-black text-gold-light">{media.score.toFixed(1)}</span>
                  <span className="text-vellum/70 text-xs">Galeones de Oro</span>
                </span>

                {media.year > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gold/75" />
                    <span className="tabular-nums">{media.year}</span>
                  </span>
                )}
                {duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gold/75" />
                    {duration}
                  </span>
                )}
                <span className="rounded border border-gold/40 px-2 py-0.5 font-semibold text-vellum text-xs">
                  {media.mediaType === 'tv' ? 'Serie' : 'Película'}
                </span>
                {media.seasons && (
                  <span className="text-vellum/80 text-xs">{media.seasons} temporadas</span>
                )}
              </div>

              {/* Sinopsis en pergamino: fondo oscuro, texto claro garantizado */}
              <div className="synopsis-box mt-7 rounded-xl p-5">
                <h3 className="mb-3 font-display text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gold">
                  ✦ Sinopsis
                </h3>
                <p className="text-sm leading-relaxed text-vellum">{media.synopsis}</p>
              </div>

              {/* Etiquetas de género */}
              {media.genres.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {media.genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-gold/35 bg-gold/8 px-3 py-1 text-[0.7rem] font-semibold text-gold-light backdrop-blur-sm"
                      style={{ background: `${accent}15`, borderColor: `${accent}50` }}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Reparto */}
              {media.cast.length > 0 && (
                <div className="mt-7">
                  <h3 className="mb-3 font-display text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gold">
                    ✦ Reparto
                  </h3>
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {media.cast.map((member) => (
                      <li
                        key={member.name + member.character}
                        className="flex items-baseline gap-2 rounded-lg border border-gold/18 bg-ink/80 px-3 py-2.5 backdrop-blur-sm"
                      >
                        <span className="font-display text-sm font-bold text-white">
                          {member.name}
                        </span>
                        <span className="text-xs text-vellum/55">como</span>
                        <span className="truncate text-xs font-medium italic text-gold">
                          {member.character}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botón principal Ver Tráiler + enlaces externos */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {trailerKey && (
                  <>
                    <motion.a
                      href={youtubeWatchUrl(trailerKey)}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      className="relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-gold px-5 py-2.5 font-display text-[0.7rem] font-bold uppercase tracking-wider text-night shadow-[0_0_30px_-6px_rgba(255,215,0,0.8)] transition-shadow hover:shadow-[0_0_40px_-4px_rgba(255,215,0,1)]"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 hover:translate-x-full" />
                      <Play className="h-4 w-4 fill-night relative z-10" />
                      <span className="relative z-10">Ver en YouTube</span>
                    </motion.a>
                  </>
                )}
                {tmdbLink && (
                  <a
                    href={tmdbLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-vellum/25 px-4 py-2.5 font-display text-[0.7rem] font-bold uppercase tracking-wider text-vellum transition-all hover:border-gold hover:text-gold-light"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ficha en TMDB
                  </a>
                )}
                {!hasApiKey && (
                  <span className="text-[0.68rem] text-vellum/50">
                    Modo demo: datos del catálogo local de respaldo.
                  </span>
                )}
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>

    {/*
      ============ APERTURA FLIP: la carta "se abre" hasta ser la ficha ============
      Un clon de la carta vuela desde su rectangulo original hasta el area del
      reproductor y se disuelve al aterrizar, mientras la ficha aparece debajo.
      Resultado: no hay pantalla negra ni salto seco entre carta y modal.
      En el cierre el clon vuelve a su carta (mismo recorrido, al reves).
    */}
    <AnimatePresence>
      {item && origin && portalTarget && !reduceMotion && (
        <motion.div
          key={'card-open-portal-' + item.id}
          aria-hidden="true"
          className="pointer-events-none fixed z-[210] overflow-hidden rounded-xl"
          initial={{
            top: origin.top,
            left: origin.left,
            width: origin.width,
            height: origin.height,
            opacity: 1,
          }}
          animate={{
            top: portalTarget.top,
            left: portalTarget.left,
            width: portalTarget.width,
            height: portalTarget.height,
            // Opaca durante la primera mitad del vuelo y se disuelve en la
            // segunda, cuando el reproductor ya esta montado debajo.
            opacity: [1, 1, 0],
          }}
          exit={{
            top: origin.top,
            left: origin.left,
            width: origin.width,
            height: origin.height,
            opacity: 1,
          }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
          style={{
            boxShadow: '0 0 0 2px rgba(255,215,0,0.55), 0 30px 80px -20px rgba(0,0,0,0.9)',
          }}
        >
          <img src={item.poster} alt="" className="h-full w-full object-cover" />
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
