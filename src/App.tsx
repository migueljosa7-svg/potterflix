import { useCallback, useEffect, useMemo, useState } from 'react'
import CategoryRow from './components/CategoryRow'
import FloatingCandles from './components/FloatingCandles'
import MagicHero from './components/MagicHero'
import MagicModal from './components/MagicModal'
import Navbar from './components/Navbar'
import WandCursor from './components/WandCursor'
import MovieCard from './components/MovieCard'
import { CATEGORIES, HOUSES, hasApiKey } from './services/tmdb'
import { useCatalog, useHero, useSearch } from './hooks/useCatalog'
import { useMyList } from './hooks/useMyList'
import { FALLBACK_CATALOG } from './data/fallbackCatalog'
import type { CategoryId, House, LoadState, MediaItem, MediaType, ViewTab } from './types/tmdb'

/** Casa inicial y clave de almacenamiento de la preferencia del usuario. */
const DEFAULT_HOUSE: House = 'gryffindor'
const HOUSE_STORAGE_KEY = 'potterflix:house'
const VALID_HOUSES: House[] = ['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff']

/**
 * Titulos magicos de las filas, segun el enunciado. Cada una se alimenta de
 * los generos de TMDB mapeados a su casa (ver `HOUSES` en services/tmdb.ts).
 */
const ROW_COPY: Record<CategoryId, string> = {
  gryffindor: 'Encantamientos & Aventura',
  slytherin: 'Artes Oscuras & Misterio',
  ravenclaw: 'Girotiempos & Enigmas',
  hufflepuff: 'Pociones de Amor & Alegría',
}

/** Descripcion de una fila: lema magico + generos de TMDB que la alimentan. */
const rowDescription = (category: CategoryId): string => {
  const house = HOUSES.find((entry) => entry.id === category)
  if (!house) return ROW_COPY[category]
  return `${ROW_COPY[category]} · ${house.genreLabels.join(', ')}`
}

/**
 * App - Catalogo PotterFlix conectado a TMDB.
 *
 * ESTADO GLOBAL (segun el enunciado):
 *  - `tab` → Inicio, Películas, Series o Mi Lista de Hechizos.
 *  - `search` → buscador en tiempo real con debounce de 300 ms (`useSearch`).
 *  - `activeHouse` → aura de la casa, persistida en localStorage y reflejada
 *    en `data-house` del `<html>` (cambio de color en CSS puro, sin repintar
 *    componentes).
 *  - `list` → favoritos en localStorage (`useMyList`).
 *  - `selected` → titulo abierto en el modal reproductor.
 *
 * RENDIMIENTO: cada fila se cancela con su propio `AbortController` si el
 * usuario cambia de pestana, las filas y cartas van envueltas en `memo` y la
 * rejilla de resultados reutiliza MovieCard. Solo hay estado en la raiz.
 */
export default function App() {
  const [tab, setTab] = useState<ViewTab>('home')
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [activeHouse, setActiveHouse] = useState<House>(DEFAULT_HOUSE)

  /* ============ Buscador global en tiempo real (debounce 300 ms) ============ */
  const search = useSearch()
  const term = search.query.trim()
  const searching = term.length >= 2

  /* ============ Mi Lista de Hechizos (localStorage) ============ */
  const myList = useMyList()

  /* ============ Datos: hero + una fila por casa ============ */
  const showHero = !searching && tab === 'home'
  const rowsEnabled = !searching && (tab === 'home' || tab === 'movies' || tab === 'series')
  const mediaType: MediaType = tab === 'series' ? 'tv' : 'movie'

  const hero = useHero(showHero)
  const gryffindor = useCatalog('gryffindor', mediaType, rowsEnabled)
  const slytherin = useCatalog('slytherin', mediaType, rowsEnabled)
  const ravenclaw = useCatalog('ravenclaw', mediaType, rowsEnabled)
  const hufflepuff = useCatalog('hufflepuff', mediaType, rowsEnabled)

  /** Filas en el orden de las casas, listas para pintar. */
  const rows = useMemo(
    () => [
      { category: CATEGORIES[0], data: gryffindor },
      { category: CATEGORIES[1], data: slytherin },
      { category: CATEGORIES[2], data: ravenclaw },
      { category: CATEGORIES[3], data: hufflepuff },
    ],
    [gryffindor, slytherin, ravenclaw, hufflepuff],
  )
  /* ============ Registro de titulos vistos (para Mi Lista) ============ */
  // En localStorage solo se guardan claves, asi que los objetos se recuperan
  // de lo que la app ha visto en esta sesion + el catalogo local de respaldo.
  const [registry, setRegistry] = useState<Map<string, MediaItem>>(
    () => new Map(FALLBACK_CATALOG.map((item) => [item.id, item])),
  )

  const catalogChunks = useMemo(
    () => [hero.items, search.results, ...rows.map((row) => row.data.items)],
    [hero.items, search.results, rows],
  )

  useEffect(() => {
    setRegistry((previous) => {
      let dirty = false
      const next = new Map(previous)
      for (const chunk of catalogChunks) {
        for (const item of chunk) {
          if (!next.has(item.id)) {
            next.set(item.id, item)
            dirty = true
          }
        }
      }
      return dirty ? next : previous
    })
  }, [catalogChunks])

  /** Objetos completos de los ids guardados, en su orden de guardado. */
  const listItems = useMemo(
    () => myList.ids.map((id) => registry.get(id)).filter((item): item is MediaItem => Boolean(item)),
    [myList.ids, registry],
  )

  /** Conjunto de ids guardados, para el estado de las tarjetas. */
  const savedIds = useMemo(() => new Set(myList.ids), [myList.ids])

  /* ============ Casa: restaura y refleja el aura en <html> ============ */
  useEffect(() => {
    const stored = window.localStorage.getItem(HOUSE_STORAGE_KEY) as House | null
    if (stored && VALID_HOUSES.includes(stored)) setActiveHouse(stored)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-house', activeHouse)
    try {
      window.localStorage.setItem(HOUSE_STORAGE_KEY, activeHouse)
    } catch {
      // Modo privado: la casa sigue viva durante la sesion.
    }
  }, [activeHouse])

  /* ============ Callbacks estables para los hijos memoizados ============ */
  const openModal = useCallback((item: MediaItem) => setSelected(item), [])
  const closeModal = useCallback(() => setSelected(null), [])

  const handleTabChange = useCallback((next: ViewTab) => {
    setTab(next)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const handleHouseChange = useCallback((house: House) => setActiveHouse(house), [])
  /** Rejilla de titulos con estetica de pergamino (busqueda y Mi Lista). */
  const renderGrid = (items: MediaItem[], state: LoadState, emptyMessage: string) => (
    <>
      {state === 'loading' && items.length === 0 && (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }, (_, index) => (
            <div
              key={index}
              className="aspect-[2/3] w-full animate-pulse rounded-lg border border-gold/20 bg-ink"
            />
          ))}
        </div>
      )}

      {state !== 'loading' && items.length === 0 && (
        <div className="rounded-xl border border-gold/25 bg-ink/60 px-6 py-12 text-center">
          <p className="font-display text-lg font-bold text-gold-light">Ningún hechizo responde</p>
          <p className="mt-2 text-sm text-vellum/80">{emptyMessage}</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item, index) => (
            <MovieCard
              key={item.id}
              item={item}
              index={index}
              onSelect={openModal}
              saved={savedIds.has(item.id)}
              onToggleSave={myList.toggle}
            />
          ))}
        </div>
      )}
    </>
  )

  return (
    <div className="min-h-screen bg-night text-vellum">
      {/* Velo del Gran Comedor y varita optimizada */}
      <FloatingCandles />
      <WandCursor />

      <Navbar
        activeTab={tab}
        onTabChange={handleTabChange}
        query={search.query}
        onQueryChange={search.setQuery}
        searchState={search.state}
        activeHouse={activeHouse}
        onHouseChange={handleHouseChange}
        listCount={myList.count}
      />

      <main>
        {/* ============ BUSCADOR GLOBAL: rejilla de resultados ============ */}
        {searching ? (
          <section className="parchment min-h-screen px-4 pb-24 pt-28 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-[1600px]">
              <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-gold">
                Buscador mágico
              </p>
              <h1 className="glow-effect mt-1 font-display text-2xl font-bold sm:text-4xl">
                Resultados para «{term}»
              </h1>
              <p className="mt-2 text-sm text-vellum/80">
                {search.state === 'ready'
                  ? `${search.results.length} títulos invocados de TMDB (películas y series).`
                  : search.state === 'error'
                    ? 'La Busqueda no respondió a tiempo. Inténtalo de nuevo en un momento.'
                    : 'Consultando /search/multi en The Movie Database…'}
              </p>

              <div className="mt-7">
                {renderGrid(
                  search.results,
                  search.state,
                  'Prueba con otro hechizo: título, actor o género.',
                )}
              </div>
            </div>
          </section>
        ) : tab === 'list' ? (
          /* ============ MI LISTA DE HECHIZOS ============ */
          <section className="parchment min-h-screen px-4 pb-24 pt-28 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-[1600px]">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-gold">
                    Pergamino personal
                  </p>
                  <h1 className="glow-effect mt-1 font-display text-2xl font-bold sm:text-4xl">
                    Mi Lista de Hechizos
                  </h1>
                  <p className="mt-2 text-sm text-vellum/80">
                    {myList.count === 0
                      ? 'Aún no has guardado ningún título.'
                      : `${myList.count} ${
                          myList.count === 1 ? 'título guardado' : 'títulos guardados'
                        } en este navegador.`}
                  </p>
                </div>
                {myList.count > 0 && (
                  <button
                    type="button"
                    onClick={myList.clear}
                    className="rounded-md border border-gold/60 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-gold-light transition-colors hover:bg-gold hover:text-night"
                  >
                    Vaciar la lista
                  </button>
                )}
              </div>

              <div className="mt-7">
                {renderGrid(
                  listItems,
                  'ready',
                  'Pulsa «Mi Lista» en cualquier carta para guardarlo aquí.',
                )}
              </div>
            </div>
          </section>
        ) : (
          /* ============ CATALOGO: hero + filas por casa ============ */
          <>
            {showHero && (
              <MagicHero
                items={hero.items}
                state={hero.state}
                onSelect={openModal}
                isSaved={(item) => myList.isSaved(item.id)}
                onToggleSave={myList.toggle}
              />
            )}

            <div
              className={'relative z-10 pb-24 ' + (showHero ? '-mt-10 sm:-mt-16' : 'pt-28')}
            >
              {rows.map(({ category, data }) => (
                <CategoryRow
                  key={category.id + '-' + mediaType}
                  id={category.id}
                  icon={category.icon}
                  title={category.title + ' · ' + ROW_COPY[category.id]}
                  description={rowDescription(category.id)}
                  items={data.items}
                  state={data.state}
                  onSelect={openModal}
                  savedIds={savedIds}
                  onToggleSave={myList.toggle}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Pie magico */}
      <footer className="relative z-10 border-t border-gold/20 bg-night/80 py-10">
        <div className="mx-auto max-w-[1600px] px-4 text-center sm:px-8">
          <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold">
            PotterFlix
          </p>
          <p className="mt-2 text-xs font-medium text-vellum/75">
            {hasApiKey
              ? 'Catálogo en vivo proporcionado por The Movie Database (TMDB).'
              : 'Modo demo con el catálogo local de respaldo. Añade VITE_TMDB_API_KEY a un archivo .env para conectar TMDB.'}
          </p>
          <p className="mt-2 text-xs text-vellum/60">
            Proyecto fan no oficial. Los tráileres pertenecen a sus respectivos titulares.
          </p>
        </div>
      </footer>

      {/* Modal reproductor con el trailer oficial de YouTube */}
      <MagicModal
        item={selected}
        onClose={closeModal}
        saved={selected ? savedIds.has(selected.id) : false}
        onToggleSave={myList.toggle}
      />
    </div>
  )
}
