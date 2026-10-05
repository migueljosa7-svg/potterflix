import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, Search, Sparkles, X } from 'lucide-react'
import { CATEGORIES, HOUSES } from '../data/mockMovies'

interface NavbarProps {
  /** Categoria activa, para resaltar el enlace correspondiente. */
  activeCategory: string
  onCategoryChange: (id: string) => void
}

/**
 * Navbar - Menu superior con el logotipo de PotterFlix, el buscador y la
 * navegacion por las cuatro casas de Hogwarts.
 */
export default function Navbar({ activeCategory, onCategoryChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /** Cierra el menu movil al navegar. */
  const goTo = (id: string) => {
    onCategoryChange(id)
    setOpen(false)
  }

  return (
    <header
      className={
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 ' +
        (scrolled
          ? 'border-b border-gold/20 bg-night/92 shadow-[0_10px_40px_-18px_rgba(0,0,0,0.95)] backdrop-blur-xl'
          : 'bg-gradient-to-b from-night/85 to-transparent')
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
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gold/45 bg-night/70">
            <Sparkles className="h-4 w-4 text-gold transition-transform duration-500 group-hover:rotate-45" />
            <span className="absolute inset-0 animate-pulse-ring rounded-full border border-gold/40" />
          </span>
          <span className="font-display text-lg font-bold tracking-wide text-gold-gradient animate-shimmer">
            PotterFlix
          </span>
        </button>

        {/* Buscador */}
        <div className="ml-2 hidden flex-1 items-center gap-2 rounded-full border border-parchment/20 bg-night/50 px-4 py-2 transition-colors focus-within:border-gold/50 md:flex">
          <Search className="h-4 w-4 shrink-0 text-parchment/50" />
          <input
            type="search"
            placeholder="Invoca un hechizo, un actor, un lugar..."
            className="w-full bg-transparent text-sm text-parchment outline-none placeholder:text-parchment/35"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Casas de Hogwarts */}
          <div className="hidden items-center gap-1 lg:flex">
            {HOUSES.map((house) => (
              <button
                key={house.id}
                type="button"
                title={house.motto}
                className="group relative flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 hover:scale-110"
                style={{ borderColor: house.color + '66', background: house.color + '1f' }}
                aria-label={house.name}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: house.color }}
                />
                <span className="pointer-events-none absolute top-10 whitespace-nowrap rounded border border-gold/30 bg-night/95 px-2 py-1 font-display text-[0.6rem] uppercase tracking-wider text-gold opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {house.name}
                </span>
              </button>
            ))}
          </div>

          <span className="mx-1 hidden h-6 w-px bg-parchment/20 lg:block" />

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
                    'relative rounded px-3 py-1.5 text-xs font-medium transition-colors ' +
                    (isActive ? 'text-gold' : 'text-parchment/65 hover:text-parchment')
                  }
                >
                  <span className="mr-1.5">{category.icon}</span>
                  {category.title}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-2 -bottom-0.5 h-px bg-gold"
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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-gold lg:hidden"
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
          className="overflow-hidden border-t border-gold/15 bg-night/97 backdrop-blur-xl lg:hidden"
        >
          <div className="space-y-1 px-4 py-4 sm:px-8">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => goTo(category.id)}
                className={
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ' +
                  (activeCategory === category.id
                    ? 'bg-gold/12 text-gold'
                    : 'text-parchment/75 hover:bg-parchment/6')
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
