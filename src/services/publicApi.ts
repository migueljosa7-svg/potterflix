/**
 * PotterFlix / TVMaze — Servicio de catálogo 100% público y sin credenciales.
 * Fuente TVMaze REST (`https://api.tvmaze.com`): sin `api_key`, sin tokens,
 * CORS abierto, licencia CC BY-SA. Si la red falla o hay 429, fallback local.
 */
import type { CastMember, CategoryId, House, MediaItem } from '../types/tmdb'
import { FALLBACK_CATALOG } from '../data/fallbackCatalog'
import { HOUSES, PLACEHOLDER_IMAGE } from './tmdb'

const API_BASE = 'https://api.tvmaze.com'
export const hasPublicApi = true
const REQUEST_TIMEOUT = 9000

interface TvMazeImage { medium?: string | null; original?: string | null }
interface TvMazeRating { average?: number | null }
interface TvMazeCastEntry {
  person?: { name?: string | null } | null
  character?: { name?: string | null } | null
}
interface TvMazeShow {
  id: number
  name?: string | null
  genres?: string[] | null
  rating?: TvMazeRating | null
  image?: TvMazeImage | null
  summary?: string | null
  premiered?: string | null
  runtime?: number | null
  _embedded?: { cast?: TvMazeCastEntry[] | null } | null
}
interface TvMazeSearchResult { score?: number | null; show?: TvMazeShow | null }

const HOUSE_BY_TVGENRE: Array<{ match: RegExp; house: House }> = [
  { match: /horror|thriller|crime|mystery/i, house: 'slytherin' },
  { match: /science-?fiction|documentary|history/i, house: 'ravenclaw' },
  { match: /comedy|drama|family|romance|animation|children|anime/i, house: 'hufflepuff' },
  { match: /action|adventure|fantasy|war|western|superhero/i, house: 'gryffindor' },
]

function houseForTvGenres(genres: string[]): House {
  for (const genre of genres) {
    const hit = HOUSE_BY_TVGENRE.find((entry) => entry.match.test(genre))
    if (hit) return hit.house
  }
  return HOUSES[genres.length % HOUSES.length].id
}

function cleanSummary(summary: string | null | undefined): string {
  if (!summary) return 'La sinopsis de este hechizo sigue en el pergamino.'
  const text = summary
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  return text || 'La sinopsis de este hechizo sigue en el pergamino.'
}

function mapCast(cast: TvMazeCastEntry[]): CastMember[] {
  return cast.slice(0, 6).map((entry) => ({
    name: entry.person?.name ?? 'Desconocido',
    character: entry.character?.name ?? 'El mismo',
  }))
}

function toMediaItem(show: TvMazeShow): MediaItem {
  const genres = (show.genres ?? []).filter(Boolean)
  const house = houseForTvGenres(genres)
  const year = show.premiered ? Number(show.premiered.slice(0, 4)) : 0
  const score = Math.round(((show.rating?.average ?? 0) / 10) * 10) / 10
  const poster = show.image?.medium ?? show.image?.original ?? PLACEHOLDER_IMAGE
  const backdrop = show.image?.original ?? show.image?.medium ?? PLACEHOLDER_IMAGE
  return {
    id: `tv-${show.id}`, tmdbId: show.id, mediaType: 'tv',
    title: show.name ?? 'Sin título', tagline: '',
    synopsis: cleanSummary(show.summary),
    year: Number.isFinite(year) ? year : 0,
    durationMinutes: show.runtime ?? 0, score, house,
    category: house as CategoryId, genres, cast: mapCast(show._embedded?.cast ?? []),
    poster, backdrop, trailerKey: null,
    badge: (show.rating?.average ?? 0) >= 8 ? 'TOP' : undefined,
    sigil: HOUSES.find((item) => item.id === house)?.sigil,
  }
}

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort, { once: true })
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal, headers: { Accept: 'application/json' },
    })
    if (response.status === 429) {
      await new Promise((resolve) => window.setTimeout(resolve, 1200))
    }
    if (!response.ok) throw new Error(`TVMaze ${response.status} en ${path}`)
    return (await response.json()) as T
  } finally {
    window.clearTimeout(timeout)
    signal?.removeEventListener('abort', onAbort)
  }
}
function fallbackRow(category: CategoryId): MediaItem[] {
  return FALLBACK_CATALOG.filter((item) => item.category === category)
}

function featuredFallback(): MediaItem[] {
  const featured = FALLBACK_CATALOG.filter((item) => item.featured)
  return featured.length > 0 ? featured : FALLBACK_CATALOG.slice(0, 6)
}

const HOUSE_QUERIES: Record<CategoryId, string[]> = {
  gryffindor: ['avengers', 'harry potter', 'gladiator'],
  slytherin: ['breaking bad', 'peaky blinders', 'batman'],
  ravenclaw: ['dark', 'inception', 'stranger things'],
  hufflepuff: ['friends', 'ted lasso', 'pixar'],
};

export async function searchPublic(query: string, signal?: AbortSignal): Promise<MediaItem[]> {
  const term = query.trim()
  if (term.length < 2) return []
  try {
    const data = await fetchJson<TvMazeSearchResult[]>(
      `/search/shows?q=${encodeURIComponent(term)}`, signal,
    )
    const items = (data ?? [])
      .map((entry) => entry.show)
      .filter((show): show is TvMazeShow => Boolean(show?.id))
      .map(toMediaItem)
    if (items.length > 0) return items.slice(0, 24)
  } catch {
    // Cae al filtro local: cero errores en consola.
  }
  const needle = term.toLowerCase()
  return FALLBACK_CATALOG.filter(
    (item) =>
      item.title.toLowerCase().includes(needle) ||
      item.synopsis.toLowerCase().includes(needle) ||
      item.genres.some((genre) => genre.toLowerCase().includes(needle)),
  ).slice(0, 24)
}

export async function loadPublicHero(signal?: AbortSignal): Promise<MediaItem[]> {
  try {
    const batches = await Promise.all(
      ['harry potter', 'breaking bad', 'stranger things'].map((q) => searchPublic(q, signal)),
    )
    const seen = new Set<string>()
    const items: MediaItem[] = []
    for (const batch of batches) {
      for (const item of batch) {
        if (seen.has(item.id)) continue
        seen.add(item.id)
        items.push(item)
      }
    }
    const valid = items.filter((item) => item.backdrop).slice(0, 12)
    return valid.length > 0 ? valid : featuredFallback()
  } catch {
    return featuredFallback()
  }
}

export async function loadPublicRow(category: CategoryId, signal?: AbortSignal): Promise<MediaItem[]> {
  const queries = HOUSE_QUERIES[category] ?? [category]
  try {
    const batches = await Promise.all(queries.map((q) => searchPublic(q, signal)))
    const seen = new Set<string>()
    const items: MediaItem[] = []
    for (const batch of batches) {
      for (const item of batch) {
        if (item.category !== category || seen.has(item.id)) continue
        seen.add(item.id)
        items.push(item)
      }
    }
    if (items.length > 0) return items.slice(0, 24)
    const mixed = batches.flat().filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
    return (mixed.length > 0 ? mixed : fallbackRow(category)).slice(0, 24)
  } catch {
    return fallbackRow(category)
  }
}

export async function getPublicDetails(item: MediaItem, signal?: AbortSignal): Promise<MediaItem> {
  if (item.mediaType !== 'tv') return item
  try {
    const show = await fetchJson<TvMazeShow>(`/shows/${item.tmdbId}?embed=cast`, signal)
    const full = toMediaItem({ ...show, id: item.tmdbId })
    return {
      ...item,
      durationMinutes: full.durationMinutes || item.durationMinutes,
      genres: full.genres.length > 0 ? full.genres : item.genres,
      cast: full.cast.length > 0 ? full.cast : item.cast,
      poster: full.poster !== PLACEHOLDER_IMAGE ? full.poster : item.poster,
      backdrop: full.backdrop !== PLACEHOLDER_IMAGE ? full.backdrop : item.backdrop,
    }
  } catch {
    return item
  }
}
