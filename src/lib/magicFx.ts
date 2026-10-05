/**
 * magicFx - Bus tipado de micro-interacciones (efectos de interfaz).
 *
 * Comunica eventos UI entre componentes SIN pasar por el estado de React:
 *  - `sparks` → explosión de chispas en unas coordenadas de viewport.
 *  - `list`   → se ha guardado/quitado un título de "Mi Lista" (bump Navbar).
 *
 * Los suscriptores actúan de forma imperativa (canvas con `requestAnimationFrame`
 * y Web Animations API), asi que ningun `setState` provoca re-renders en cadena:
 * el bus es O(1) y vive fuera del ciclo de render.
 */

/** Explosión de chispas en coordenadas de viewport. */
export interface SparkBurst {
  /** Coordenada X en viewport (px). */
  x: number
  /** Coordenada Y en viewport (px). */
  y: number
  /** Nº de partículas. Se recomienda ~26 al guardar y ~12 al quitar. */
  count: number
}

/** Cambio en "Mi Lista de Hechizos". */
export interface ListUpdate {
  /** `true` si el título acaba de guardarse; `false` si se quitó. */
  saved: boolean
}

type SparkListener = (burst: SparkBurst) => void
type ListListener = (update: ListUpdate) => void

const sparkListeners = new Set<SparkListener>()
const listListeners = new Set<ListListener>()

/** Suscribe un observador de explosiones; devuelve la función de baja. */
export function onSparkBurst(listener: SparkListener): () => void {
  sparkListeners.add(listener)
  return () => sparkListeners.delete(listener)
}

/** Emite una explosión de chispas a todos los observadores. */
export function emitSparkBurst(burst: SparkBurst): void {
  sparkListeners.forEach((listener) => listener(burst))
}

/** Suscribe un observador de cambios de "Mi Lista"; devuelve la baja. */
export function onListUpdate(listener: ListListener): () => void {
  listListeners.add(listener)
  return () => listListeners.delete(listener)
}

/** Notifica que la lista ha cambiado (dispara el bump del navbar). */
export function emitListUpdate(update: ListUpdate): void {
  listListeners.forEach((listener) => listener(update))
}

/**
 * Explosión centrada en un elemento (botón de guardar, carta…).
 * Convierte el rectángulo del elemento a coordenadas de viewport en el
 * propio momento del clic, antes de que React repinte.
 */
export function burstFromElement(
  element: Element | null,
  count = 26,
): void {
  if (!element) return
  const rect = element.getBoundingClientRect()
  emitSparkBurst({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    count,
  })
}
