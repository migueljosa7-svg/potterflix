import { memo, useRef, useState } from 'react'
import { Eye, Play, Star } from 'lucide-react'
import type { Movie } from '../types'
import { HOUSE_ACCENTS } from '../data/mockMovies'
import { posterFor } from '../data/filmArt'

interface MovieCardProps {
  movie: Movie
  index: number
  onSelect: (movie: Movie) => void
}

/**
 * MovieCard - Cromo de Hogwarts.
 *
 * ESTADO OCULTO: pergamino oscuro con filigrana dorada tallada, esquinas
 * ornamentadas y un sello de cera en relieve con runas que brillan.
 * ESTADO REVELADO: al pasar la varita por encima, la carta emite un destello
 * dorado, el sello se disipa y aparece el poster a alta calidad.
 *
 * RENDIMIENTO: el hechizo Revelio se resuelve con CSS `:hover` / `:focus-visible`
 * mediante el grupo `group`, NO con `onMouseEnter` + `setState`. Antes, cada
 * paso del raton provocaba un renderizado completo de la tarjeta; ahora el
 * navegador resuelve el efecto en su propia capa compuesta y React no vuelve
 * a renderizar. El unico estado que queda es el toque en tactil.
 */
function MovieCard({ movie, index, onSelect }: MovieCardProps) {
  // Solo se usa en tactil, donde no existe el hover de CSS.
  const [revealedByTouch, setRevealedByTouch] = useState(false)
  const touchRevealed = useRef(false)

  const accent = HOUSE_ACCENTS[movie.house]
  const poster = posterFor(movie)

  /** En tactil el primer toque revela y el segundo abre el modal. */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) return

    const isTouch =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches

    if (isTouch && !touchRevealed.current) {
      touchRevealed.current = true
      setRevealedByTouch(true)
      return
    }
    onSelect(movie)
  }

  // En tactil la carta queda revelada para siempre tras el primer toque.
  const touched = revealedByTouch

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={'Ver ' + movie.title}
      className="cromo-enter group relative block aspect-[2/3] w-full shrink-0 overflow-hidden rounded-lg text-left outline-none transition-transform duration-500 ease-out hover:scale-[1.045] focus-visible:scale-[1.045]"
      style={{ animationDelay: Math.min(index * 0.05, 0.4) + 's' }}
    >
      {/* ============ ESTADO OCULTO: CROMO DE HOGWARTS ============ */}
      <div
        className="cromo-frame cromo-corner absolute inset-0 transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0"
        style={{ opacity: touched ? 0 : 1 }}
        aria-hidden="true"
      >
        {/* Pergamino oscuro con textura */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 32%, rgba(255,215,0,0.10) 0%, transparent 55%),' +
              'repeating-linear-gradient(48deg, rgba(255,215,0,0.028) 0px, rgba(255,215,0,0.028) 1px, transparent 1px, transparent 5px),' +
              'linear-gradient(160deg, #221c14 0%, #1c1917 45%, #14110d 100%)',
          }}
        />

        {/* Sello de cera de Hogwarts en relieve, con runas encendidas */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="wax-seal relative flex h-20 w-20 items-center justify-center rounded-full">
            {/* Runas magicas alrededor del sello */}
            <span className="animate-rune-glow absolute -inset-3 font-display text-[0.7rem] leading-none text-gold/70">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2">ᚠ</span>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2">ᚱ</span>
              <span className="absolute left-0 top-1/2 -translate-y-1/2">ᛉ</span>
              <span className="absolute right-0 top-1/2 -translate-y-1/2">ᛟ</span>
            </span>
            <span className="font-display text-2xl font-black text-amber-50 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
              H
            </span>
          </div>

          <span className="font-display text-[0.55rem] font-semibold uppercase tracking-[0.28em] text-gold/85">
            Revelio
          </span>
        </div>

        {/* Placa de pergamino con el titulo */}
        <div className="absolute inset-x-2 bottom-2 rounded border border-gold/45 bg-[#1a1510]/92 px-2 py-2 text-center">
          <h3 className="line-clamp-2 font-display text-[0.72rem] font-bold leading-tight text-gold-light">
            {movie.title}
          </h3>
        </div>
      </div>

      {/* ============ ESTADO REVELADO: POSTER ============ */}
      <div
        className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ opacity: touched ? 1 : 0 }}
      >
        <img
          src={poster}
          alt={'Poster de ' + movie.title}
          loading="lazy"
          decoding="async"
          className="gpu h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Velo inferior para que el texto siempre tenga contraste */}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-night/10" />
      </div>

      {/* Badge de la casa / novedad: siempre con fondo opaco y texto claro. */}
      {movie.badge && (
        <span
          className="absolute left-2.5 top-2.5 z-30 rounded-sm border px-2 py-0.5 font-display text-[0.55rem] font-bold uppercase tracking-[0.18em]"
          style={{
            borderColor: accent + '99',
            background: 'rgba(8,9,15,0.9)',
            color: accent,
          }}
        >
          {movie.badge}
        </span>
      )}

      {/* Ficha inferior: titulo en oro claro y metadatos en vellum */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-3">
        <h3 className="line-clamp-2 font-display text-[0.8rem] font-bold leading-tight text-gold-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
          {movie.title}
        </h3>

        <div className="mt-1.5 flex items-center justify-between gap-2 text-[0.62rem] text-vellum">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="font-semibold text-gold-light">{movie.score.toFixed(1)}</span>
          </span>
          <span className="tabular-nums text-vellum/85">
            {movie.year} · {movie.rating}
          </span>
        </div>

        {/* Acciones que se iluminan al revelar */}
        <div className="mt-2 flex gap-1.5 opacity-0 transition-all duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex flex-1 items-center justify-center gap-1 rounded bg-gold px-2 py-1.5 font-display text-[0.6rem] font-bold uppercase tracking-wider text-night">
            <Play className="h-3 w-3 fill-night" />
            Ver
          </span>
          <span
            className="flex items-center justify-center rounded border border-gold/70 bg-night/85 px-2.5 py-1.5 font-display text-[0.6rem] font-bold uppercase tracking-wider text-white"
            title={'Ver información de ' + movie.title}
          >
            <Eye className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Borde inferior con el color de la casa */}
      <span
        className="absolute inset-x-0 bottom-0 z-30 h-0.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'linear-gradient(90deg, transparent, ' + accent + ', transparent)' }}
        aria-hidden="true"
      />

      </button>
  )
}

export default memo(MovieCard)
