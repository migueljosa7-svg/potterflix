import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, Search, Sparkles, X } from 'lucide-react'
import { CATEGORIES, HOUSES } from '../data/mockMovies'
import type { CategoryId, House } from '../types'

interface NavbarProps {
  /** Categoria activa, para resaltar el enlace correspondiente. */
  activeCategory: CategoryId
  onCategoryChange: (id: CategoryId) => void
  /** Casa que define el aura del sitio. */
  activeHouse: House
  onHouseChange: (house: House) => void
}

/**
 * Navbar - Menu superior con el logotipo de PotterFlix, el buscador, la
 * navegacion por categorias y el conmutador de Casas de Hogwarts.
 *
 * El conmutador escribe `data-house` en el `<html>`, lo que hace que las
 * variables CSS `--house-primary`, `--house-secondary` y `--house-aura` cambien
 * en todo el sitio sin repintar un solo componente.
 */
export default function Navbar({
  activeCategory,
  onCategoryChange,
  activeHouse,
  onHouseChange,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /** Cierra el menu movil al navegar. */
  const goTo = (id: CategoryId) => {
    onCategoryChange(id)
    setOpen(false)
  }

  return (
    <header
      className={
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 ' +
        (scrolled
          ? 'border-b border-gold/25 bg-night/95 shadow-[0_10px_40px_-18px_rgba(0,0,0,0.95)] backdrop-blur-xl'
          : 'bg-gradient-to-b from-night/90 to-transparent')
      }
    >
      <nav className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-8">
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
          <span className="font-display text-lg font-bold tracking-wide text-gold-gradient animate-shimmer">
            PotterFlix
          </span>
        </button>

        {/* Buscador: texto claro y placeholder legible */}
        <div className="ml-2 hidden flex-1 items-center gap-2 rounded-full border border-gold/30 bg-night/70 px-4 py-2 transition-colors focus-within:border-gold/70 md:flex">
          <Search className="h-4 w-4 shrink-0 text-gold/70" />
          <input
            type="search"
            placeholder="Invoca un hechizo, un actor, un lugar..."
            className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-vellum/55"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Conmutador de Casas de Hogwarts */}
          <div className="hidden items-center gap-1.5 lg:flex">
            {HOUSES.map((house) => {
              const isActive = activeHouse === house.id
              return (
                <button
                  key={house.id}
                  type="button"
                  onClick={() => onHouseChange(house.id)}
                  title={house.name + ' — ' + house.motto}
                  aria-label={'Casa ' + house.name}
                  aria-pressed={isActive}
                  className={
                    'group relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm transition-all duration-300 hover:scale-110 ' +
                    (isActive ? 'shadow-[0_0_14px_rgba(255,215,0,0.6)]' : '')
                  }
                  style={{
                    borderColor: isActive ? house.secondary : house.color + '99',
                    background: isActive ? house.color : 'rgba(8,9,15,0.8)',
                  }}
                >
                  <span aria-hidden="true">{house.sigil}</span>
                  <span
                    className={
                      'pointer-events-none absolute top-10 whitespace-nowrap rounded border border-gold/50 bg-night px-2 py-1 font-display text-[0.6rem] font-bold uppercase tracking-wider text-gold-light transition-opacity duration-200 ' +
                      (isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')
                    }
                  >
                    {house.name}
                  </span>
                </button>
              )
            })}
          </div>

{/* Categorias (escritorio) */}
          <div className="hidden items-center gap-1 xl:flex">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category.id
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => goTo(category.id)}
                  className={
                    'relative rounded px-3 py-1.5 text-xs font-semibold transition-colors ' +
                    (isActive ? 'text-gold-light' : 'text-vellum/85 hover:text-white')
                  }
                >
                  <span className="mr-1.5">{category.icon}</span>
                  {category.title}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gold"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Boton de menu movil */}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 bg-night/80 text-gold-light lg:hidden"
            aria-label={open ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Panel desplegable movil */}
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="overflow-hidden border-t border-gold/25 bg-night/98 backdrop-blur-xl lg:hidden"
        >
          <div className="space-y-1 px-4 py-4 sm:px-8">
            {/* Casas tambien disponibles en movil */}
            <div className="mb-3 flex items-center justify-center gap-3 pb-3">
              {HOUSES.map((house) => (
                <button
                  key={house.id}
                  type="button"
                  onClick={() => onHouseChange(house.id)}
                  aria-label={'Casa ' + house.name}
                  aria-pressed={activeHouse === house.id}
                  className={
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg transition-all ' +
                    (activeHouse === house.id
                      ? 'scale-110 shadow-[0_0_14px_rgba(255,215,0,0.6)]'
                      : '')
                  }
                  style={{
                    borderColor:
                      activeHouse === house.id ? house.secondary : house.color + '99',
                    background:
                      activeHouse === house.id ? house.color : 'rgba(8,9,15,0.8)',
                  }}
                >
                  <span aria-hidden="true">{house.sigil}</span>
                </button>
              ))}
            </div>

            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => goTo(category.id)}
                className={
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ' +
                  (activeCategory === category.id
                    ? 'bg-gold/15 text-gold-light'
                    : 'text-vellum/90 hover:bg-gold/10 hover:text-white')
                }
              >
                <span className="text-lg">{category.icon}</span>
                {category.title}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  )
}
          <span className="mx-1 hidden h-6 w-px bg-gold/25 lg:block" />