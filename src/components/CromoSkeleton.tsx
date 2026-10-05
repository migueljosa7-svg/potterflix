interface CromoSkeletonProps {
  /** Posicion en la fila/rejilla: desfasa el barrido de luz. */
  index?: number
  /** Clases de tamaño heredadas del contenedor (fila fija o rejilla fluida). */
  className?: string
}

/**
 * CromoSkeleton — Placeholder del "cromo de Hogwarts" mientras TMDB responde.
 *
 * Sustituye al rectangulo generico `animate-pulse`: conserva el marco dorado,
 * las esquinas ornamentadas y el sello de cera del cromo real, de modo que la
 * carga mantiene la identidad visual (nunca se ve un bloque gris).
 *
 * RENDIMIENTO: solo anima `border-color`, `box-shadow`, `transform` y las
 * barras con el shimmer del hero; no re-renderiza React y la regla global
 * `prefers-reduced-motion` deja todo instantaneo.
 */
export default function CromoSkeleton({ index = 0, className = '' }: CromoSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando cromo mágico"
      className={
        'cromo-skeleton cromo-corner relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl ' +
        className
      }
    >
      {/* Sello de cera con filigrana pulsante (mismo tratamiento que la carta) */}
      <span
        className="wax-seal animate-gold-pulse relative flex h-16 w-16 items-center justify-center rounded-full"
        aria-hidden="true"
      >
        <span className="font-display text-xl font-black text-gold-light/75">✦</span>
      </span>

      {/* Lineas de titulo y metadatos con shimmer */}
      <span className="cromo-skeleton-bar mt-4 h-2.5 w-24 rounded-full" aria-hidden="true" />
      <span
        className="cromo-skeleton-bar mt-2 h-2 w-16 rounded-full"
        style={{ animationDelay: '0.25s' }}
        aria-hidden="true"
      />

      {/* Barrido de luz magica escalonado por posicion dentro de la fila */}
      <span
        className="cromo-skeleton-sweep pointer-events-none absolute inset-0"
        style={{ animationDelay: Math.min(index * 0.08, 0.56) + 's' }}
        aria-hidden="true"
      />
    </div>
  )
}
