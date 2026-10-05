/// <reference types="vite/client" />

/** Tipos de las variables de entorno expuestas por Vite (`.env`). */
interface ImportMetaEnv {
  /** Clave de la API de TMDB; sin ella la app funciona en modo demo. */
  readonly VITE_TMDB_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
