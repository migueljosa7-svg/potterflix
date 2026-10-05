import { useCallback, useEffect, useMemo, useState } from 'react'
import CategoryRow from './components/CategoryRow'
import FloatingCandles from './components/FloatingCandles'
import MagicHero from './components/MagicHero'
import MagicModal from './components/MagicModal'
import Navbar from './components/Navbar'
import WandCursor from './components/WandCursor'
import { CATEGORIES, HOUSE_AURAS, MOVIES } from './data/mockMovies'
import type { CategoryId, House, Movie } from './types'

/** Casa inicial y clave de almacenamiento de la preferencia del usuario. */
const DEFAULT_HOUSE: House = 'gryffindor'
const HOUSE_STORAGE_KEY = 'potterflix:house'

/**
 * App - Catalogo PotterFlix: hero del Pensadero, filas tematicas con efecto
 * Revelio, velas flotantes del Gran Comedor, cursor de varita optimizado y
 * modal de detalle con trailer de YouTube.
 *
 * INTEGRACION OPTIMIZADA:
 *  - Los peliculas por categoria se calculan UNA vez con `useMemo`; antes se
 *    filtraba el array completo en cada render de cada fila.
 *  - El conmutador de casas solo escribe un atributo `data-house` en el DOM, de
 *    modo que cambiar el aura no vuelve a renderizar ninguna tarjeta.
 *  - `MOVIES_BY_CATEGORY` mantiene referencias estables para que los `memo` de
 *    CategoryRow y MovieCard puedan saltarse el renderizado.
 */
export default function App() {
  const [selected, setSelected] = useState<Movie | null>(null)
  const [activeCategory, setActiveCategory] = useState<CategoryId>(
    CATEGORIES[0].id,
  )
  const [activeHouse, setActiveHouse] = useState<House>(DEFAULT_HOUSE)

  /* Agrupacion estable por categoria: se calcula una sola vez. */
  const moviesByCategory = useMemo(() => {
    const map = new Map<CategoryId, Movie[]>()
    for (const category of CATEGORIES) map.set(category.id, [])
    for (const movie of MOVIES) {
      const bucket = map.get(movie.category)
      if (bucket) bucket.push(movie)
    }
    return map
  }, [])

  /* El hero rota entre los hechizos destacados. */
  const heroMovie = useMemo(
    () => MOVIES.find((movie) => movie.featured) ?? MOVIES[0],
    [],
  )

  /* Restaura la casa elegida y refleja el aura en el atributo del <html>. */
  useEffect(() => {
    const stored = window.localStorage.getItem(HOUSE_STORAGE_KEY) as House | null
    if (
      stored &&
      ['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff'].includes(stored)
    ) {
      setActiveHouse(stored)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-house', activeHouse)
    document.documentElement.style.setProperty(
      '--house-aura',
      HOUSE_AURAS[activeHouse],
    )
    window.localStorage.setItem(HOUSE_STORAGE_KEY, activeHouse)
  }, [activeHouse])

  const openModal = useCallback((movie: Movie) => setSelected(movie), [])
  const closeModal = useCallback(() => setSelected(null), [])

  /** Desplaza la pagina hasta la fila seleccionada desde el menu. */
  const handleCategoryChange = useCallback((id: CategoryId) => {
    setActiveCategory(id)
    const node = document.getElementById(id)
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleHouseChange = useCallback((house: House) => {
    setActiveHouse(house)
  }, [])

  return (
    <div className="min-h-screen bg-night text-vellum">
      {/* Fondo de velas flotantes del Gran Comedor */}
      <FloatingCandles />

      {/* Cursor de varita optimizado con sprites pre-renderizados */}
      <WandCursor />

      <Navbar
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        activeHouse={activeHouse}
        onHouseChange={handleHouseChange}
      />

      <main>
        {/* El Pensadero: banner cinematico */}
        <MagicHero movie={heroMovie} onPlay={openModal} onInfo={openModal} />

        {/* Filas tematicas */}
        <div className="relative z-10 -mt-10 pb-24 sm:-mt-16">
          {CATEGORIES.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              movies={moviesByCategory.get(category.id) ?? []}
              onSelect={openModal}
            />
          ))}
        </div>
      </main>

      {/* Pie magico */}
      <footer className="relative z-10 border-t border-gold/20 bg-night/80 py-10">
        <div className="mx-auto max-w-[1600px] px-4 text-center sm:px-8">
          <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold">
            PotterFlix
          </p>
          <p className="mt-2 text-xs font-medium text-vellum/75">
            Proyecto fan no oficial. Los pósters se generan por código y los
            tráileres pertenecen a sus respectivos titulares.
          </p>
        </div>
      </footer>

      {/* Modal magico de detalle */}
      <MagicModal movie={selected} onClose={closeModal} />
    </div>
  )
}