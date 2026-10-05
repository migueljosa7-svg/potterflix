import type { Movie } from '../types'
import { HOUSE_ACCENTS, HOUSES } from './mockMovies'

/**
 * Generador de arte procedural para los cromos de Hogwarts.
 *
 * Por que NO usamos imagenes externas:
 *  - Los posters oficiales estan bajo derechos de autor y sus CDN bloquean o
 *    restringen el hotlinking, lo que produce imagenes rotas.
 *  - Un SVG generado en el cliente pesa menos de 1 KB, no hace peticiones de
 *    red, no provoca layout shift (CLS) y nunca puede fallar.
 *
 * El resultado es un cartel gotico con escudo de la casa, filigrana dorada,
 * runas y el titulo de la pelicula. Si mas adelante se anaden posters reales
 * al catalogo, `Movie.poster` / `Movie.backdrop` tienen prioridad sobre esto.
 */

/** PRNG determinista: la misma semilla produce siempre el mismo cartel. */
export function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0xffffffff
  }
}

/** Convierte una cadena en una semilla numérica estable. */
export function hashSeed(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Escapa caracteres especiales para poder incrustar texto en el SVG. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Divide un titulo en lineas cortas que caben en el ancho del poster. */
export function wrapTitle(title: string, maxChars: number): string[] {
  const words = title.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? current + ' ' + word : word
    if (candidate.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

/** Devuelve el color de acento luminoso de la casa a la que pertenece. */
export function accentFor(movie: Movie): string {
  return HOUSE_ACCENTS[movie.house]
}

/** Devuelve los datos de la casa a la que pertenece la pelicula. */
export function houseFor(movie: Movie) {
  return HOUSES.find((item) => item.id === movie.house)
}

/** Empaqueta un SVG en un data-URI listo para el atributo `src`. */
export function toDataUri(svg: string): string {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

/**
 * Genera el data-URI SVG de un póster vertical con estética de cromo mágico:
 * pergamino oscuro, filigrana dorada, escudo de la casa y runas encendidas.
 */
export function generatePoster(movie: Movie, width = 600, height = 900): string {
  const random = seededRandom(hashSeed(movie.id))
  const accent = accentFor(movie)
  const house = houseFor(movie)
  const sigil = movie.sigil ?? house?.sigil ?? '✦'
  const titleLines = wrapTitle(movie.title.toUpperCase(), 16)

  let stars = ''
  for (let i = 0; i < 70; i += 1) {
    const x = (random() * width).toFixed(1)
    const y = (random() * height).toFixed(1)
    const r = (random() * 1.7 + 0.3).toFixed(2)
    const o = (random() * 0.55 + 0.12).toFixed(2)
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff3c4" opacity="${o}"/>`
  }

  const runes = Array.from({ length: 9 }, (_, i) => {
    const angle = (i / 9) * Math.PI * 2 - Math.PI / 2
    const radius = 168 + random() * 16
    const x = (width / 2 + Math.cos(angle) * radius).toFixed(1)
    const y = (height / 2 - 96 + Math.sin(angle) * radius).toFixed(1)
    const glyph = ['ᚠ', 'ᚱ', 'ᚨ', 'ᛉ', 'ᛟ', 'ᛞ', 'ᛒ', 'ᛖ', 'ᛋ'][i]
    return (
      `<text x="${x}" y="${y}" fill="${accent}" opacity="0.5" font-size="20" ` +
      `font-family="Georgia, serif" text-anchor="middle">${glyph}</text>`
    )
  }).join('')

  const titleMarkup = titleLines
    .map(
      (line, index) =>
        `<text x="${width / 2}" y="${height - 150 + index * 34}" fill="#ffe9a8" ` +
        `font-size="30" font-weight="700" font-family="Cinzel, Georgia, serif" ` +
        `text-anchor="middle" letter-spacing="1.5" ` +
        `style="paint-order:stroke;stroke:#160f0a;stroke-width:6">${escapeXml(line)}</text>`,
    )
    .join('')

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    '<defs>' +
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#1e1630"/><stop offset="45%" stop-color="#13101d"/>' +
    '<stop offset="100%" stop-color="#0a0810"/></linearGradient>' +
    '<radialGradient id="glow" cx="50%" cy="38%" r="52%">' +
    `<stop offset="0%" stop-color="${accent}" stop-opacity="0.5"/>` +
    `<stop offset="100%" stop-color="${accent}" stop-opacity="0"/></radialGradient>` +
    '<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#fff3c4"/><stop offset="50%" stop-color="#d4af37"/>' +
    '<stop offset="100%" stop-color="#8c6f1f"/></linearGradient>' +
    '<filter id="soft"><feGaussianBlur stdDeviation="16"/></filter>' +
    '</defs>' +
    `<rect width="${width}" height="${height}" fill="url(#sky)"/>` +
    stars +
    `<rect width="${width}" height="${height}" fill="url(#glow)"/>` +
    `<circle cx="${width / 2}" cy="${height / 2 - 96}" r="210" fill="${accent}" opacity="0.16" filter="url(#soft)"/>` +
    runes +
    `<rect x="16" y="16" width="${width - 32}" height="${height - 32}" fill="none" stroke="url(#gold)" stroke-width="5"/>` +
    `<rect x="31" y="31" width="${width - 62}" height="${height - 62}" fill="none" stroke="url(#gold)" stroke-width="1.6" opacity="0.75"/>` +
    '<g fill="url(#gold)">' +
    '<path d="M16 78 L16 16 L78 16 L78 30 L30 30 L30 78 Z"/>' +
    `<path d="M${width - 16} 78 L${width - 16} 16 L${width - 78} 16 L${width - 78} 30 L${width - 30} 30 L${width - 30} 78 Z"/>` +
    `<path d="M16 ${height - 78} L16 ${height - 16} L78 ${height - 16} L78 ${height - 30} L30 ${height - 30} L30 ${height - 78} Z"/>` +
    `<path d="M${width - 16} ${height - 78} L${width - 16} ${height - 16} L${width - 78} ${height - 16} L${width - 78} ${height - 30} L${width - 30} ${height - 30} L${width - 30} ${height - 78} Z"/>` +
    '</g>' +
    `<g transform="translate(${width / 2} ${height / 2 - 110})">` +
    '<path d="M0 -170 L126 -126 L126 22 Q126 124 0 176 Q-126 124 -126 22 L-126 -126 Z" ' +
    'fill="#130f1d" stroke="url(#gold)" stroke-width="6"/>' +
    `<path d="M0 -146 L104 -108 L104 16 Q104 104 0 150 Q-104 104 -104 16 L-104 -108 Z" ` +
    `fill="none" stroke="${accent}" stroke-width="1.6" opacity="0.65"/>` +
    `<path d="M-104 -108 L104 -108 L104 -14 L0 28 L-104 -14 Z" fill="${accent}" opacity="0.26"/>` +
    `<text x="0" y="14" font-size="84" text-anchor="middle" font-family="Segoe UI Emoji, sans-serif">${sigil}</text>` +
    `<path d="M-66 74 L0 42 L66 74 L66 94 L0 62 L-66 94 Z" fill="none" stroke="url(#gold)" stroke-width="2.4" opacity="0.9"/>` +
    '<text x="0" y="126" font-size="23" letter-spacing="3.5" text-anchor="middle" ' +
    `fill="#ffe9a8" font-family="Cinzel, Georgia, serif">${escapeXml((house?.name ?? '').toUpperCase())}</text>` +
    '</g>' +
    `<rect x="44" y="${height - 210}" width="${width - 88}" height="${titleLines.length * 34 + 40}" ` +
    'fill="#170f09" opacity="0.86" stroke="url(#gold)" stroke-width="2" rx="8"/>' +
    titleMarkup +
    `<text x="${width / 2}" y="${height - 42}" fill="${accent}" font-size="18" letter-spacing="5" ` +
    'text-anchor="middle" font-family="Cinzel, Georgia, serif">' +
    `${escapeXml(String(movie.year))} · ${escapeXml(movie.rating)}</text>` +
    '</svg>'

  return toDataUri(svg)
}

/** Genera un fondo panoramico 16:9 con la silueta del castillo a contraluz. */
export function generateBackdrop(movie: Movie, width = 1600, height = 900): string {
  const random = seededRandom(hashSeed(movie.id + '-bg'))
  const accent = accentFor(movie)

  let dust = ''
  for (let i = 0; i < 110; i += 1) {
    const x = (random() * width).toFixed(1)
    const y = (random() * height).toFixed(1)
    const r = (random() * 2.6 + 0.5).toFixed(2)
    const o = (random() * 0.45 + 0.08).toFixed(2)
    dust += `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffe9a8" opacity="${o}"/>`
  }

  const towers = Array.from({ length: 9 }, (_, index) => {
    const x = 80 + index * 172
    const h = Math.round(180 + random() * 260)
    const w = Math.round(56 + random() * 44)
    const base = height - h
    return (
      `<rect x="${x}" y="${base}" width="${w}" height="${h}" fill="#06050b" opacity="0.92"/>` +
      `<path d="M${x - 9} ${base} L${x + w / 2} ${base - 54} L${x + w + 9} ${base} Z" fill="#06050b" opacity="0.92"/>`
    )
  }).join('')

  let windows = ''
  for (let i = 0; i < 34; i += 1) {
    const x = Math.round(random() * width)
    const y = Math.round(height - 70 - random() * 430)
    const o = (random() * 0.5 + 0.16).toFixed(2)
    windows += `<rect x="${x}" y="${y}" width="9" height="14" rx="2" fill="#ffd75e" opacity="${o}"/>`
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    '<defs>' +
    '<linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#271b39"/><stop offset="55%" stop-color="#160f24"/>' +
    '<stop offset="100%" stop-color="#08060d"/></linearGradient>' +
    '<radialGradient id="mglow" cx="64%" cy="36%" r="58%">' +
    `<stop offset="0%" stop-color="${accent}" stop-opacity="0.45"/>` +
    `<stop offset="100%" stop-color="${accent}" stop-opacity="0"/></radialGradient>` +
    '</defs>' +
    `<rect width="${width}" height="${height}" fill="url(#nsky)"/>` +
    dust +
    `<rect width="${width}" height="${height}" fill="url(#mglow)"/>` +
    towers +
    windows +
    '</svg>'

  return toDataUri(svg)
}

/** Devuelve el poster de la pelicula, priorizando una URL real si existe. */
export function posterFor(movie: Movie): string {
  return movie.poster ?? generatePoster(movie)
}

/** Devuelve el fondo de la pelicula, priorizando una URL real si existe. */
export function backdropFor(movie: Movie): string {
  return movie.backdrop ?? generateBackdrop(movie)
}
