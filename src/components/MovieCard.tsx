import { memo, useRef, useState } from 'react'
import { Check, Play, Plus, Star } from 'lucide-react'
import type { MediaItem } from '../types/tmdb'
import { HOUSES, PLACEHOLDER_IMAGE } from '../services/tmdb'
import { burstFromElement, emitListUpdate } from '../lib/magicFx'
import { preloadMagicModal } from '../lib/preloadModal'

interface MovieCardProps {
  item: MediaItem
  index: number
  /**
   * Abre el modal. `origin` es el rectangulo de la carta en el momento del
   * clic: MagicModal lo usa para animar la apertura FLIP (la carta "se abre"
   * y se convierte en la ficha) en lugar de un salto seco.
   */
  onSelect: (item: MediaItem, origin?: DOMRect) => void
  /** Si el titulo esta en "Mi Lista de Hechizos". */
  saved: boolean
  onToggleSave: (item: MediaItem) => void
}

/**
 * MovieCard V4.0 — Cromo de Hogwarts Grande con Efecto Revelio 3D.
 *
 * ESTADO REPOSO: pergamino oscuro con filigrana dorada, sello de cera en
 * relieve y título gótico. Dimensiones mínimas 240×360px.
 *
 * HOVER / REVELIO: flip 3D suave (CSS transform-style: preserve-3d) que
 * revela el poster HD de TMDB. La cara delantera y trasera son elementos
 * independientes con backface-visibility: hidden, de modo que el navegador
 * resuelve el giro en su propia capa compuesta (GPU) sin re-renderizar React.
 *
 * TÁCTIL: el primer toque revela, el segundo abre el modal.
 */
function MovieCard({ item, index, onSelect, saved, onToggleSave }: MovieCardProps) {
  // En táctil no existe CSS :hover, así que necesitamos estado.
  const [revealedByTouch, setRevealedByTouch] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)
  const touchRevealed = useRef(false)

  const accent = HOUSES.find((house) => house.id === item.house)?.accent ?? '#ffd75e'

  /**
   * En táctil: primer toque revela, segundo toque abre el modal.
   * Se usa desde el boton de apertura (cara delantera) y desde el envoltorio
   * (zonas no interactivas del cromo), por eso accepta cualquier elemento y
   * frena la propagacion para no dispararse dos veces.
   */
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()

    const isTouch =
      typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

    if (isTouch && !touchRevealed.current) {
      touchRevealed.current = true
      setRevealedByTouch(true)
      // Destello de luz dorada Revelio
      setIsFlashing(true)
      window.setTimeout(() => setIsFlashing(false), 600)
      return
    }
    // Rectangulo de origen para la animacion de apertura FLIP del modal.
    // (Tambien se captura con teclado: event.detail===0 no bloquea Enter.)
    onSelect(item, event.currentTarget.getBoundingClientRect())
  }

  /**
   * Poster responsivo: solo para URLs de TMDB (los respaldos locales son
   * data-URI y no necesitan variantes). En pantallas de alta densidad se
   * pide el de 500px, que es lo que ocupa la carta en un Retina/4K.
   */
  const posterSrcSet = item.poster.includes('/w342/')
    ? item.poster.replace('/w342/', '/w500/') + ' 500w, ' + item.poster + ' 342w'
    : undefined

  const touched = revealedByTouch

  return (
    /*
      Envoltorio del cromo (3D scene + estado hover).
      YA NO es un <button>: contiene los controles "Lumos" y "Mi Lista", que
      ahora son <button> hermanos dentro de cada cara (anidar HTML interactivo
      dentro de un boton es HTML invalido y dispara avisos). El acceso por
      teclado lo aporta el boton de apertura de la cara delantera; este
      contenedor solo complementa el clic con el raton en zonas decorativas.
    */
    <div
      onClick={handleClick}
      /* Precarga el chunk de la ficha al apuntar: la animacion FLIP nunca
         tendra que esperar a la red en el primer clic. */
      onPointerEnter={preloadMagicModal}
      className="cromo-enter cromo-scene group relative block shrink-0 overflow-hidden rounded-xl text-left outline-none"
      style={{
        animationDelay: Math.min(index * 0.055, 0.44) + 's',
        /* Tamaño mínimo garantizado por el prompt V4.0 */
        width: '240px',
        height: '360px',
        transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = 'scale(1.05) translateY(-4px)'
        el.style.boxShadow = `0 20px 60px -12px rgba(0,0,0,0.9), 0 0 0 2px ${accent}66, 0 0 40px -8px ${accent}55`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = ''
        el.style.boxShadow = ''
      }}
    >
      {/* ======== FLIP CONTAINER ======== */}
      <div
        className="card-flipper"
        style={{
          transform: touched ? 'rotateY(180deg)' : '',
        }}
      >
        {/* ====== CARA DELANTERA: CROMO DE HOGWARTS ====== */}
        <div className="card-face card-face-front cromo-frame cromo-corner absolute inset-0 rounded-xl">
          {/* Fondo de pergamino oscuro con textura */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background:
                'radial-gradient(ellipse at 50% 28%, rgba(255,215,0,0.12) 0%, transparent 58%),' +
                'repeating-linear-gradient(48deg, rgba(255,215,0,0.022) 0px, rgba(255,215,0,0.022) 1px, transparent 1px, transparent 5px),' +
                'linear-gradient(160deg, #241d13 0%, #1c1917 45%, #14110d 100%)',
            }}
          />

          {/* Ornamentos de filigrana en las 4 esquinas adicionales (inferior izq y sup der) */}
          <span
            className="pointer-events-none absolute left-2 top-2 h-8 w-8 border-l-2 border-t-2 border-gold/80"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute right-2 bottom-2 h-8 w-8 border-r-2 border-b-2 border-gold/80"
            aria-hidden="true"
          />

          {/* Centro: sello de cera con sigilo de la casa */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            {/* Sello de cera con runas orbitando */}
            <div className="relative flex flex-col items-center">
              <div
                className="wax-seal animate-gold-pulse relative flex h-24 w-24 items-center justify-center rounded-full"
                style={{
                  boxShadow: `inset 0 3px 8px rgba(255,255,255,0.25), inset 0 -5px 12px rgba(0,0,0,0.6), 0 6px 20px ${accent}66`,
                }}
              >
                {/* Runas orbitando */}
                <span
                  className="animate-rune-glow pointer-events-none absolute font-display text-[0.8rem] leading-none"
                  style={{ color: accent, opacity: 0.8 }}
                >
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2">ᚠ</span>
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2">ᚱ</span>
                  <span className="absolute left-[-14px] top-1/2 -translate-y-1/2">ᛉ</span>
                  <span className="absolute right-[-14px] top-1/2 -translate-y-1/2">ᛟ</span>
                </span>
                {/* Sigilo de la casa */}
                <span className="text-4xl drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" aria-hidden="true">
                  {item.sigil ?? '✦'}
                </span>
              </div>

              {/* Nombre de la casa */}
              <span
                className="mt-3 font-display text-[0.62rem] font-bold uppercase tracking-[0.32em]"
                style={{ color: accent }}
              >
                {item.house}
              </span>
            </div>

            {/* Separador dorado */}
            <div
              className="w-16 border-t"
              style={{ borderColor: accent + '60' }}
            />

            {/* Etiqueta "Revelio" */}
            <span className="font-display text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-gold/70">
              ✦ Revelio ✦
            </span>
          </div>

          {/* Placa de pergamino con el título en la parte inferior */}
          <div className="absolute inset-x-3 bottom-3 rounded-lg border border-gold/50 bg-[#1a1510]/95 px-3 py-3 text-center shadow-[0_-4px_20px_rgba(0,0,0,0.8)]">
            <h3 className="line-clamp-2 font-display text-[0.78rem] font-bold leading-snug text-gold-light">
              {item.title}
            </h3>
            <div className="mt-1.5 flex items-center justify-center gap-2 text-[0.62rem]">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-gold text-gold" />
                <span className="font-bold text-gold-light">{item.score.toFixed(1)}</span>
              </span>
              {item.year > 0 && (
                <span className="text-vellum/70 tabular-nums">{item.year}</span>
              )}
            </div>
          </div>

          {/* Botón de apertura: contenido vacio y hermano del resto del cromo
              (HTML valido, nombre accesible explicito, foco visible). */}
          <button
            type="button"
            onClick={handleClick}
            aria-label={'Ver ficha de ' + item.title}
            className="absolute inset-0 z-20 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
          />
        </div>

        {/* ====== CARA TRASERA: POSTER HD DE TMDB ====== */}
        <div className="card-face card-face-back rounded-xl overflow-hidden">
          {/* Poster de TMDB */}
          <img
            src={item.poster}
            srcSet={posterSrcSet}
            sizes="240px"
            alt={'Poster de ' + item.title}
            loading="lazy"
            decoding="async"
            className="gpu h-full w-full object-cover"
            style={{ transform: 'scale(1.02)' }}
            onError={(event) => {
              // Respaldo sin 404 visibles: data-URI una sola vez (sin bucles).
              const image = event.currentTarget
              if (image.dataset.fallback === '1') return
              image.dataset.fallback = '1'
              image.src = PLACEHOLDER_IMAGE
            }}
          />

          {/* Velo inferior para contraste del texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent" />

          {/* Destello dorado del Revelio */}
          <div
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{
              background: `radial-gradient(ellipse at 50% 30%, ${accent}33, transparent 65%)`,
            }}
            aria-hidden="true"
          />

          {/* Badge de TOP / novedad */}
          {item.badge && (
            <span
              className="absolute left-2.5 top-2.5 z-30 rounded border px-2 py-0.5 font-display text-[0.58rem] font-bold uppercase tracking-[0.18em]"
              style={{
                borderColor: accent + '99',
                background: 'rgba(8,9,15,0.92)',
                color: accent,
              }}
            >
              {item.badge}
            </span>
          )}

          {/* Indicador pelicula / serie */}
          <span className="absolute right-2.5 top-2.5 z-30 rounded bg-night/90 px-1.5 py-0.5 font-display text-[0.52rem] font-bold uppercase tracking-widest text-vellum/90">
            {item.mediaType === 'tv' ? 'Serie' : 'Peli'}
          </span>

          {/* Información inferior */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-3.5">
            <h3 className="line-clamp-2 font-display text-[0.85rem] font-bold leading-tight text-gold-light drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">
              {item.title}
            </h3>

            <div className="mt-1.5 flex items-center justify-between gap-2 text-[0.65rem] text-vellum">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-gold text-gold" />
                <span className="font-bold text-gold-light">{item.score.toFixed(1)}</span>
                <span className="text-vellum/60">Galeones</span>
              </span>
              <span className="tabular-nums text-vellum/75">
                {item.year > 0 ? item.year : '—'}
              </span>
            </div>

            {/* Acciones — visibles al revelar */}
            <div className="mt-2.5 flex items-center gap-2">
              {/* Botón principal Ver / Lumos (hermano valido, no anidado) */}
              <button
                type="button"
                className="relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-lg px-3 py-2 font-display text-[0.65rem] font-bold uppercase tracking-wider text-night shadow-[0_4px_20px_-4px_rgba(255,215,0,0.7)] outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 focus-visible:ring-offset-night"
                style={{ background: accent }}
                onClick={(event) => {
                  event.stopPropagation()
                  // Rectangulo de origen para la animacion FLIP del modal.
                  onSelect(item, event.currentTarget.getBoundingClientRect())
                }}
                aria-label={'Ver tráiler de ' + item.title}
              >
                {/* Barrido de luz Lumos */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Play className="h-3.5 w-3.5 fill-night relative z-10" />
                <span className="relative z-10">Lumos</span>
              </button>

              {/* Guardar en Mi Lista (hermano valido, no anidado) */}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleSave(item)
                  // Micro-interaccion: explosión de chispas + bump del
                  // contador del navbar, ambos por bus tipado (sin setState).
                  burstFromElement(event.currentTarget, saved ? 12 : 26)
                  emitListUpdate({ saved: !saved })
                }}
                aria-pressed={saved}
                title={saved ? 'Quitar de Mi Lista' : 'Añadir a Mi Lista'}
                aria-label={saved ? 'Quitar de Mi Lista' : 'Añadir a Mi Lista'}
                className={
                  'flex cursor-pointer items-center justify-center rounded-lg border-2 px-2.5 py-2 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-gold ' +
                  (saved
                    ? 'border-gold bg-gold text-night'
                    : 'border-gold/60 bg-night/85 text-white hover:border-gold hover:bg-gold/20')
                }
              >
                {saved ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Borde inferior con el color de la casa */}
          <span
            className="absolute inset-x-0 bottom-0 z-30 h-0.5"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            }}
            aria-hidden="true"
          />

          {/* Aro de destello en el borde */}
          <span
            className="revelio-glow pointer-events-none absolute inset-0 rounded-xl"
            style={{ boxShadow: `inset 0 0 0 1px ${accent}50` }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Destello blanco del flash Revelio (capa separada, no forma parte del flip) */}
      {isFlashing && (
        <span
          className="revelio-flash pointer-events-none absolute inset-0 z-50 rounded-xl"
          style={{ background: `radial-gradient(ellipse at 50% 40%, ${accent}cc, transparent 70%)` }}
          aria-hidden="true"
        />
      )}

      {/* Destello del Revelio al pasar el puntero (siempre montado, en reposo invisible) */}
      <span
        className="revelio-flash-hover pointer-events-none absolute inset-0 z-40 rounded-xl"
        style={{ background: `radial-gradient(ellipse at 50% 40%, ${accent}cc, transparent 70%)` }}
        aria-hidden="true"
      />
    </div>
  )
}

export default memo(MovieCard)