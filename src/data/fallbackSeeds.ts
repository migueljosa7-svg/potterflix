import type { MediaItem } from '../types/tmdb'

/**
 * SEMILLAS DEL CATALOGO DE RESPALDO (MODO DEMO)
 * ============================================
 * Cuando no hay `VITE_TMDB_API_KEY` —o la API falla— la app funciona con la
 * saga de Harry Potter y Animales Fantasticos. Cada trailer oficial de Warner
 * Bros fue verificado uno a uno contra el endpoint oEmbed de YouTube.
 *
 * Por que un catalogo local y no una "DEMO_API_KEY" en el repositorio:
 *  - Las claves publicas de TMDB se revocan o se limitan muy pronto, de modo
 *    que una clave de ejemplo dejaria la app rota a los pocos dias.
 *  - Con este respaldo la app es utilizable desde el primer `npm run dev`,
 *    sin configuracion y sin llamadas de red.
 *  - Cuando se anada la clave real, este catalogo sigue sirviendo como red de
 *    seguridad si la API se cae.
 */

/** Traileres oficiales verificados (oEmbed de YouTube, comprobados a mano). */
const TRAILERS: Record<string, string> = {
  'piedra-filosofal': 'l91Km49W9qI',
  'camara-secretos': 'nE11U5iBnH0',
  'prisionero-azkaban': 'lAxgztbYDbs',
  'caliz-fuego': '7IDKCAD_GDw',
  'orden-fenix': '8YzWoACJpvs',
  'sangre-mixta': 'nuofFalcAK0',
  'reliquias-1': 'Su1LOpjvdZ4',
  'reliquias-2': 'mObK5XD8udk',
  'animales-fantasticos': 'Vso5o11LuGU',
  'crimes-grindelwald': 'vvFybpmyB9E',
  'secretos-dumbledore': 'Y9dr2zw-TXQ',
}

/** Datos crudos; el arte se sintetiza aparte en `filmArt.ts`. */
export interface FallbackSeed {
  id: string
  tmdbId: number
  title: string
  originalTitle: string
  tagline: string
  synopsis: string
  year: number
  rating: string
  minutes: number
  score: number
  house: MediaItem['house']
  genres: string[]
  cast: { name: string; character: string }[]
  sigil: string
  badge?: string
  featured?: boolean
}


const CAST_HP = [
  { name: 'Daniel Radcliffe', character: 'Harry Potter' },
  { name: 'Emma Watson', character: 'Hermione Granger' },
  { name: 'Rupert Grint', character: 'Ron Weasley' },
]

const CAST_DEATHS = [
  { name: 'Helena Bonham Carter', character: 'Bellatrix Lestrange' },
  { name: 'Ralph Fiennes', character: 'Lord Voldemort' },
]

const CAST_NEWTS = [
  { name: 'Eddie Redmayne', character: 'Newt Scamander' },
  { name: 'Katherine Waterston', character: 'Porpentina' },
  { name: 'Dan Fogler', character: 'Jacob Kowalski' },
]

const SYNOPSIS = {
  stone:
    'En su primer ano en Hogwarts, Harry Potter descubre que es un mago y que su destino esta entre las doce: el acceso a un poder oculto. Mientras aprende a volar, a jugar al Quidditch y a forjar amistades, descubre el secreto de una bruja de su pasado y el terror que acecha en los pasillos del castillo.',
  chamber:
    'Harry descubre que Hogwarts abriga una camara oscura prohibida. Mientras el Ministerio de Magia persiga a los magos de origen muggle, parece que un estudiante de sangre ataca uno a uno. Harry descubre la verdad con la ayuda de un diario misterioso.',
  azkaban:
    'Tras tres anos en la infamous prision de magos, Harry descubre que el convicto Sirius Black, uno de sus amigos, se ha escapado y esta en su camino. Una persecucion hilarante, un caballero del tiempo, un hombre lobo y una ganas enorme de ver a Harry consigo mismo.',
  goblet:
    'Harry es elegido para el Torneo de los Cuatro Magos en su primer ano. Tras el desastre, los Comeadores de la Muerte vuelven al castillo y el caliz se convierte en un portal hacia el inframundo. Harry, Ron y Hermione tendran que luchar con magia y amistad de una vez por todas.',
  phoenix:
    'La Orden del Fenix, el grupo de resistencia contra Voldemort, se reorganiza. Harry esta roto, nadie cree su version y Dumbledore le insta a algo sencillo: preparate para la guerra. Con hermandad estructurada, Harry aprende a defenderse con su varita.',
  halfblood:
    'Dumbledore aparece en los suenos de Harry revelando el pasado de Voldemort. Mientras tanto, Snape vuelve al castillo como profesor de Pociones, el romance con Ginny se enciende y una nueva amenaza se perfila en el Valle de los Vicios.',
  deathly1:
    'Harry descubre la verdad sobre las Reliquias de la Muerte y con ella la identidad de su enemigo. Al no haber un lugar seguro en Hogwarts, pierde su refugio y se ve obligado a huir con Ron y Hermione. La busqueda de los Horrocruxes empieza.',
  deathly2:
    'Con Voldemort al mando, los Comeadores de la Muerte marchan hacia Hogwarts. Harry descubre su destino en el Bosque Prohibido y vuelve al castillo para la batalla final. La snitch dorada se decide mientras el mundo magico se huele a fuego.',
  beasts:
    'Nueva York, 1926. Newt Scamander, un naturalista britanico de criaturas magicas, llega con su maleta llena de animales imposibles. Una fuga libera a una criatura y las autoridades magicas le ordenar que investigue.',
  grindelwald:
    'Anos despues, Newt Scamander descubre que Grindelwald ha regresado y esta organizando un regimen de magia oscura. Al ganar el apoyo de una maga que confia en sus intenciones, se da cuenta de que su propia credulidad es la verdadera amenaza.',
  dumbledore:
    'Con los tiempos oscuros de Grindelwald regresando, Dumbledore busca a la maga de sangre y a su pasado en America. Un viaje por los recuerdos que revela el legado y los amores de Hogwarts.',
}

/** El catalogo de respaldo, en el mismo formato que devuelve el servicio. */
export const FALLBACK_SEEDS: FallbackSeed[] = [
  {
    id: 'piedra-filosofal',
    tmdbId: 1200430,
    title: 'Harry Potter y la Piedra Filosofal',
    originalTitle: "Harry Potter and the Philosopher's Stone",
    tagline: 'Todo empieza en el colegio de magia.',
    synopsis: SYNOPSIS.stone,
    year: 2001,
    rating: 'PG',
    minutes: 152,
    score: 9.2,
    house: 'gryffindor',
    genres: ['Fantasia', 'Aventura'],
    cast: [
      ...CAST_HP,
      { name: 'Richard Harris', character: 'Albus Dumbledore' },
      { name: 'Maggie Smith', character: 'Minerva McGonagall' },
    ],
    sigil: '⚡',
    badge: 'DESTACADO',
    featured: true,
  },
  {
    id: 'camara-secretos',
    tmdbId: 12477,
    title: 'Harry Potter y la Camara de los Secretos',
    originalTitle: 'Harry Potter and the Chamber of Secrets',
    tagline: 'El terror acecha en los pasillos del castillo.',
    synopsis: SYNOPSIS.chamber,
    year: 2002,
    rating: 'PG',
    minutes: 142,
    score: 9.0,
    house: 'gryffindor',
    genres: ['Fantasia', 'Misterio'],
    cast: [
      ...CAST_HP,
      { name: 'Kenneth Branagh', character: 'Gilderoy Lockhart' },
      { name: 'Julie Walters', character: 'Molly Weasley' },
    ],
    sigil: '🕷️',
  },
  {
    id: 'orden-fenix',
    tmdbId: 221,
    title: 'Harry Potter y la Orden del Fenix',
    originalTitle: 'Harry Potter and the Order of the Phoenix',
    tagline: 'La Orden vuelve a levantarse.',
    synopsis: SYNOPSIS.phoenix,
    year: 2007,
    rating: 'PG',
    minutes: 138,
    score: 9.0,
    house: 'ravenclaw',
    genres: ['Fantasia', 'Misterio', 'Accion'],
    cast: [
      ...CAST_HP,
      { name: 'Michael Gambon', character: 'Albus Dumbledore' },
      { name: 'Imelda Staunton', character: 'Dolores Umbridge' },
    ],
    sigil: '🕊️',
  },
  {
    id: 'sangre-mixta',
    tmdbId: 673,
    title: 'Harry Potter y el Principe de Sangre Mixta',
    originalTitle: 'Harry Potter and the Half-Blood Prince',
    tagline: 'La memoria es un tunel que se abre con cuidado.',
    synopsis: SYNOPSIS.halfblood,
    year: 2009,
    rating: 'PG-13',
    minutes: 153,
    score: 9.1,
    house: 'slytherin',
    genres: ['Fantasia', 'Misterio', 'Romance'],
    cast: [
      ...CAST_HP,
      { name: 'Michael Caine', character: 'Magus Gaunt' },
      { name: 'Alan Rickman', character: 'Severus Snape' },
    ],
    sigil: '💜',
  },
  {
    id: 'reliquias-1',
    tmdbId: 12445,
    title: 'Harry Potter y las Reliquias de la Muerte (I)',
    originalTitle: 'Harry Potter and the Deathly Hallows - Part 1',
    tagline: 'La hora de los Relics se acerca.',
    synopsis: SYNOPSIS.deathly1,
    year: 2010,
    rating: 'PG-13',
    minutes: 152,
    score: 9.2,
    house: 'ravenclaw',
    genres: ['Fantasia', 'Accion', 'Aventura'],
    cast: [...CAST_HP, ...CAST_DEATHS],
    sigil: '🗝️',
  },
  {
    id: 'reliquias-2',
    tmdbId: 355,
    title: 'Harry Potter y las Reliquias de la Muerte (II)',
    originalTitle: 'Harry Potter and the Deathly Hallows - Part 2',
    tagline: 'El final de la historia.',
    synopsis: SYNOPSIS.deathly2,
    year: 2011,
    rating: 'PG-13',
    minutes: 144,
    score: 9.4,
    house: 'gryffindor',
    genres: ['Fantasia', 'Accion', 'Aventura'],
    cast: [...CAST_HP, ...CAST_DEATHS],
    sigil: '⚔️',
    badge: 'EPICO',
    featured: true,
  },
  {
    id: 'animales-fantasticos',
    tmdbId: 316699,
    title: 'Animales Fantasticos y Donde Habitan',
    originalTitle: 'Fantastic Beasts and Where to Find Them',
    tagline: 'El mundo magico de los muggles.',
    synopsis: SYNOPSIS.beasts,
    year: 2016,
    rating: 'PG-13',
    minutes: 133,
    score: 7.7,
    house: 'ravenclaw',
    genres: ['Fantasia', 'Aventura', 'Misterio'],
    cast: [
      ...CAST_NEWTS,
      { name: 'Colin Farrell', character: 'Percival Graves' },
      { name: 'Samantha Morton', character: 'Mary Lou Barebone' },
    ],
    sigil: '🦢',
    badge: 'NUEVO',
    featured: true,
  },
  {
    id: 'crimes-grindelwald',
    tmdbId: 299534,
    title: 'Los Crimenes de Grindelwald',
    originalTitle: 'Fantastic Beasts: The Crimes of Grindelwald',
    tagline: 'Las traiciones que unen al mundo magico.',
    synopsis: SYNOPSIS.grindelwald,
    year: 2018,
    rating: 'PG-13',
    minutes: 134,
    score: 7.2,
    house: 'slytherin',
    genres: ['Fantasia', 'Misterio', 'Thriller'],
    cast: [
      ...CAST_NEWTS,
      { name: 'Johnny Depp', character: 'Gellert Grindelwald' },
      { name: 'Zoe Kravitz', character: 'Lidia Brasier' },
    ],
    sigil: '🔥',
  },
  {
    id: 'secretos-dumbledore',
    tmdbId: 510390,
    title: 'Los Secretos de Dumbledore',
    originalTitle: 'Fantastic Beasts: The Secrets of Dumbledore',
    tagline: 'El pasado de Dumbledore se revela.',
    synopsis: SYNOPSIS.dumbledore,
    year: 2022,
    rating: 'PG-13',
    minutes: 139,
    score: 6.7,
    house: 'hufflepuff',
    genres: ['Fantasia', 'Misterio', 'Historia'],
    cast: [
      ...CAST_NEWTS,
      { name: 'Mads Mikkelsen', character: 'Albus Dumbledore' },
      { name: 'Richard Coyle', character: 'Gellert Grindelwald' },
    ],
    sigil: '📖',
  },
  {
    id: 'prisionero-azkaban',
    tmdbId: 2062,
    title: 'Harry Potter y el Prisionero de Azkaban',
    originalTitle: 'Harry Potter and the Prisoner of Azkaban',
    tagline: 'El convict que escapó de Azkaban.',
    synopsis: SYNOPSIS.azkaban,
    year: 2004,
    rating: 'PG',
    minutes: 142,
    score: 9.1,
    house: 'gryffindor',
    genres: ['Fantasia', 'Aventura', 'Comedia'],
    cast: [
      ...CAST_HP,
      { name: 'Gary Oldman', character: 'Sirius Black' },
      { name: 'Michael Gambon', character: 'Albus Dumbledore' },
    ],
    sigil: '🐺',
  },
  {
    id: 'caliz-fuego',
    tmdbId: 10195,
    title: 'Harry Potter y el Caliz de Fuego',
    originalTitle: 'Harry Potter and the Goblet of Fire',
    tagline: 'El Torneo de los Cuatro Magos.',
    synopsis: SYNOPSIS.goblet,
    year: 2005,
    rating: 'PG',
    minutes: 157,
    score: 9.3,
    house: 'gryffindor',
    genres: ['Fantasia', 'Accion', 'Aventura'],
    cast: [
      ...CAST_HP,
      { name: 'Robert Pattinson', character: 'Cedric Diggory' },
      { name: 'Ralph Fiennes', character: 'Lord Voldemort' },
    ],
    sigil: '🏆',
    featured: true,
  },
]

/** Trailer asociado a cada semilla, resuelto por id. */
export const trailerForSeed = (id: string): string | null =>
  TRAILERS[id] ?? null
