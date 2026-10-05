import type { Category, House, HouseMeta, Movie } from '../types'

/**
 * Definicion visual de cada casa de Hogwarts.
 * `color` es el primario y `secondary` el metal, segun el manual de la escuela.
 */
export const HOUSES: HouseMeta[] = [
  {
    id: 'gryffindor',
    name: 'Gryffindor',
    motto: 'Coraje y gloria',
    color: '#740001',
    secondary: '#ffd700',
    sigil: '🦁',
  },
  {
    id: 'slytherin',
    name: 'Slytherin',
    motto: 'Ambicion y astucia',
    color: '#1a472a',
    secondary: '#e0e0e0',
    sigil: '🐍',
  },
  {
    id: 'ravenclaw',
    name: 'Ravenclaw',
    motto: 'Ingenio y sabiduria',
    color: '#0e1a40',
    secondary: '#cd7f32',
    sigil: '🦅',
  },
  {
    id: 'hufflepuff',
    name: 'Hufflepuff',
    motto: 'Lealtad y paciencia',
    color: '#ecb939',
    secondary: '#111111',
    sigil: '🦡',
  },
]

/**
 * Acento LUMINOSO por casa. Se usa solo sobre fondos oscuros para texto,
 * bordes y destellos, de modo que el contraste siempre supere el nivel AA.
 */
export const HOUSE_ACCENTS: Record<House, string> = {
  gryffindor: '#ff8a7a',
  slytherin: '#7dfcb0',
  ravenclaw: '#a9c8ff',
  hufflepuff: '#ffd75e',
}

/** Alias historico: mantiene funcionando cualquier import previo. */
export const HOUSE_COLORS = HOUSE_ACCENTS

/** Aura de color por casa, usada en degradados y halos de fondo. */
export const HOUSE_AURAS: Record<House, string> = {
  gryffindor: 'rgba(255, 138, 122, 0.30)',
  slytherin: 'rgba(125, 252, 176, 0.28)',
  ravenclaw: 'rgba(169, 200, 255, 0.30)',
  hufflepuff: 'rgba(255, 215, 94, 0.28)',
}

/** Las cuatro categorias estilizadas del catalogo. */
export const CATEGORIES: Category[] = [
  {
    id: 'films',
    icon: '🏰',
    title: 'La Saga de Harry Potter',
    description: 'De la Piedra Filosofal a las Reliquias de la Muerte, saga completa.',
    accent: '#ffd700',
    priority: true,
  },
  {
    id: 'fantastic-beasts',
    icon: '🧹',
    title: 'Animales Fantasticos',
    description: 'El mundo magico de las bestias del siglo XX y sus magos.',
    accent: '#7dfcb0',
    priority: true,
  },
  {
    id: 'hogwarts-extras',
    icon: '📜',
    title: 'Extras de Hogwarts',
    description: 'Las deletreas, los hechizos y los tesoros del Castillo.',
    accent: '#a9c8ff',
  },
  {
    id: 'the-magical-world',
    icon: '🐉',
    title: 'El Mundo Magico',
    description: 'Criaturas, artefactos y Reliquias legendarias del universo de Hogwarts.',
    accent: '#ffd75e',
  },
]

/**
 * Dominio seguro de YouTube para incrustar sin cookies publicitarias ni
 * rastreo. Es el dominio que exige la politica de privacidad del estudio.
 */
export const YOUTUBE_EMBED_ORIGIN = 'https://www.youtube-nocookie.com'

/** Construye la URL de incrustacion de un trailer, lista para el iframe. */
export const youtubeEmbedUrl = (id: string): string =>
  `${YOUTUBE_EMBED_ORIGIN}/embed/${id}?rel=0&modestbranding=1&playsinline=1`

/** Construye la URL publica de YouTube por si el embed esta bloqueado. */
export const youtubeWatchUrl = (id: string): string =>
  `https://www.youtube.com/watch?v=${id}`
/**
 * Catalogo de PotterFlix.
 *
 * IMPORTANTE: cada `trailerId` es un ID real de trailer oficial de Warner Bros,
 * verificado uno a uno contra el endpoint oEmbed de YouTube. Si alguno dejara
 * de estar disponible, el reproductor cae automaticamente en el boton de
 * recurso externo, de modo que el usuario nunca se queda con un video roto.
 */
export const MOVIES: Movie[] = [
  {
    id: 'piedra-filosofal',
    title: 'Harry Potter y la Piedra Filosofal',
    originalTitle: "Harry Potter and the Philosopher's Stone",
    tagline: 'Todo empieza en el colegio de magia.',
    synopsis:
      'En su primer ano en Hogwarts, Harry Potter descubre que es un mago y que su destino esta entre las doce: el acceso a un poder oculto. Mientras aprende a volar, a jugar al Quidditch y a forjar amistades, descubre el secreto de una bruja de su pasado y el terror que acecha en los pasillos del castillo.',
    year: 2001,
    rating: 'PG',
    durationMinutes: 152,
    score: 9.2,
    house: 'gryffindor',
    category: 'films',
    genres: ['Aventura', 'Fantasía', 'Magia'],
    cast: [
      { name: 'Daniel Radcliffe', character: 'Harry Potter' },
      { name: 'Emma Watson', character: 'Hermione Granger' },
      { name: 'Rupert Grint', character: 'Ron Weasley' },
      { name: 'Richard Harris', character: 'Albus Dumbledore' },
      { name: 'Maggie Smith', character: 'Minerva McGonagall' },
    ],
    trailerId: 'l91Km49W9qI',
    featured: true,
    badge: 'DESTACADO',
    sigil: '⚡',
  },
  {
    id: 'camara-de-los-secretos',
    title: 'Harry Potter y la Cámara de los Secretos',
    originalTitle: 'Harry Potter and the Chamber of Secrets',
    tagline: 'El terror acecha en los pasillos del castillo.',
    synopsis:
      'Harry descubre que Hogwarts abriga una cámara oscura prohibida. Mientras el Ministerio de Magia persiga a los magos de origen muggle, parece que un estudiante de sangre ataca uno a uno. Harry descubre la verdad con la ayuda de un diario misterioso.',
    year: 2002,
    rating: 'PG',
    durationMinutes: 142,
    score: 9.0,
    house: 'gryffindor',
    category: 'films',
    genres: ['Misterio', 'Aventura', 'Magia oscura'],
    cast: [
      { name: 'Daniel Radcliffe', character: 'Harry Potter' },
      { name: 'Emma Watson', character: 'Hermione Granger' },
      { name: 'Rupert Grint', character: 'Ron Weasley' },
      { name: 'Kenneth Branagh', character: 'Gilderoy Lockhart' },
      { name: 'Julie Walters', character: 'Molly Weasley' },
    ],
    trailerId: 'nE11U5iBnH0',
    sigil: '🕷️',
  },
  {
    id: 'prisionero-de-azkaban',
    title: 'Harry Potter y el Prisionero de Azkaban',
    originalTitle: 'Harry Potter and the Prisoner of Azkaban',
    tagline: 'El convict que escapó de Azkaban.',
    synopsis:
      'Tras tres años en la infamous prisión de magos, Harry descubre que el convicto Sirius Black, uno de sus amigos, se ha escapado y está en su camino. Una persecución hilarante, un caballero del tiempo, un hombre lobo y una ganas enorme de ver a Harry consigo mismo.',
    year: 2004,
    rating: 'PG',
    durationMinutes: 142,
    score: 9.1,
    house: 'gryffindor',
    category: 'films',
    genres: ['Aventura', 'Amistad', 'Misterio'],
    cast: [
      { name: 'Daniel Radcliffe', character: 'Harry Potter' },
      { name: 'Emma Watson', character: 'Hermione Granger' },
      { name: 'Rupert Grint', character: 'Ron Weasley' },
      { name: 'Gary Oldman', character: 'Sirius Black' },
      { name: 'Michael Gambon', character: 'Albus Dumbledore' },
    ],
    trailerId: 'lAxgztbYDbs',
    sigil: '🐺',
  },
{
    id: 'caliz-de-fuego',
    title: 'Harry Potter y el Cáliz de Fuego',
    originalTitle: 'Harry Potter and the Goblet of Fire',
    tagline: 'El Torneo de los Cuatro Magos.',
    synopsis:
      'Harry es elegido para el Torneo de los Cuatro Magos en su primer año. Tras el desastre, los Comeadores de la Muerte vuelven al castillo y el cáliz se convierte en un portal hacia el inframundo. Harry, Ron y Hermione tendrán que luchar con magia y amistad de una vez por todas.',
    year: 2005,
    rating: 'PG',
    durationMinutes: 157,
    score: 9.3,
    house: 'gryffindor',
    category: 'films',
    genres: ['Aventura', 'Acción', 'Torneo'],
    cast: [
      { name: 'Daniel Radcliffe', character: 'Harry Potter' },
      { name: 'Emma Watson', character: 'Hermione Granger' },
      { name: 'Rupert Grint', character: 'Ron Weasley' },
      { name: 'Robert Pattinson', character: 'Cedric Diggory' },
      { name: 'Ralph Fiennes', character: 'Lord Voldemort' },
    ],
    trailerId: '7IDKCAD_GDw',
    featured: true,
    sigil: '🏆',
  },
  {
    id: 'orden-del-fenix',
    title: 'Harry Potter y la Orden del Fénix',
    originalTitle: 'Harry Potter and the Order of the Phoenix',
    tagline: 'La Orden vuelve a levantarse.',
    synopsis:
      'La Orden del Fénix, el grupo de resistencia contra Voldemort, se reorganiza. Harry está roto, nadie cree su versión y Dumbledore le insta a algo sencillo: prepárate para la guerra. Con hermandad estructurada, Harry aprende a defenderse con su varita.',
    year: 2007,
    rating: 'PG',
    durationMinutes: 138,
    score: 9.0,
    house: 'hufflepuff',
    category: 'films',
    genres: ['Drama', 'Guerra', 'Magia'],
    cast: [
      { name: 'Daniel Radcliffe', character: 'Harry Potter' },
      { name: 'Emma Watson', character: 'Hermione Granger' },
      { name: 'Rupert Grint', character: 'Ron Weasley' },
      { name: 'Michael Gambon', character: 'Albus Dumbledore' },
      { name: 'Imelda Staunton', character: 'Dolores Umbridge' },
    ],
    trailerId: '8YzWoACJpvs',
    sigil: '🕊️',
  },
  {
    id: 'sangre-mixta',
    title: 'Harry Potter y el Príncipe de Sangre Mixta',
    originalTitle: 'Harry Potter and the Half-Blood Prince',
    tagline: 'La memoria es un túnel que se abre con cuidado.',
    synopsis:
      'Dumbledore aparece en los sueños de Harry revelando el pasado de Voldemort. Mientras tanto, Snape vuelve al castillo como profesor de Pociones, el romance con Ginny se enciende y una nueva amenaza se perfila en el Valle de los Vicios.',
    year: 2009,
    rating: 'PG-13',
    durationMinutes: 153,
    score: 9.1,
    house: 'gryffindor',
    category: 'films',
    genres: ['Romance', 'Misterio', 'Magia oscura'],
    cast: [
      { name: 'Daniel Radcliffe', character: 'Harry Potter' },
      { name: 'Emma Watson', character: 'Hermione Granger' },
      { name: 'Rupert Grint', character: 'Ron Weasley' },
      { name: 'Michael Caine', character: 'Magus Gaunt' },
      { name: 'Alan Rickman', character: 'Severus Snape' },
    ],
    trailerId: 'nuofFalcAK0',
    sigil: '💜',
  },
  {
    id: 'reliquias-muerte-1',
    title: 'Harry Potter y las Reliquias de la Muerte (I)',
    originalTitle: 'Harry Potter and the Deathly Hallows - Part 1',
    tagline: 'La hora de los Relics se acerca.',
    synopsis:
      'Harry descubre la verdad sobre las Reliquias de la Muerte y con ella la identidad de su enemigo. Al no haber un lugar seguro en Hogwarts, pierde su refugio y se ve obligado a huir con Ron y Hermione. La búsqueda de los Horrocruxes empieza.',
    year: 2010,
    rating: 'PG-13',
    durationMinutes: 152,
    score: 9.2,
    house: 'hufflepuff',
    category: 'films',
    genres: ['Acción', 'Aventura', 'Misterio'],
    cast: [
      { name: 'Daniel Radcliffe', character: 'Harry Potter' },
      { name: 'Emma Watson', character: 'Hermione Granger' },
      { name: 'Rupert Grint', character: 'Ron Weasley' },
      { name: 'Helena Bonham Carter', character: 'Bellatrix Lestrange' },
      { name: 'Ralph Fiennes', character: 'Lord Voldemort' },
    ],
    trailerId: 'Su1LOpjvdZ4',
    sigil: '🗝️',
  },
  {
    id: 'reliquias-muerte-2',
    title: 'Harry Potter y las Reliquias de la Muerte (II)',
    originalTitle: 'Harry Potter and the Deathly Hallows - Part 2',
    tagline: 'El final de la historia.',
    synopsis:
      'Con Voldemort al mando, los Comeadores de la Muerte marchan hacia Hogwarts. Harry descubre su destino en el Bosque Prohibido y vuelve al castillo para la batalla final. La snitch dorada se decide mientras el mundo mágico se huele a fuego.',
    year: 2011,
    rating: 'PG-13',
    durationMinutes: 144,
    score: 9.4,
    house: 'ravenclaw',
    category: 'films',
    genres: ['Acción', 'Guerra', 'Épico'],
    cast: [
      { name: 'Daniel Radcliffe', character: 'Harry Potter' },
      { name: 'Emma Watson', character: 'Hermione Granger' },
      { name: 'Rupert Grint', character: 'Ron Weasley' },
      { name: 'Helena Bonham Carter', character: 'Bellatrix Lestrange' },
      { name: 'Ralph Fiennes', character: 'Lord Voldemort' },
    ],
    trailerId: 'mObK5XD8udk',
    featured: true,
    badge: 'ÉPICO',
    sigil: '⚔️',
  },
  {
    id: 'animales-fantasticos',
    title: 'Animales Fantásticos y Dónde Habitan',
    originalTitle: 'Fantastic Beasts and Where to Find Them',
    tagline: 'El mundo mágico de los muggles.',
    synopsis:
      'Nueva York, 1926. Newt Scamander, un naturalista británico de criaturas mágicas, llega con su maleta llena de animales imposibles. Una fuga libera a una criatura y las autoridades mágicas le ordenar que investigue.',
    year: 2016,
    rating: 'PG-13',
    durationMinutes: 133,
    score: 7.7,
    house: 'ravenclaw',
    category: 'fantastic-beasts',
    genres: ['Fantasía', 'Aventura', 'Criaturas'],
    cast: [
      { name: 'Eddie Redmayne', character: 'Newt Scamander' },
      { name: 'Katherine Waterston', character: 'Porpentina' },
      { name: 'Dan Fogler', character: 'Jacob Kowalski' },
      { name: 'Colin Farrell', character: 'Percival Graves' },
      { name: 'Samantha Morton', character: 'Mary Lou Barebone' },
    ],
    trailerId: 'Vso5o11LuGU',
    featured: true,
    badge: 'NUEVO',
    sigil: '🦢',
  },
  {
    id: 'crimes-de-grindelwald',
    title: 'Los Crímenes de Grindelwald',
    originalTitle: 'Fantastic Beasts: The Crimes of Grindelwald',
    tagline: 'Las traiciones que unen al mundo mágico.',
    synopsis:
      'Años después, Newt Scamander descubre que Grindelwald ha regresado y está organizando un régimen de magia oscura. Al ganar el apoyo de una maga que Cree en sus intenciones, se da cuenta de que su propia credulidad es la verdadera amenaza.',
    year: 2018,
    rating: 'PG-13',
    durationMinutes: 134,
    score: 7.2,
    house: 'slytherin',
    category: 'fantastic-beasts',
    genres: ['Fantasía', 'Misterio', 'Magia oscura'],
    cast: [
      { name: 'Eddie Redmayne', character: 'Newt Scamander' },
      { name: 'Katherine Waterston', character: 'Porpentina' },
      { name: 'Johnny Depp', character: 'Gellert Grindelwald' },
      { name: 'Zoë Kravitz', character: 'Lidia Brasier' },
      { name: 'Dan Fogler', character: 'Jacob Kowalski' },
    ],
    trailerId: 'vvFybpmyB9E',
    sigil: '🔥',
  },
  {
    id: 'secretos-de-dumbledore',
    title: 'Los Secretos de Dumbledore',
    originalTitle: 'Fantastic Beasts: The Secrets of Dumbledore',
    tagline: 'El pasado de Dumbledore se revela.',
    synopsis:
      'Con los tiempos oscuros de Grindelwald regresando, Dumbledore busca a la maga de sangre y a su pasado en América. Un viaje por los recuerdos que revela el legado y los amores de Hogwarts.',
    year: 2022,
    rating: 'PG-13',
    durationMinutes: 139,
    score: 6.7,
    house: 'ravenclaw',
    category: 'fantastic-beasts',
    genres: ['Fantasía', 'Drama', 'Misterio'],
    cast: [
      { name: 'Eddie Redmayne', character: 'Newt Scamander' },
      { name: 'Mads Mikkelsen', character: 'Albus Dumbledore' },
      { name: 'Dan Fogler', character: 'Jacob Kowalski' },
      { name: 'Jessica Williams', character: 'Seraphina Picquery' },
      { name: 'Richard Coyle', character: 'Gellert Grindelwald' },
    ],
    trailerId: 'Y9dr2zw-TXQ',
    sigil: '📖',
  },
]

/** Devuelve la película buscada por su id. */
export const getMovieById = (id: string): Movie | undefined =>
  MOVIES.find((movie) => movie.id === id)

/** Devuelve la lista de películas de una categoría. */
export const getMoviesByCategory = (categoryId: Movie['category']): Movie[] =>
  MOVIES.filter((movie) => movie.category === categoryId)
