import type {
  Category,
  CategoryId,
  House,
  HouseMeta,
  MediaItem,
  MediaType,
  TmdbCastMember,
  TmdbGenre,
  TmdbListResponse,
  TmdbMovieResult,
  TmdbVideo,
  TmdbVideoResponse,
} from '../types/tmdb'
import { FALLBACK_CATALOG } from '../data/fallbackCatalog'
/* ==========================================================================
   CONFIGURACION
   ========================================================================== */
const API_BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p'
/**
 * Clave de la API. Se lee de VITE_TMDB_API_KEY (archivo `.env`, nunca
 * versionado). Si falta, la app arranca en MODO DEMO con el catalogo local
 * de Hogwarts: todas las pantallas siguen siendo utilizables.
 */
const API_KEY = (import.meta.env.VITE_TMDB_API_KEY as string | undefined)?.trim() ?? ''
/** `true` cuando hay credenciales y podemos hablar con TMDB de verdad. */
export const hasApiKey = API_KEY.length > 0
/** Tiempo maximo de espera por peticion, en ms. */
const REQUEST_TIMEOUT = 9000
/** Imagen por defecto cuando TMDB no devuelve poster ni backdrop (data-URI). */
export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900">' +
      '<rect width="600" height="900" fill="#12141f"/>' +
      '<text x="300" y="450" fill="#d4af37" font-size="34" ' +
      'font-family="Georgia, serif" text-anchor="middle">PotterFlix</text></svg>',
  )
/* ==========================================================================
   CASAS DE HOGWARTS <-> GENEROS DE TMDB
   ========================================================================== */
export const HOUSES: HouseMeta[] = [
  {
    id: 'gryffindor',
    name: 'Gryffindor',
    motto: 'Coraje y gloria',
    color: '#740001',
    secondary: '#ffd700',
    accent: '#ff8a7a',
    aura: 'rgba(255, 138, 122, 0.3)',
    sigil: '🦁',
    genreIds: [28, 12, 14, 10752, 10759],
    genreLabels: ['Acción', 'Aventura', 'Fantasía', 'Bélica', 'Action & Adventure'],
  },
  {
    id: 'slytherin',
    name: 'Slytherin',
    motto: 'Ambición y astucia',
    color: '#1a472a',
    secondary: '#e0e0e0',
    accent: '#7dfcb0',
    aura: 'rgba(125, 252, 176, 0.28)',
    sigil: '🐍',
    genreIds: [27, 9648, 53, 80],
    genreLabels: ['Terror', 'Misterio', 'Thriller', 'Crimen'],
  },
  {
    id: 'ravenclaw',
    name: 'Ravenclaw',
    motto: 'Ingenio y sabiduría',
    color: '#0e1a40',
    secondary: '#cd7f32',
    accent: '#a9c8ff',
    aura: 'rgba(169, 200, 255, 0.3)',
    sigil: '🦅',
    genreIds: [878, 9648, 99, 36],
    genreLabels: ['Ciencia Ficción', 'Misterio', 'Documental', 'Historia'],
  },
  {
    id: 'hufflepuff',
    name: 'Hufflepuff',
    motto: 'Lealtad y paciencia',
    color: '#ecb939',
    secondary: '#f4e4bc',
    accent: '#ffd75e',
    aura: 'rgba(255, 215, 94, 0.28)',
    sigil: '🦡',
    genreIds: [35, 18, 10751, 16, 10749],
    genreLabels: ['Comedia', 'Drama', 'Familiar', 'Animación', 'Romance'],
  },
]
/** Filas del catalogo, una por casa. */
export const CATEGORIES: Category[] = HOUSES.map((house) => ({
  id: house.id,
  icon: house.sigil,
  title: house.name,
  description: house.motto,
  accent: house.accent,
}))
/** Casa a la que pertenece un genero de TMDB (primera casa wins: Slytherin conserva Misterio). */
const HOUSE_BY_GENRE: Record<number, House> = (() => {
  const map: Record<number, House> = {}
  for (const house of HOUSES) {
    for (const genre of house.genreIds) {
      if (!(genre in map)) map[genre] = house.id
    }
  }
  return map
})()
/** Etiquetas legibles de los generos usados por las casas. */
const GENRE_LABELS: Record<number, string> = (() => {
  const map: Record<number, string> = {}
  for (const house of HOUSES) {
    house.genreIds.forEach((genre, index) => {
      if (!(genre in map)) map[genre] = house.genreLabels[index]
    })
  }
  return map
})()
/** Casa dominante de una lista de generos (la primera que coincida). */
function houseForGenres(genres: number[]): House {
  for (const genre of genres) {
    const house = HOUSE_BY_GENRE[genre]
    if (house) return house
  }
  // Sin coincidencias, reparto por indice para no dejar filas vacias.
  return HOUSES[genres.length % HOUSES.length].id
}
/* ==========================================================================
   UTILIDADES DE IMAGEN Y TEXTO
   ========================================================================== */
/** Construye la URL absoluta de una imagen de TMDB. */
export function imageUrl(
  path: string | null | undefined,
  size: 'w342' | 'w780' | 'w1280' | 'original' = 'w342',
): string {
  if (!path) return PLACEHOLDER_IMAGE
  // Ya es una URL absoluta (fotos de perfil de TMDB).
  if (path.startsWith('http')) return path
  return `${IMAGE_BASE}/${size}${path}`
}
/** Quita acentos y pasa a minusculas, para busquedas tolerantes. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
/** Elige el mejor trailer de YouTube de una respuesta de TMDB. */
function pickTrailer(videos: TmdbVideo[]): string | null {
  const youtube = videos.filter(
    (video) => video.site === 'YouTube' && /^(Trailer|Teaser)/i.test(video.type),
  )
  if (youtube.length === 0) return null
  // Prioriza los oficiales y los de mayor resolucionHD.
  const official = youtube.find((video) => video.official)
  const chosen = official ?? youtube[0]
  return chosen.key ?? null
}
/**
 * Peticion GET a TMDB con timeout y cancelacion.
 *
 * Lanza `AbortError` si se cancela y `Error` ante cualquier fallo de red o
 * credenciales, de modo que quien llama pueda recurrir siempre al respaldo.
 */
async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
  // Encadena la cancelacion externa con el timeout interno.
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort, { once: true })
  try {
    const url = `${API_BASE}${path}`
    const separator = url.includes('?') ? '&' : '?'
    const response = await fetch(`${url}${separator}api_key=${API_KEY}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      throw new Error(`TMDB ${response.status} en ${path}`)
    }
    return (await response.json()) as T
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', onAbort)
  }
}
/* ==========================================================================
   NORMALIZACION
   ========================================================================== */
/** Convierte un resultado crudo de TMDB en el tipo que pinta la interfaz. */
function toMediaItem(
  raw: TmdbMovieResult,
  mediaType: MediaType,
): MediaItem {
  const genreIds = raw.genre_ids ?? []
  const house = houseForGenres(genreIds)
  const date = mediaType === 'movie' ? raw.release_date : raw.first_air_date
  return {
    id: `${mediaType}-${raw.id}`,
    tmdbId: raw.id,
    mediaType,
    title: raw.title || raw.name || 'Sin titulo',
    originalTitle: raw.original_title,
    tagline: '',
    synopsis: raw.overview || 'La sinopsis de este hechizo sigue en el pergamino.',
    year: date ? Number(date.slice(0, 4)) : 0,
    durationMinutes: 0,
    score: Math.round((raw.vote_average ?? 0) * 10) / 10,
    house,
    category: house as CategoryId,
    genres: genreIds
      .map((genre) => GENRE_LABELS[genre])
      .filter((label): label is string => Boolean(label)),
    cast: [],
    poster: imageUrl(raw.poster_path, 'w342'),
    backdrop: imageUrl(raw.backdrop_path, 'w780'),
    trailerKey: null,
    badge: raw.vote_average && raw.vote_average >= 8 ? 'TOP' : undefined,
    sigil: HOUSES.find((item) => item.id === house)?.sigil,
  }
}
/* ==========================================================================
   ENDPOINTS
   ========================================================================== */
/** GET /trending/all/week — el hero y los destacados de la semana. */
export async function getTrending(
  signal?: AbortSignal,
): Promise<MediaItem[]> {
  const data = await request<TmdbListResponse<TmdbMovieResult>>(
    '/trending/all/week',
    signal,
  )
  return data.results
    .filter((item) => item.media_type !== 'person')
    .map((item) =>
      toMediaItem(item, (item.media_type as MediaType) ?? 'movie'),
    )
}
/**
 * GET /discover/movie | /discover/tv — catalogo por generos de una casa (OR).
 * TMDB une con `,` en AND; con `|` en OR, que es lo que quiere una casa:
 * Accion O Aventura O Fantasia. Ademas sanea IDs segun el medio porque varios
 * generos solo existen en un lado (ej. 10759 solo en TV, 28/14/878 solo en
 * cine): los traduce a su equivalente para no pedir discovers vacios.
 */
const TV_EQUIVALENTS: Record<number, number> = {
  28: 10759,
  12: 10759,
  14: 10765,
  10752: 10768,
  27: 9648,
  53: 80,
  878: 10765,
  36: 10768,
  10749: 18,
}
const MOVIE_EQUIVALENTS: Record<number, number> = {
  10759: 28,
  10765: 878,
  10768: 10752,
  10762: 10751,
}
/** Generos validos para el medio pedido, sin duplicados y sin vacios. */
export function genreIdsForMedia(genreIds: number[], mediaType: MediaType): number[] {
  const table = mediaType === 'tv' ? TV_EQUIVALENTS : MOVIE_EQUIVALENTS
  const mapped = genreIds.map((genre) => table[genre] ?? genre)
  return [...new Set(mapped)]
}
export async function discoverByGenre(
  genreIds: number[],
  mediaType: MediaType,
  page = 1,
  signal?: AbortSignal,
): Promise<MediaItem[]> {
  const path =
    mediaType === 'movie' ? '/discover/movie' : '/discover/tv'
  const valid = genreIdsForMedia(genreIds, mediaType)
  const data = await request<TmdbListResponse<TmdbMovieResult>>(
    `${path}?with_genres=${valid.join('|')}&sort_by=popularity.desc` +
      `&page=${page}&include_adult=false`,
    signal,
  )
  return data.results.map((item) => toMediaItem(item, mediaType))
}
/**
 * GET /search/multi — busqueda global de peliculas y series.
 * Filtra personas y filtra duplicados por id.
 */
export async function searchMulti(
  query: string,
  signal?: AbortSignal,
): Promise<MediaItem[]> {
  const data = await request<TmdbListResponse<TmdbMovieResult>>(
    `/search/multi?query=${encodeURIComponent(query)}` +
      '&include_adult=false&page=1',
    signal,
  )
  const seen = new Set<number>()
  const results: MediaItem[] = []
  for (const item of data.results) {
    if (item.media_type !== 'movie' && item.media_type !== 'tv') continue
    if (seen.has(item.id)) continue
    seen.add(item.id)
    results.push(toMediaItem(item, item.media_type))
  }
  return results
}
/**
 * GET /movie/{id}/videos y /tv/{id}/videos — trailer oficial de YouTube.
 * Se llama de forma perezosa, solo cuando el modal se abre.
 */
export async function getTrailerKey(
  tmdbId: number,
  mediaType: MediaType,
  signal?: AbortSignal,
): Promise<string | null> {
  try {
    const data = await request<TmdbVideoResponse>(
      `/${mediaType}/${tmdbId}/videos`,
      signal,
    )
    return pickTrailer(data.results ?? [])
  } catch {
    // Sin trailer no es un error fatal: el modal cae al recurso externo.
    return null
  }
}
/**
 * Amplia un item con los datos que la lista no trae: reparto, géneros reales,
 * lema, duración y temporadas. Se llama al abrir el modal, donde ya hay tiempo
 * de cargar. Una sola petición con `append_to_response=credits`.
 */
export async function getDetails(
  item: MediaItem,
  signal?: AbortSignal,
): Promise<MediaItem> {
  if (item.tmdbId === 0) return item
  try {
    const data = await request<{
      tagline?: string
      runtime?: number
      episode_run_time?: number[]
      number_of_seasons?: number
      genres?: TmdbGenre[]
      credits?: { cast?: TmdbCastMember[] }
    }>(`/${item.mediaType}/${item.tmdbId}?append_to_response=credits&language=es-ES`, signal)

    // Para series, TMDB reporta la duración por episodio en `episode_run_time`.
    const runtime =
      item.mediaType === 'movie'
        ? (data.runtime ?? item.durationMinutes)
        : (data.episode_run_time?.[0] ?? item.durationMinutes)

    return {
      ...item,
      tagline: data.tagline || item.tagline,
      durationMinutes: runtime,
      seasons: data.number_of_seasons ?? item.seasons,
      genres:
        data.genres && data.genres.length > 0
          ? data.genres.map((genre) => genre.name)
          : item.genres,
      cast: mapCast(data.credits?.cast ?? item.cast),
    }
  } catch {
    return item
  }
}
/** Extrae el id de los generos legibles de la respuesta de detalle. */
export function genresFromIds(ids: number[], known: TmdbGenre[] = []): string[] {
  const labels = ids.map((id) => GENRE_LABELS[id])
  if (labels.some(Boolean)) {
    return labels.filter((label): label is string => Boolean(label))
  }
  return known.map((genre) => genre.name)
}
/** Normaliza el reparto de una respuesta de detalle. */
function mapCast(cast: TmdbCastMember[]): MediaItem['cast'] {
  return cast.slice(0, 6).map((member) => ({
    name: member.name,
    character: member.character || 'El mismo',
  }))
}

/* ==========================================================================
   API DE ALTO NIVEL
   Cada funcion intenta TMDB y, si no hay clave o la llamada falla, devuelve el
   catalogo local. La UI nunca ve un error: siempre recibe una lista valida.
   ========================================================================== */

/* ==========================================================================
   API DE ALTO NIVEL
   Cada funcion intenta TMDB y, si no hay clave o la llamada falla, devuelve el
   catalogo local. La UI nunca ve un error: siempre recibe una lista valida.
   ========================================================================== */

/** Los destacados del catalogo local, para el hero. */
function featuredFallback(): MediaItem[] {
  const featured = FALLBACK_CATALOG.filter((item) => item.featured)
  return featured.length > 0 ? featured : FALLBACK_CATALOG.slice(0, 6)
}

/** Una casa del catalogo local, filtrada por tipo de medio. */
function fallbackRow(category: CategoryId, mediaType: MediaType): MediaItem[] {
  return FALLBACK_CATALOG.filter(
    (item) => item.category === category && item.mediaType === mediaType,
  )
}

/** Titulos destacados para el hero. */
export async function loadHero(signal?: AbortSignal): Promise<MediaItem[]> {
  if (!hasApiKey) return featuredFallback()
  try {
    const items = await getTrending(signal)
    // Necesitamos al menos un fondohd para el banner.
    return items.filter((item) => item.backdrop).slice(0, 12)
  } catch {
    return featuredFallback()
  }
}

/** Una fila del catalogo: discover de una casa, o respaldo local. */
export async function loadRow(
  category: CategoryId,
  mediaType: MediaType,
  signal?: AbortSignal,
): Promise<MediaItem[]> {
  if (!hasApiKey) return fallbackRow(category, mediaType)

  const house = HOUSES.find((item) => item.id === category)
  if (!house) return []

  try {
    const items = await discoverByGenre(house.genreIds, mediaType, 1, signal)
    return items.filter((item) => item.poster).slice(0, 24)
  } catch {
    return fallbackRow(category, mediaType)
  }
}

/** Busqueda global; sin clave, filtra el catalogo local en memoria. */
export async function search(query: string, signal?: AbortSignal): Promise<MediaItem[]> {
  const term = normalizeText(query)
  if (term.length < 2) return []

  if (!hasApiKey) {
    return FALLBACK_CATALOG.filter(
      (item) =>
        normalizeText(item.title).includes(term) ||
        normalizeText(item.synopsis).includes(term) ||
        item.genres.some((genre) => normalizeText(genre).includes(term)),
    ).slice(0, 24)
  }

  try {
    const items = await searchMulti(query, signal)
    return items.filter((item) => item.poster).slice(0, 24)
  } catch {
    return []
  }
}

/**
 * Resuelve el trailer de un item. Si TMDB no responde y el item viene del
 * catalogo local, ya trae su clave verificada, asi que no hay nada que hacer.
 */
export async function resolveTrailer(
  item: MediaItem,
  signal?: AbortSignal,
): Promise<string | null> {
  if (item.trailerKey) return item.trailerKey
  if (!hasApiKey || item.tmdbId === 0) return null
  return getTrailerKey(item.tmdbId, item.mediaType, signal)
}

