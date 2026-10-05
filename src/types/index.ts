/**
 * PotterFlix / Hogwarts — Modelo de datos y contratos de la interfaz.
 */

/** Las cuatro casas de Hogwarts, usadas para tematizar la navegación. */
export type House = 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff'

/** Identificadores de las secciones temáticas del catálogo. */
export type CategoryId =
  | 'dark-arts'
  | 'charms-adventure'
  | 'love-potions'
  | 'time-turners'

/** Una persona del reparto. */
export interface CastMember {
  /** Nombre del actor o actriz. */
  name: string
  /** Personaje interpretado dentro del hechizo o película. */
  character: string
}

/** Un hechizo (película o serie) del catálogo. */
export interface Movie {
  /** Identificador único y estable. */
  id: string
  /** Título de la producción. */
  title: string
  /** Subtítulo o lema estilo póster. */
  tagline: string
  /** Sinopsis en formato pergamino. */
  synopsis: string
  /** Año de estreno en el mundo mágico. */
  year: number
  /** Clasificación por edad reinventada. */
  rating: 'G' | 'PG' | 'PG-13' | 'R' | 'Spell-III'
  /** Duración total en minutos. */
  durationMinutes: number
  /** Puntuación de 0 a 10. */
  score: number
  /** Casa asociada al estudio o productora. */
  house: House
  /** Categoría temática principal. */
  category: CategoryId
  /** Etiquetas de búsqueda. */
  genres: string[]
  /** Reparto principal. */
  cast: CastMember[]
  /** URL de la imagen panorámica de cabecera. */
  backdrop: string
  /** URL alternativa del póster vertical. */
  poster: string
  /** ID de YouTube para el tráiler embebido. */
  trailerId: string
  /** Número de temporadas si es una serie. */
  seasons?: number
  /** Si ocupa el banner principal. */
  featured?: boolean
  /** Badge textual opcional, por ejemplo "NUEVO". */
  badge?: string
}

/** Una fila horizontal de películas con su estilo. */
export interface Category {
  id: CategoryId
  /** Emoji de adorno. */
  icon: string
  /** Nombre estilizado de la sección. */
  title: string
  /** Descripción corta bajo el título. */
  description: string
  /** Color de acento para bordes y detalles. */
  accent: string
  /** Si la fila debe estar totalmente montada al inicio. */
  priority?: boolean
}

/** Definición de una casa para navegación y filtros. */
export interface HouseMeta {
  id: House
  name: string
  motto: string
  color: string
}
