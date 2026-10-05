/**
 * Precarga perezosa del chunk de la ficha (`MagicModal`).
 *
 * El modal se importa con `React.lazy` para sacarlo del bundle inicial, pero
 * la animacion FLIP no puede esperar a descargar un chunk en el primer clic:
 * por eso el chunk se invoca (una sola vez) en el primer ocio del navegador
 * y, ademas, al pasar el puntero sobre una carta.
 *
 * La promesa se memoiza; si la red falla se limpia para poder reintentar.
 */
type MagicModalModule = typeof import('../components/MagicModal')

let chunk: Promise<MagicModalModule> | null = null

/** Importa (una sola vez) el chunk del modal. */
export function loadMagicModal(): Promise<MagicModalModule> {
  if (!chunk) {
    chunk = import('../components/MagicModal').catch((error: unknown) => {
      chunk = null
      throw error
    })
  }
  return chunk
}

/** Dispara la descarga en segundo plano sin esperar al resultado. */
export function preloadMagicModal(): void {
  void loadMagicModal()
}
