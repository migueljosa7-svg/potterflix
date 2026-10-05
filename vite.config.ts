import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* ==========================================================================
   CHUNKS DE VENDOR (code-splitting)
   Aisla las dependencias del codigo de la app:
     - `vendor-react`  → react, react-dom y scheduler (cambian muy poco).
     - `vendor-motion` → framer-motion + motion-dom/motion-utils.
     - `vendor-icons`  → lucide-react (iconos ya tree-shakeados).
   Beneficios: descarga en paralelo, cache de un ano en Render (/assets/*)
   y rebuilds de la app que no invalidan los vendors.
   ========================================================================== */
const VENDOR_CHUNKS: Array<[RegExp, string]> = [
  [/node_modules\/(framer-motion|motion-dom|motion-utils)\//, 'vendor-motion'],
  [/node_modules\/(react|react-dom|scheduler)\//, 'vendor-react'],
  [/node_modules\/lucide-react\//, 'vendor-icons'],
]

/** Asigna cada modulo de `node_modules` a su chunk de vendor. */
const manualChunks = (id: string): string | undefined => {
  // Windows usa barras invertidas: normalizamos antes de comparar.
  const normalized = id.replace(/\\/g, '/')
  if (!normalized.includes('node_modules')) return undefined
  for (const [pattern, name] of VENDOR_CHUNKS) {
    if (pattern.test(normalized)) return name
  }
  return undefined
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
})
