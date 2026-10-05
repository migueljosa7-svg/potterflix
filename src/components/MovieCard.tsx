import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, Plus, Star } from 'lucide-react'
import type { Movie } from '../types'
import { HOUSE_COLORS } from '../data/mockMovies'

interface MovieCardProps {
  movie: Movie
  index: number
  onSelect: (movie: Movie) => void
}

/**
 * MovieCard - Tarjeta velada tras un sello de cera magica que se disipa con el
 * hechizo Revelio cuando la varita pasa sobre ella (hover o primer toque).
 */
export default function MovieCard({ movie, index, onSelect }: MovieCardProps) {
  const [revealed, setRevealed] = useState(false)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const rippleId = useRef(0)
  const touchRevealed = useRef(false)

  const accent = HOUSE_COLORS[movie.house]

  /** Lanza el pulso de hechizo desde un punto de la tarjeta y la revela. */
  const castRevelio = (clientX: number, clientY: number, bounds: DOMRect) => {
    const id = rippleId.current
    rippleId.current += 1

    setRipples((prev) => [
      ...prev,
      { id: id, x: clientX - bounds.left, y: clientY - bounds.top },
    ])
    setRevealed(true)

    window.setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id))
    }, 1100)
  }

  /** El toque tactil revela la tarjeta antes de que llegue el click. */
  const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    const touch = event.touches[0]
    if (!touch) return
    castRevelio(touch.clientX, touch.clientY, event.currentTarget.getBoundingClientRect())
  }

  /** En tactil el primer toque revela, el segundo abre el modal. */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) return
    const isTouch =
      typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

    if (isTouch && !touchRevealed.current) {
      touchRevealed.current = true
      castRevelio(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect())
      return
    }
    onSelect(movie)
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => {
        if (!touchRevealed.current) setRevealed(false)
      }}
      onTouchStart={handleTouchStart}
      initial={{ opacity: 0, y: 40, rotateX: -12 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
      aria-label={'Revelar ' + movie.title}
      className="group relative block aspect-[2/3] w-full shrink-0 overflow-hidden rounded-lg border border-gold/20 bg-ink text-left transition-shadow duration-500 hover:border-gold/60 hover:shadow-[0_0_38px_-6px_rgba(212,175,55,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      {/* Pulso de hechizo al tocar la tarjeta */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="spell-ripple pointer-events-none absolute z-30 h-40 w-40 rounded-full"
          style={{
            left: ripple.x - 80,
            top: ripple.y - 80,
            background:
              'radial-gradient(circle, rgba(255,243,196,0.75) 0%, rgba(212,175,55,0.35) 45%, rgba(212,175,55,0) 70%)',
          }}
        />
      ))}

      {/* Póster real, difuminado mientras esta velado */}
      <img
        src={movie.poster}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
        style={{ filter: revealed ? 'blur(0px) saturate(1.1)' : 'blur(7px) saturate(0.5) brightness(0.6)' }}
      />

      {/* Gradiente inferior para legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/35 to-transparent opacity-90" />

      {/* Niebla magica: se disipa con el Revelio */}
      <AnimatePresence>
        {!revealed && (
          <motion.div
            key="fog"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.15, filter: 'blur(14px)' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="magic-fog absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-4"
          >
            <span className="text-3xl opacity-70">✦</span>
            <span className="font-display text-[0.6rem] uppercase tracking-[0.3em] text-parchment/70">
              Revelio
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sello de cera de Hogwarts */}
      <AnimatePresence>
        {!revealed && (
          <motion.div
            key="seal"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.9, rotate: 25 }}
            transition={{ duration: 0.45 }}
            className="wax-seal pointer-events-none absolute left-1/2 top-1/2 z-30 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          >
            <span className="font-display text-[0.5rem] font-bold uppercase tracking-widest text-amber-50/80">
              H
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge de la casa / novedad */}
      {movie.badge && (
        <span className="absolute left-2.5 top-2.5 z-30 rounded-sm border border-gold/50 bg-night/85 px-2 py-0.5 font-display text-[0.55rem] uppercase tracking-[0.18em] text-gold">
          {movie.badge}
        </span>
      )}

      {/* Franja inferior: titulo en oro y puntuacion en galeones */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-3">
        <h3
          className="glow-effect line-clamp-2 font-display text-[0.82rem] font-semibold leading-tight"
          style={{ color: accent }}
        >
          {movie.title}
        </h3>

        <div className="mt-1.5 flex items-center justify-between gap-2 text-[0.6rem] text-parchment/70">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="font-semibold text-gold-light">{movie.score.toFixed(1)}</span>
            <span className="hidden sm:inline">Galeones</span>
          </span>
          <span className="tabular-nums">
            {movie.year} · {movie.rating}
          </span>
        </div>

        {/* Acciones que aparecen al revelar */}
        <div className="mt-2.5 flex gap-1.5 overflow-hidden transition-all duration-500"
          style={{ maxHeight: revealed ? 40 : 0, opacity: revealed ? 1 : 0 }}
        >
          <span className="flex flex-1 items-center justify-center gap-1 rounded bg-gold/90 py-1.5 font-display text-[0.6rem] font-bold uppercase tracking-wider text-night">
            <PlayIcon />
            Ver
          </span>
          <span
            className="flex items-center justify-center gap-1 rounded border border-parchment/40 bg-night/70 px-2.5 py-1.5 font-display text-[0.6rem] font-bold uppercase tracking-wider text-parchment"
            title="Mas informacion"
          >
            <Eye className="h-3 w-3" />
          </span>
          <span
            className="flex items-center justify-center gap-1 rounded border border-parchment/40 bg-night/70 px-2.5 py-1.5 font-display text-[0.6rem] font-bold uppercase tracking-wider text-parchment"
            title="Anadir a mi lista"
          >
            <Plus className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Borde inferior con el color de la casa */}
      <span
        className="absolute inset-x-0 bottom-0 z-30 h-0.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'linear-gradient(90deg, transparent, ' + accent + ', transparent)' }}
      />
    </motion.button>
  )
}

/** Icono de reproduccion minimo, dibujado en SVG para no depender de mas libs. */
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
