import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, Film, Home, Loader2, Menu, Search, Sparkles, Tv, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { HOUSES, hasApiKey } from '../services/tmdb'
import type { House, LoadState, ViewTab } from '../types/tmdb'

interface NavbarProps {
  activeTab: ViewTab
  onTabChange: (tab: ViewTab) => void
  query: string
  onQueryChange: (value: string) => void
  searchState: LoadState
  activeHouse: House
  onHouseChange: (house: House) => void
  listCount: number
}

interface TabDef {
  id: ViewTab
  label: string
  Icon: LucideIcon
}

const TABS: TabDef[] = [
  { id: 'home', label: 'Inicio', Icon: Home },
  { id: 'movies', label: 'Películas', Icon: Film },
  { id: 'series', label: 'Series', Icon: Tv },
  { id: 'list', label: 'Mi Lista de Hechizos', Icon: Bookmark },
]

/**
 * Navbar V4.0 — Barra superior con logo PotterFlix mejorado, buscador mágico
 * en tiempo real (debounce 300 ms) y conmutador de Casas de Hogwarts.
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

  const selectTab = (tab: ViewTab) => {
    onTabChange(tab)
    setMenuOpen(false)
  }

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
          'relative flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 font-display text-[0.72rem] font-bold uppercase tracking-[0.14em] transition-all duration-300 ' +
          (isActive
            ? 'text-gold-light bg-gold/10'
            : 'text-vellum/80 hover:text-white hover:bg-white/5')
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
            ? 'scale-110 shadow-[0_0_18px_rgba(255,215,0,0.65)]'
            : 'opacity-65 hover:opacity-100 hover:scale-105')
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
          ? 'border-b border-gold/20 bg-night/97 shadow-[0_12px_48px_-18px_rgba(0,0,0,0.98)] backdrop-blur-xl'
          : 'bg-gradient-to-b from-night/95 via-night/65 to-transparent')
      }
    >
      <nav className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-8 lg:px-12">
        {/* ====== Logotipo PotterFlix ====== */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="Volver al inicio"
        >
          {/* Icono con animacion */}
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gold/55 bg-night/85 shadow-[0_0_12px_rgba(255,215,0,0.25)]">
            <Sparkles className="h-4 w-4 text-gold transition-all duration-500 group-hover:rotate-180 group-hover:scale-125" />
            <span className="absolute inset-0 animate-pulse-ring rounded-full border border-gold/40" />
          </span>
          {/* Texto del logo */}
          <span className="hidden sm:flex flex-col leading-none">
            <span className="font-display text-[0.62rem] font-bold uppercase tracking-[0.38em] text-gold/65">
              The Wizarding
            </span>
            <span className="font-display text-lg font-black tracking-wide text-gold-gradient animate-shimmer">
              PotterFlix
            </span>
          </span>
        </button>

        {/* Pestanas (solo escritorio) */}
        <div className="hidden items-center gap-0.5 lg:flex">{TABS.map(renderTab)}</div>

        {/* ============ BUSCADOR MAGICO EN TIEMPO REAL ============ */}
        <div className="ml-auto flex min-w-0 flex-1 items-center gap-2 rounded-full border border-gold/30 bg-night/80 px-3.5 py-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] transition-all duration-300 focus-within:border-gold/70 focus-within:shadow-[inset_0_1px_3px_rgba(0,0,0,0.5),0_0_20px_rgba(255,215,0,0.15)] sm:px-4 lg:ml-0 lg:max-w-sm xl:max-w-md">
          <Search className="h-4 w-4 shrink-0 text-gold/70" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Invoca un hechizo, un título, un actor…"
            aria-label="Buscador de películas y series"
            className="w-full min-w-0 bg-transparent text-sm font-medium text-white outline-none placeholder:text-vellum/45"
          />
          {busy && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gold" aria-label="Buscando" />
          )}
          {!busy && query.length > 0 && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label="Borrar búsqueda"
              className="shrink-0 text-vellum/55 transition-colors hover:text-gold"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Indicador de modo demo */}
        {!hasApiKey && (
          <span
            title="No se ha configurado VITE_TMDB_API_KEY: se muestra el catálogo local de respaldo."
            className="hidden shrink-0 rounded-full border border-gold/35 bg-night/80 px-3 py-1 font-display text-[0.58rem] font-bold uppercase tracking-[0.22em] text-gold/80 xl:block"
          >
            Demo
          </span>
        )}

        {/* Conmutador de Casas (solo escritorio) */}
        <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
          {HOUSES.map(renderHouse)}
        </div>

        {/* Boton de menu movil */}
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-night/85 text-gold-light shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors hover:bg-gold/15 lg:hidden"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {/* Panel desplegable movil */}
      {menuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="overflow-hidden border-t border-gold/20 bg-night/98 backdrop-blur-xl lg:hidden"
        >
          <div className="space-y-3 px-4 py-4 sm:px-8">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {TABS.map((tab) => renderTab(tab))}
            </div>
            <div className="flex items-center justify-center gap-2 border-t border-gold/18 pt-3">
              {HOUSES.map(renderHouse)}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}
