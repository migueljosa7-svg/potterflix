/**
 * PotterFlix / TMDB — Tipos del cliente de The Movie Database.
 *
 * Diseño: la app nunca consume los tipos crudos de TMDB directamente. Cada
 * endpoint se normaliza a un unico tipo, `MediaItem`, que es lo que pintan los
 * componentes. Asi, cambiar de proveedor (o pasar al catalogo local cuando falta
 * la API key) no obliga a tocar ni un solo componente.
 */

/** Las cuatro casas de Hogwarts, usadas para tematizar la navegación. */
export type House = 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff'

/** Identificadores de las secciones temáticas del catálogo. */
export type CategoryId = 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff'

/** Discriminador de medio: película o serie. */
export type MediaType = 'movie' | 'tv'

/** Una persona del reparto. */
export interface CastMember {
  name: string
  character: string
}

/* ==========================================================================
   Tipos CRUDOS devueltos por la API de TMDB (solo se usan dentro del servicio)
   ========================================================================== */

export interface TmdbGenre {
  id: number
  name: string
}

export interface TmdbMovieResult {
  id: number
  title?: string
  name?: string
  original_title?: string
  overview?: string
  poster_path?: string | null
  backdrop_path?: string | null
  vote_average?: number
  release_date?: string
  first_air_date?: string
  media_type?: string
  genre_ids?: number[]
}

export interface TmdbListResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface TmdbVideo {
  id: string
  key: string
  name: string
  site: string
  type: string
  official?: boolean
  iso_639_1?: string
  iso_3166_1?: string
}

export interface TmdbVideoResponse {
  id: number
  results: TmdbVideo[]
}

export interface TmdbCastMember {
  name: string
  character?: string
}

/* ==========================================================================
   TIPO NORMALIZADO: la unica forma en la que la UI consume el catalogo
   ========================================================================== */

/**
 * Un titulo listo para pintar, venga de TMDB o del catalogo local de respaldo.
 * Todos los campos son obligatorios y siempre vienen rellenos: el servicio
 * garantiza un poster y un backdrop aunque la API no los devuelva.
 */
export interface MediaItem {
  /** Clave estable y unica: `${mediaType}-${tmdbId}`. */
  id: string
  /** Identificador numerico en TMDB (0 si es del catalogo local). */
  tmdbId: number
  mediaType: MediaType
  title: string
  originalTitle?: string
  tagline: string
  synopsis: string
  year: number
  /** Duracion en minutos (0 si la serie no la reporta). */
  durationMinutes: number
  /** Puntuacion normalizada de 0 a 10. */
  score: number
  /** Casa de Hogwarts asignada, segun los generos de la pieza. */
  house: House
  category: CategoryId
  genres: string[]
  cast: CastMember[]
  /** URL absoluta del poster vertical. */
  poster: string
  /** URL absoluta del fondo panoramico. */
  backdrop: string
  /**
   * Clave de YouTube del trailer oficial, o `null` si TMDB no devuelve ninguno.
   * Se resuelve de forma perezosa: no se piden los videos al montar la carta.
   */
  trailerKey: string | null
  /** Numero de temporadas, solo para series. */
  seasons?: number
  /** Si ocupa el banner principal. */
  featured?: boolean
  badge?: string
  /** Emoji / sigilo de la casa, usado en el poster procedural. */
  sigil?: string
}

/** Definicion de una casa: color, lema y generos de TMDB que la alimentan. */
export interface HouseMeta {
  id: House
  name: string
  motto: string
  /** Color primario de la casa. */
  color: string
  /** Color secundario o metal. */
  secondary: string
  /** Acento luminoso: unico color de esta casa que se usa como TEXTO. */
  accent: string
  /** Aura translucida para fondos. */
  aura: string
  /** Emoji / sigilo representativo. */
  sigil: string
  /** Generos de TMDB (v3) que alimentan esta casa. */
  genreIds: number[]
  /** Etiquetas legibles de esos generos. */
  genreLabels: string[]
}

/** Una fila horizontal del catalogo. */
export interface Category {
  id: CategoryId
  icon: string
  title: string
  description: string
  accent: string
}

/** Pestanas principales de navegacion. */
export type ViewTab = 'home' | 'movies' | 'series' | 'list'

/** Estado de una peticion asincrona, para los skeletons de carga. */
export type LoadState = 'idle' | 'loading' | 'ready' | 'error'