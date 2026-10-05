import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, Film, Home, Loader2, Menu, Search, Sparkles, Tv, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { HOUSES, hasApiKey } from '../services/tmdb'
import type { House, LoadState, ViewTab } from '../types/tmdb'

interface NavbarProps {
  /** Pestana activa, para resaltar el enlace correspondiente. */
  activeTab: ViewTab
  onTabChange: (tab: ViewTab) => void
  /** Texto del buscador (controlado por App, con debounce en useSearch). */
  query: string
  onQueryChange: (value: string) => void
  /** Estado de la peticion de busqueda, para el indicador de carga. */
  searchState: LoadState
  /** Casa que define el aura del sitio. */
  activeHouse: House
  onHouseChange: (house: House) => void
  /** Numero de titulos guardados en Mi Lista de Hechizos. */
  listCount: number
}

interface TabDef {
  id: ViewTab
  label: string
  Icon: LucideIcon
}

/** Pestanas principales: Inicio, Peliculas, Series y Mi Lista de Hechizos. */
const TABS: TabDef[] = [
  { id: 'home', label: 'Inicio', Icon: Home },
  { id: 'movies', label: 'Películas', Icon: Film },
  { id: 'series', label: 'Series', Icon: Tv },
  { id: 'list', label: 'Mi Lista de Hechizos', Icon: Bookmark },
]

/**
 * Navbar - Barra superior fija con logotipo, buscador magico en tiempo real
 * (debounce de 300 ms aplicado en `useSearch`), pestanas de navegacion y el
 * conmutador de Casas de Hogwarts.
 *
 * El buscador esta CONTROLADO desde App: escribir actualiza `query`, que
 * dispara `/search/multi` de TMDB y sustituye el contenido por la rejilla de
 * resultados. El conmutador de casas solo escribe `data-house` en el `<html>`,
 * de modo que las variables CSS de aura cambian sin repintar componentes.
 */
export default function Navbar({
  activeTab,
  onTabChange,
  query,
  onQueryChange,
  searchState,
  activeHouse,
  onHouseChange,
  listCount,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const term = query.trim()
  const searching = term.length >= 2
  const busy = searching && searchState === 'loading'

  /** Cambia de pestana y cierra el menu movil. */
  const selectTab = (tab: ViewTab) => {
    onTabChange(tab)
    setMenuOpen(false)
  }

  /** Una pestana de la barra (escritorio y panel movil). */
  const renderTab = (tab: TabDef) => {
    const isActive = activeTab === tab.id
    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => selectTab(tab.id)}
        aria-current={isActive ? 'page' : undefined}
        title={tab.label}
        className={
          'relative flex items-center gap-1.5 whitespace-nowrap rounded px-3 py-2 font-display text-[0.7rem] font-bold uppercase tracking-[0.14em] transition-colors ' +
          (isActive ? 'text-gold-light' : 'text-vellum/85 hover:text-white')
        }
      >
        <tab.Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {tab.label}
        {tab.id === 'list' && listCount > 0 && (
          <span className="ml-0.5 rounded-full bg-gold px-1.5 py-px text-[0.6rem] font-black tabular-nums text-night">
            {listCount}
          </span>
        )}
        {isActive && (
          <motion.span
            layoutId="nav-underline"
            className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gold"
          />
        )}
      </button>
    )
  }

  /** Un boton de casa (escritorio y panel movil). */
  const renderHouse = (house: (typeof HOUSES)[number]) => {
    const isActive = activeHouse === house.id
    return (
      <button
        key={house.id}
        type="button"
        onClick={() => onHouseChange(house.id)}
        aria-label={'Casa ' + house.name}
        aria-pressed={isActive}
        title={house.name + ' — ' + house.motto}
        className={
          'flex h-9 w-9 items-center justify-center rounded-full border-2 text-base transition-all duration-300 ' +
          (isActive
            ? 'scale-110 shadow-[0_0_14px_rgba(255,215,0,0.55)]'
            : 'opacity-70 hover:opacity-100')
        }
        style={{
          borderColor: isActive ? house.secondary : house.color + '99',
          background: isActive ? house.color : 'rgba(8,9,15,0.8)',
        }}
      >
        <span aria-hidden="true">{house.sigil}</span>
      </button>
    )
  }
  return (
    <header
      className={
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 ' +
        (scrolled
          ? 'border-b border-gold/25 bg-night/95 shadow-[0_10px_40px_-18px_rgba(0,0,0,0.95)] backdrop-blur-xl'
          : 'bg-gradient-to-b from-night/90 via-night/60 to-transparent')
      }
    >
      <nav className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-8 lg:px-12">
        {/* Logotipo */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex shrink-0 items-center gap-2"
          aria-label="Volver al inicio"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 bg-night/80">
            <Sparkles className="h-4 w-4 text-gold transition-transform duration-500 group-hover:rotate-45" />
            <span className="absolute inset-0 animate-pulse-ring rounded-full border border-gold/45" />
          </span>
          <span className="hidden font-display text-lg font-bold tracking-wide text-gold-gradient animate-shimmer sm:block">
            PotterFlix
          </span>
        </button>

        {/* Pestanas (solo escritorio; en movil van en el panel desplegable) */}
        <div className="hidden items-center gap-1 lg:flex">{TABS.map(renderTab)}</div>

        {/* ============ BUSCADOR MAGICO EN TIEMPO REAL ============ */}
        <div className="ml-auto flex min-w-0 flex-1 items-center gap-2 rounded-full border border-gold/30 bg-night/75 px-3 py-1.5 transition-colors focus-within:border-gold/75 sm:px-4 sm:py-2 lg:ml-0 lg:max-w-md">
          <Search className="h-4 w-4 shrink-0 text-gold/75" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Invoca un hechizo, un actor, un título…"
            aria-label="Buscador de películas y series"
            className="w-full min-w-0 bg-transparent text-sm font-medium text-white outline-none placeholder:text-vellum/55"
          />
          {busy && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gold" aria-label="Buscando" />
          )}
          {!busy && query.length > 0 && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label="Borrar búsqueda"
              className="shrink-0 text-vellum/60 transition-colors hover:text-gold"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Indicador de modo demo (sin VITE_TMDB_API_KEY) */}
        {!hasApiKey && (
          <span
            title="No se ha configurado VITE_TMDB_API_KEY: se muestra el catálogo local de respaldo."
            className="hidden shrink-0 rounded-full border border-gold/40 bg-night/80 px-3 py-1 font-display text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gold-light xl:block"
          >
            Modo demo
          </span>
        )}

        {/* Conmutador de Casas de Hogwarts (solo escritorio) */}
        <div className="hidden shrink-0 items-center gap-1.5 lg:flex">{HOUSES.map(renderHouse)}</div>

        {/* Boton de menu movil */}
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-night/80 text-gold-light lg:hidden"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {/* Panel desplegable movil: pestanas y casas */}
      {menuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="overflow-hidden border-t border-gold/25 bg-night/98 backdrop-blur-xl lg:hidden"
        >
          <div className="space-y-3 px-4 py-4 sm:px-8">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {TABS.map((tab) => renderTab(tab))}
            </div>
            <div className="flex items-center justify-center gap-2 border-t border-gold/20 pt-3">
              {HOUSES.map(renderHouse)}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}
