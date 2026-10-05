import { useCallback, useEffect, useRef, useState } from 'react'
import { loadHero, loadRow, resolveTrailer, search as searchApi } from '../services/tmdb'
import type { CategoryId, LoadState, MediaItem, MediaType } from '../types/tmdb'

/**
 * useCatalog - Carga el catalogo de una casa (peliulas o series) y lo mantiene
 * en estado.
 *
 * Todas las peticiones usan un `AbortController`: si el usuario cambia de casa o
 * de pestana antes de que responda la red, la peticion vieja se cancela y su
 * resultado se descarta. Sin esto, las respuestas llegan fuera de orden y la
 * fila muestra peliculas de la casa equivocada.
 */
export function useCatalog(
  category: CategoryId,
  mediaType: MediaType,
  enabled: boolean,
) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [state, setState] = useState<LoadState>('idle')

  useEffect(() => {
    if (!enabled) {
      setItems([])
      return
    }

    const controller = new AbortController()
    let active = true

    setState('loading')
    loadRow(category, mediaType, controller.signal)
      .then((rows) => {
        if (!active) return
        setItems(rows)
        setState('ready')
      })
      .catch(() => {
        // loadRow ya cae al respaldo; solo queda el caso de abort.
        if (!active) return
        setState('error')
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [category, mediaType, enabled])

  return { items, state }
}

/** useHero - Los destacados para el banner principal. */
export function useHero(enabled: boolean) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [state, setState] = useState<LoadState>('idle')

  useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()
    let active = true

    setState('loading')
    loadHero(controller.signal)
      .then((rows) => {
        if (!active) return
        setItems(rows)
        setState('ready')
      })
      .catch(() => {
        if (!active) return
        setState('error')
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [enabled])

  return { items, state }
}

/**
 * useSearch - Buscador magico con debounce de 300 ms.
 *
 * El debounce evita disparar una peticion por pulsación (escribir "harry"
 * generaria 5 peticiones). Ademas se cancela la peticion anterior si el usuario
 * sigue escribiendo, de forma que solo llegue la ultima respuesta.
 */
export function useSearch(delay = 300) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MediaItem[]>([])
  const [state, setState] = useState<LoadState>('idle')

  const timerRef = useRef<number | undefined>(undefined)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    window.clearTimeout(timerRef.current)

    const term = query.trim()
    if (term.length < 2) {
      setResults([])
      setState('idle')
      controllerRef.current?.abort()
      return
    }

    setState('loading')
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    timerRef.current = window.setTimeout(() => {
      searchApi(term, controller.signal)
        .then((items) => {
          if (controller.signal.aborted) return
          setResults(items)
          setState('ready')
        })
        .catch(() => {
          if (controller.signal.aborted) return
          setResults([])
          setState('error')
        })
    }, delay)

    return () => window.clearTimeout(timerRef.current)
  }, [query, delay])

  const clear = useCallback(() => {
    setQuery('')
    setResults([])
    setState('idle')
  }, [])

  return { query, setQuery, results, state, clear }
}

/**
 * useTrailer - Resuelve la clave de YouTube de un item al abrir el modal.
 * Se llama de forma perezosa: no se piden videos mientras se navega.
 */
export function useTrailer(item: MediaItem | null) {
  const [key, setKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!item) {
      setKey(null)
      return
    }

    setKey(item.trailerKey)
    if (item.trailerKey || item.tmdbId === 0) return

    const controller = new AbortController()
    setLoading(true)

    resolveTrailer(item, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setKey(value)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [item])

  return { trailerKey: key, loading }
}