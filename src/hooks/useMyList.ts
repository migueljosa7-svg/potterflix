import { useCallback, useEffect, useState } from 'react'
import type { MediaItem } from '../types/tmdb'

/** Clave de almacenamiento de la lista local. */
const STORAGE_KEY = 'potterflix:my-list'

/**
 * useMyList - "Mi Lista de Hechizos": favoritos guardados en localStorage.
 *
 * Guarda solo las claves (`mediaType-tmdbId`), no los objetos completos, para
 * no llenar el almacenamiento del navegador con metadatos que pueden quedar
 * obsoletos. La lista de objetos vive en memoria mientras la app esta abierta.
 */
export function useMyList() {
  const [ids, setIds] = useState<string[]>([])
  const [items, setItems] = useState<MediaItem[]>([])

  // Restaura las claves guardadas al montar.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setIds(JSON.parse(raw))
    } catch {
      // Almacenamiento corrupto o bloqueado: se empieza con la lista vacia.
    }
  }, [])

  const persist = useCallback((next: string[]) => {
    setIds(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Modo privado o cuota llena: la lista sigue viva en memoria.
    }
  }, [])

  /** Añade o quita un titulo y devuelve si ha quedado guardado. */
  const toggle = useCallback(
    (item: MediaItem) => {
      const already = ids.includes(item.id)
      persist(already ? ids.filter((id) => id !== item.id) : [...ids, item.id])
      return !already
    },
    [ids, persist],
  )

  const isSaved = useCallback((id: string) => ids.includes(id), [ids])

  /**
   * Conserva los objetos completos de los ids guardados. Se recalcula cuando
   * cambia la lista o cuando llegan titulos nuevos del catalogo.
   */
  const sync = useCallback((catalog: MediaItem[]) => {
    setItems(catalog.filter((item) => ids.includes(item.id)))
  }, [ids])

  const clear = useCallback(() => persist([]), [persist])

  return { ids, items, sync, toggle, isSaved, clear, count: ids.length }
}