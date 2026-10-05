import { useCallback, useMemo, useState } from 'react'
import CategoryRow from './components/CategoryRow'
import MagicHero from './components/MagicHero'
import MagicModal from './components/MagicModal'
import Navbar from './components/Navbar'
import WandCursor from './components/WandCursor'
import { CATEGORIES, MOVIES } from './data/mockMovies'
import type { Movie } from './types'

/**
 * App - Catalogo PotterFlix: hero del Pensadero, filas tematicas con efecto
 * Revelio, cursor de varita y modal de detalle con trailer.
 */
export default function App() {
  const [selected, setSelected] = useState<Movie | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].id)

  /** El hero rota entre los hechizos destacados. */
  const featured = useMemo(
    () => MOVIES.filter((movie) => movie.featured),
    [],
  )
  const heroMovie = featured[0] ?? MOVIES[0]

  const openModal = useCallback((movie: Movie) => setSelected(movie), [])
  const closeModal = useCallback(() => setSelected(null), [])

  /** Desplaza la pagina hasta la fila seleccionada desde el menu. */
  const handleCategoryChange = useCallback((id: string) => {
    setActiveCategory(id)
    const node = document.getElementById(id)
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className="min-h-screen bg-night text-parchment">
      {/* Cursor de varita con estela de chispas */}
      <WandCursor />

      <Navbar activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

      <main>
        {/* El Pensadero: banner cinematico */}
        <MagicHero movie={heroMovie} onPlay={openModal} onInfo={openModal} />

        {/* Filas tematicas */}
        <div className="relative z-10 -mt-10 pb-24 sm:-mt-16">
          {CATEGORIES.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              movies={MOVIES.filter((movie) => movie.category === category.id)}
              onSelect={openModal}
            />
          ))}
        </div>
      </main>

      {/* Pie magico */}
      <footer className="border-t border-gold/15 bg-parchment/40 py-10">
        <div className="mx-auto max-w-[1600px] px-4 text-center sm:px-8">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-gold/70">
            PotterFlix
          </p>
          <p className="mt-2 text-xs text-parchment/40">
            Mixame con cuidado. Este Catalogo es solo una broma, no un hechizo real.
          </p>
        </div>
      </footer>

      {/* Modal magico de detalle */}
      <MagicModal movie={selected} onClose={closeModal} />
    </div>
  )
}
