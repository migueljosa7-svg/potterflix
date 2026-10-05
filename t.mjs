// src/data/fallbackSeeds.ts
var TRAILERS = {
  "piedra-filosofal": "l91Km49W9qI",
  "camara-secretos": "nE11U5iBnH0",
  "prisionero-azkaban": "lAxgztbYDbs",
  "caliz-fuego": "7IDKCAD_GDw",
  "orden-fenix": "8YzWoACJpvs",
  "sangre-mixta": "nuofFalcAK0",
  "reliquias-1": "Su1LOpjvdZ4",
  "reliquias-2": "mObK5XD8udk",
  "animales-fantasticos": "Vso5o11LuGU",
  "crimes-grindelwald": "vvFybpmyB9E",
  "secretos-dumbledore": "Y9dr2zw-TXQ"
};
var CAST_HP = [
  { name: "Daniel Radcliffe", character: "Harry Potter" },
  { name: "Emma Watson", character: "Hermione Granger" },
  { name: "Rupert Grint", character: "Ron Weasley" }
];
var CAST_DEATHS = [
  { name: "Helena Bonham Carter", character: "Bellatrix Lestrange" },
  { name: "Ralph Fiennes", character: "Lord Voldemort" }
];
var CAST_NEWTS = [
  { name: "Eddie Redmayne", character: "Newt Scamander" },
  { name: "Katherine Waterston", character: "Porpentina" },
  { name: "Dan Fogler", character: "Jacob Kowalski" }
];
var SYNOPSIS = {
  stone: "En su primer ano en Hogwarts, Harry Potter descubre que es un mago y que su destino esta entre las doce: el acceso a un poder oculto. Mientras aprende a volar, a jugar al Quidditch y a forjar amistades, descubre el secreto de una bruja de su pasado y el terror que acecha en los pasillos del castillo.",
  chamber: "Harry descubre que Hogwarts abriga una camara oscura prohibida. Mientras el Ministerio de Magia persiga a los magos de origen muggle, parece que un estudiante de sangre ataca uno a uno. Harry descubre la verdad con la ayuda de un diario misterioso.",
  azkaban: "Tras tres anos en la infamous prision de magos, Harry descubre que el convicto Sirius Black, uno de sus amigos, se ha escapado y esta en su camino. Una persecucion hilarante, un caballero del tiempo, un hombre lobo y una ganas enorme de ver a Harry consigo mismo.",
  goblet: "Harry es elegido para el Torneo de los Cuatro Magos en su primer ano. Tras el desastre, los Comeadores de la Muerte vuelven al castillo y el caliz se convierte en un portal hacia el inframundo. Harry, Ron y Hermione tendran que luchar con magia y amistad de una vez por todas.",
  phoenix: "La Orden del Fenix, el grupo de resistencia contra Voldemort, se reorganiza. Harry esta roto, nadie cree su version y Dumbledore le insta a algo sencillo: preparate para la guerra. Con hermandad estructurada, Harry aprende a defenderse con su varita.",
  halfblood: "Dumbledore aparece en los suenos de Harry revelando el pasado de Voldemort. Mientras tanto, Snape vuelve al castillo como profesor de Pociones, el romance con Ginny se enciende y una nueva amenaza se perfila en el Valle de los Vicios.",
  deathly1: "Harry descubre la verdad sobre las Reliquias de la Muerte y con ella la identidad de su enemigo. Al no haber un lugar seguro en Hogwarts, pierde su refugio y se ve obligado a huir con Ron y Hermione. La busqueda de los Horrocruxes empieza.",
  deathly2: "Con Voldemort al mando, los Comeadores de la Muerte marchan hacia Hogwarts. Harry descubre su destino en el Bosque Prohibido y vuelve al castillo para la batalla final. La snitch dorada se decide mientras el mundo magico se huele a fuego.",
  beasts: "Nueva York, 1926. Newt Scamander, un naturalista britanico de criaturas magicas, llega con su maleta llena de animales imposibles. Una fuga libera a una criatura y las autoridades magicas le ordenar que investigue.",
  grindelwald: "Anos despues, Newt Scamander descubre que Grindelwald ha regresado y esta organizando un regimen de magia oscura. Al ganar el apoyo de una maga que confia en sus intenciones, se da cuenta de que su propia credulidad es la verdadera amenaza.",
  dumbledore: "Con los tiempos oscuros de Grindelwald regresando, Dumbledore busca a la maga de sangre y a su pasado en America. Un viaje por los recuerdos que revela el legado y los amores de Hogwarts."
};
var FALLBACK_SEEDS = [
  {
    id: "piedra-filosofal",
    tmdbId: 1200430,
    title: "Harry Potter y la Piedra Filosofal",
    originalTitle: "Harry Potter and the Philosopher's Stone",
    tagline: "Todo empieza en el colegio de magia.",
    synopsis: SYNOPSIS.stone,
    year: 2001,
    rating: "PG",
    minutes: 152,
    score: 9.2,
    house: "gryffindor",
    genres: ["Fantasia", "Aventura"],
    cast: [
      ...CAST_HP,
      { name: "Richard Harris", character: "Albus Dumbledore" },
      { name: "Maggie Smith", character: "Minerva McGonagall" }
    ],
    sigil: "\u26A1",
    badge: "DESTACADO",
    featured: true
  },
  {
    id: "camara-secretos",
    tmdbId: 12477,
    title: "Harry Potter y la Camara de los Secretos",
    originalTitle: "Harry Potter and the Chamber of Secrets",
    tagline: "El terror acecha en los pasillos del castillo.",
    synopsis: SYNOPSIS.chamber,
    year: 2002,
    rating: "PG",
    minutes: 142,
    score: 9,
    house: "gryffindor",
    genres: ["Fantasia", "Misterio"],
    cast: [
      ...CAST_HP,
      { name: "Kenneth Branagh", character: "Gilderoy Lockhart" },
      { name: "Julie Walters", character: "Molly Weasley" }
    ],
    sigil: "\u{1F577}\uFE0F"
  },
  {
    id: "orden-fenix",
    tmdbId: 221,
    title: "Harry Potter y la Orden del Fenix",
    originalTitle: "Harry Potter and the Order of the Phoenix",
    tagline: "La Orden vuelve a levantarse.",
    synopsis: SYNOPSIS.phoenix,
    year: 2007,
    rating: "PG",
    minutes: 138,
    score: 9,
    house: "ravenclaw",
    genres: ["Fantasia", "Misterio", "Accion"],
    cast: [
      ...CAST_HP,
      { name: "Michael Gambon", character: "Albus Dumbledore" },
      { name: "Imelda Staunton", character: "Dolores Umbridge" }
    ],
    sigil: "\u{1F54A}\uFE0F"
  },
  {
    id: "sangre-mixta",
    tmdbId: 673,
    title: "Harry Potter y el Principe de Sangre Mixta",
    originalTitle: "Harry Potter and the Half-Blood Prince",
    tagline: "La memoria es un tunel que se abre con cuidado.",
    synopsis: SYNOPSIS.halfblood,
    year: 2009,
    rating: "PG-13",
    minutes: 153,
    score: 9.1,
    house: "slytherin",
    genres: ["Fantasia", "Misterio", "Romance"],
    cast: [
      ...CAST_HP,
      { name: "Michael Caine", character: "Magus Gaunt" },
      { name: "Alan Rickman", character: "Severus Snape" }
    ],
    sigil: "\u{1F49C}"
  },
  {
    id: "reliquias-1",
    tmdbId: 12445,
    title: "Harry Potter y las Reliquias de la Muerte (I)",
    originalTitle: "Harry Potter and the Deathly Hallows - Part 1",
    tagline: "La hora de los Relics se acerca.",
    synopsis: SYNOPSIS.deathly1,
    year: 2010,
    rating: "PG-13",
    minutes: 152,
    score: 9.2,
    house: "ravenclaw",
    genres: ["Fantasia", "Accion", "Aventura"],
    cast: [...CAST_HP, ...CAST_DEATHS],
    sigil: "\u{1F5DD}\uFE0F"
  },
  {
    id: "reliquias-2",
    tmdbId: 355,
    title: "Harry Potter y las Reliquias de la Muerte (II)",
    originalTitle: "Harry Potter and the Deathly Hallows - Part 2",
    tagline: "El final de la historia.",
    synopsis: SYNOPSIS.deathly2,
    year: 2011,
    rating: "PG-13",
    minutes: 144,
    score: 9.4,
    house: "gryffindor",
    genres: ["Fantasia", "Accion", "Aventura"],
    cast: [...CAST_HP, ...CAST_DEATHS],
    sigil: "\u2694\uFE0F",
    badge: "EPICO",
    featured: true
  },
  {
    id: "animales-fantasticos",
    tmdbId: 316699,
    title: "Animales Fantasticos y Donde Habitan",
    originalTitle: "Fantastic Beasts and Where to Find Them",
    tagline: "El mundo magico de los muggles.",
    synopsis: SYNOPSIS.beasts,
    year: 2016,
    rating: "PG-13",
    minutes: 133,
    score: 7.7,
    house: "ravenclaw",
    genres: ["Fantasia", "Aventura", "Misterio"],
    cast: [
      ...CAST_NEWTS,
      { name: "Colin Farrell", character: "Percival Graves" },
      { name: "Samantha Morton", character: "Mary Lou Barebone" }
    ],
    sigil: "\u{1F9A2}",
    badge: "NUEVO",
    featured: true
  },
  {
    id: "crimes-grindelwald",
    tmdbId: 299534,
    title: "Los Crimenes de Grindelwald",
    originalTitle: "Fantastic Beasts: The Crimes of Grindelwald",
    tagline: "Las traiciones que unen al mundo magico.",
    synopsis: SYNOPSIS.grindelwald,
    year: 2018,
    rating: "PG-13",
    minutes: 134,
    score: 7.2,
    house: "slytherin",
    genres: ["Fantasia", "Misterio", "Thriller"],
    cast: [
      ...CAST_NEWTS,
      { name: "Johnny Depp", character: "Gellert Grindelwald" },
      { name: "Zoe Kravitz", character: "Lidia Brasier" }
    ],
    sigil: "\u{1F525}"
  },
  {
    id: "secretos-dumbledore",
    tmdbId: 510390,
    title: "Los Secretos de Dumbledore",
    originalTitle: "Fantastic Beasts: The Secrets of Dumbledore",
    tagline: "El pasado de Dumbledore se revela.",
    synopsis: SYNOPSIS.dumbledore,
    year: 2022,
    rating: "PG-13",
    minutes: 139,
    score: 6.7,
    house: "hufflepuff",
    genres: ["Fantasia", "Misterio", "Historia"],
    cast: [
      ...CAST_NEWTS,
      { name: "Mads Mikkelsen", character: "Albus Dumbledore" },
      { name: "Richard Coyle", character: "Gellert Grindelwald" }
    ],
    sigil: "\u{1F4D6}"
  },
  {
    id: "prisionero-azkaban",
    tmdbId: 2062,
    title: "Harry Potter y el Prisionero de Azkaban",
    originalTitle: "Harry Potter and the Prisoner of Azkaban",
    tagline: "El convict que escap\xF3 de Azkaban.",
    synopsis: SYNOPSIS.azkaban,
    year: 2004,
    rating: "PG",
    minutes: 142,
    score: 9.1,
    house: "gryffindor",
    genres: ["Fantasia", "Aventura", "Comedia"],
    cast: [
      ...CAST_HP,
      { name: "Gary Oldman", character: "Sirius Black" },
      { name: "Michael Gambon", character: "Albus Dumbledore" }
    ],
    sigil: "\u{1F43A}"
  },
  {
    id: "caliz-fuego",
    tmdbId: 10195,
    title: "Harry Potter y el Caliz de Fuego",
    originalTitle: "Harry Potter and the Goblet of Fire",
    tagline: "El Torneo de los Cuatro Magos.",
    synopsis: SYNOPSIS.goblet,
    year: 2005,
    rating: "PG",
    minutes: 157,
    score: 9.3,
    house: "gryffindor",
    genres: ["Fantasia", "Accion", "Aventura"],
    cast: [
      ...CAST_HP,
      { name: "Robert Pattinson", character: "Cedric Diggory" },
      { name: "Ralph Fiennes", character: "Lord Voldemort" }
    ],
    sigil: "\u{1F3C6}",
    featured: true
  }
];
var trailerForSeed = (id) => TRAILERS[id] ?? null;

// src/data/fallbackCatalog.ts
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = state * 1664525 + 1013904223 >>> 0;
    return state / 4294967295;
  };
}
function hashSeed(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function wrapTitle(title, maxChars) {
  const words = title.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? current + " " + word : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}
function toDataUri(svg) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
var ACCENTS = {
  gryffindor: "#ff8a7a",
  slytherin: "#7dfcb0",
  ravenclaw: "#a9c8ff",
  hufflepuff: "#ffd75e"
};
function generatePoster(seed, width = 600, height = 900) {
  const random = seededRandom(hashSeed(seed.id));
  const accent = ACCENTS[seed.house];
  const sigil = seed.sigil;
  const titleLines = wrapTitle(seed.title.toUpperCase(), 16);
  let stars = "";
  for (let i = 0; i < 70; i += 1) {
    const x = (random() * width).toFixed(1);
    const y = (random() * height).toFixed(1);
    const r = (random() * 1.7 + 0.3).toFixed(2);
    const o = (random() * 0.55 + 0.12).toFixed(2);
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff3c4" opacity="${o}"/>`;
  }
  const runes = Array.from({ length: 9 }, (_, i) => {
    const angle = i / 9 * Math.PI * 2 - Math.PI / 2;
    const radius = 168 + random() * 16;
    const x = (width / 2 + Math.cos(angle) * radius).toFixed(1);
    const y = (height / 2 - 96 + Math.sin(angle) * radius).toFixed(1);
    const glyph = ["\u16A0", "\u16B1", "\u16A8", "\u16C9", "\u16DF", "\u16DE", "\u16D2", "\u16D6", "\u16CB"][i];
    return `<text x="${x}" y="${y}" fill="${accent}" opacity="0.5" font-size="20" font-family="Georgia, serif" text-anchor="middle">${glyph}</text>`;
  }).join("");
  const titleMarkup = titleLines.map(
    (line, index) => `<text x="${width / 2}" y="${height - 150 + index * 34}" fill="#ffe9a8" font-size="30" font-weight="700" font-family="Cinzel, Georgia, serif" text-anchor="middle" letter-spacing="1.5" style="paint-order:stroke;stroke:#160f0a;stroke-width:6">${escapeXml(line)}</text>`
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e1630"/><stop offset="45%" stop-color="#13101d"/><stop offset="100%" stop-color="#0a0810"/></linearGradient><radialGradient id="glow" cx="50%" cy="38%" r="52%"><stop offset="0%" stop-color="${accent}" stop-opacity="0.5"/><stop offset="100%" stop-color="${accent}" stop-opacity="0"/></radialGradient><linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff3c4"/><stop offset="50%" stop-color="#d4af37"/><stop offset="100%" stop-color="#8c6f1f"/></linearGradient><filter id="soft"><feGaussianBlur stdDeviation="16"/></filter></defs><rect width="${width}" height="${height}" fill="url(#sky)"/>` + stars + `<rect width="${width}" height="${height}" fill="url(#glow)"/><circle cx="${width / 2}" cy="${height / 2 - 96}" r="210" fill="${accent}" opacity="0.16" filter="url(#soft)"/>` + runes + `<rect x="16" y="16" width="${width - 32}" height="${height - 32}" fill="none" stroke="url(#gold)" stroke-width="5"/><rect x="31" y="31" width="${width - 62}" height="${height - 62}" fill="none" stroke="url(#gold)" stroke-width="1.6" opacity="0.75"/><g fill="url(#gold)"><path d="M16 78 L16 16 L78 16 L78 30 L30 30 L30 78 Z"/><path d="M${width - 16} 78 L${width - 16} 16 L${width - 78} 16 L${width - 78} 30 L${width - 30} 30 L${width - 30} 78 Z"/><path d="M16 ${height - 78} L16 ${height - 16} L78 ${height - 16} L78 ${height - 30} L30 ${height - 30} L30 ${height - 78} Z"/><path d="M${width - 16} ${height - 78} L${width - 16} ${height - 16} L${width - 78} ${height - 16} L${width - 78} ${height - 30} L${width - 30} ${height - 30} L${width - 30} ${height - 78} Z"/></g><g transform="translate(${width / 2} ${height / 2 - 110})"><path d="M0 -170 L126 -126 L126 22 Q126 124 0 176 Q-126 124 -126 22 L-126 -126 Z" fill="#130f1d" stroke="url(#gold)" stroke-width="6"/><path d="M0 -146 L104 -108 L104 16 Q104 104 0 150 Q-104 104 -104 16 L-104 -108 Z" fill="none" stroke="${accent}" stroke-width="1.6" opacity="0.65"/><path d="M-104 -108 L104 -108 L104 -14 L0 28 L-104 -14 Z" fill="${accent}" opacity="0.26"/><text x="0" y="14" font-size="84" text-anchor="middle" font-family="Segoe UI Emoji, sans-serif">${sigil}</text><path d="M-66 74 L0 42 L66 74 L66 94 L0 62 L-66 94 Z" fill="none" stroke="url(#gold)" stroke-width="2.4" opacity="0.9"/><text x="0" y="126" font-size="21" letter-spacing="3.5" text-anchor="middle" fill="#ffe9a8" font-family="Cinzel, Georgia, serif">${escapeXml(seed.house.toUpperCase())}</text></g><rect x="44" y="${height - 210}" width="${width - 88}" height="${titleLines.length * 34 + 40}" fill="#170f09" opacity="0.86" stroke="url(#gold)" stroke-width="2" rx="8"/>` + titleMarkup + `<text x="${width / 2}" y="${height - 42}" fill="${accent}" font-size="18" letter-spacing="5" text-anchor="middle" font-family="Cinzel, Georgia, serif">${seed.year} \xB7 ${escapeXml(seed.rating)}</text></svg>`;
  return toDataUri(svg);
}
function generateBackdrop(seed, width = 1600, height = 900) {
  const random = seededRandom(hashSeed(seed.id + "-bg"));
  const accent = ACCENTS[seed.house];
  let dust = "";
  for (let i = 0; i < 110; i += 1) {
    const x = (random() * width).toFixed(1);
    const y = (random() * height).toFixed(1);
    const r = (random() * 2.6 + 0.5).toFixed(2);
    const o = (random() * 0.45 + 0.08).toFixed(2);
    dust += `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffe9a8" opacity="${o}"/>`;
  }
  const towers = Array.from({ length: 9 }, (_, index) => {
    const x = 80 + index * 172;
    const h = Math.round(180 + random() * 260);
    const w = Math.round(56 + random() * 44);
    const base = height - h;
    return `<rect x="${x}" y="${base}" width="${w}" height="${h}" fill="#06050b" opacity="0.92"/><path d="M${x - 9} ${base} L${x + w / 2} ${base - 54} L${x + w + 9} ${base} Z" fill="#06050b" opacity="0.92"/>`;
  }).join("");
  let windows = "";
  for (let i = 0; i < 34; i += 1) {
    const x = Math.round(random() * width);
    const y = Math.round(height - 70 - random() * 430);
    const o = (random() * 0.5 + 0.16).toFixed(2);
    windows += `<rect x="${x}" y="${y}" width="9" height="14" rx="2" fill="#ffd75e" opacity="${o}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#271b39"/><stop offset="55%" stop-color="#160f24"/><stop offset="100%" stop-color="#08060d"/></linearGradient><radialGradient id="mglow" cx="64%" cy="36%" r="58%"><stop offset="0%" stop-color="${accent}" stop-opacity="0.45"/><stop offset="100%" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs><rect width="${width}" height="${height}" fill="url(#nsky)"/>` + dust + `<rect width="${width}" height="${height}" fill="url(#mglow)"/>` + towers + windows + "</svg>";
  return toDataUri(svg);
}
var FALLBACK_CATALOG = FALLBACK_SEEDS.map((seed) => ({
  id: "movie-" + seed.tmdbId,
  tmdbId: seed.tmdbId,
  mediaType: "movie",
  title: seed.title,
  originalTitle: seed.originalTitle,
  tagline: seed.tagline,
  synopsis: seed.synopsis,
  year: seed.year,
  durationMinutes: seed.minutes,
  score: seed.score,
  house: seed.house,
  category: seed.house,
  genres: seed.genres,
  cast: seed.cast,
  poster: generatePoster(seed),
  backdrop: generateBackdrop(seed),
  trailerKey: trailerForSeed(seed.id),
  featured: seed.featured,
  badge: seed.badge,
  sigil: seed.sigil
}));

// t.mts
var ok = 0;
for (const m of FALLBACK_CATALOG) {
  const dec = decodeURIComponent(m.poster.replace("data:image/svg+xml;charset=utf-8,", ""));
  const back = decodeURIComponent(m.backdrop.replace("data:image/svg+xml;charset=utf-8,", ""));
  const good = dec.startsWith("<svg") && dec.endsWith("</svg>") && (dec.match(/<svg/g) || []).length === 1 && back.startsWith("<svg") && back.endsWith("</svg>") && m.trailerKey && m.title && m.synopsis;
  if (good) ok++;
  console.log((good ? "PASS" : "FAIL").padEnd(5), m.id.padEnd(20), m.title.slice(0, 34).padEnd(36), "trailer=" + m.trailerKey);
}
console.log("---");
console.log(ok + "/" + FALLBACK_CATALOG.length + " MediaItem validos");
console.log("housas:", [...new Set(FALLBACK_CATALOG.map((m) => m.house))].join(", "));
