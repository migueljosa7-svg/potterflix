import { useEffect, useRef } from 'react'
import { hashSeed, seededRandom } from '../data/fallbackCatalog'

/** Polvo de estrellas flotante. */
interface Mote {
  x: number
  y: number
  r: number
  speed: number
  drift: number
  phase: number
  twinkle: number
  /** 0 = dorado, 1 = plateado, 2 = violeta, 3 = brasa calida. */
  kind: 0 | 1 | 2 | 3
}

const COUNT = 90

const COLORS = [
  'rgba(255, 215, 0, A)',
  'rgba(224, 224, 224, A)',
  'rgba(168, 130, 255, A)',
  'rgba(255, 150, 60, A)',
]

/**
 * MagicParticles — Canvas de fondo con polvo de estrellas y brasas magicas.
 *
 * - Polvo dorado/plateado/violeta flotando + brasas calidas ascendentes.
 * - Reacciona sutilmente al movimiento: parallax de ~14 px hacia el puntero.
 * - 60 FPS con un unico rAF, DPR capado a 1.5, pausa en tab oculta y respeto
 *   a `prefers-reduced-motion` / puntero grueso (fondo estatico en ese caso).
 * - z-index -5: vive DETRAS del contenido, nunca intercepta clics.
 */
export default function MagicParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed(true)
    }
    const random = seededRandom(hashSeed('potterflix-magic-particles'))
    let motes: Mote[] = []
    const seed = (keepProgress: boolean) => {
      motes = Array.from({ length: COUNT }, () => ({
        x: random() * width,
        y: keepProgress ? random() * height : height + random() * 40,
        r: 0.6 + random() * 2.1,
        speed: 0.12 + random() * 0.5,
        drift: (random() - 0.5) * 0.35,
        phase: random() * Math.PI * 2,
        twinkle: 1.2 + random() * 2.6,
        kind: (random() < 0.42 ? 0 : random() < 0.68 ? 1 : random() < 0.86 ? 2 : 3) as Mote['kind'],
      }))
    }
    seed(true)

    // Parallax sutil hacia el puntero (lerp, sin renders de React).
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    const onMove = (event: PointerEvent) => {
      target.x = (event.clientX / Math.max(width, 1) - 0.5) * 28
      target.y = (event.clientY / Math.max(height, 1) - 0.5) * 18
      wake()
    }

    let frame = 0
    let idle = 0
    let paused = false
    let time = 0

    const wake = () => {
      idle = 0
      if (!frame && !paused) frame = window.requestAnimationFrame(draw)
    }

    const draw = () => {
      frame = window.requestAnimationFrame(draw)
      time += 1 / 60
      current.x += (target.x - current.x) * 0.04
      current.y += (target.y - current.y) * 0.04

      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'

      for (const mote of motes) {
        mote.y -= mote.speed
        mote.x += mote.drift + Math.sin(time * 0.7 + mote.phase) * 0.12
        if (mote.y < -12) {
          mote.y = height + 10
          mote.x = random() * width
        }
        if (mote.x < -12) mote.x = width + 10
        if (mote.x > width + 12) mote.x = -10

        const shimmer = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * mote.twinkle + mote.phase))
        const px = mote.x + current.x * (0.3 + mote.r * 0.25)
        const py = mote.y + current.y * (0.3 + mote.r * 0.25)
        const glow = mote.r * 4

        const gradient = ctx.createRadialGradient(px, py, 0, px, py, glow)
        const base = COLORS[mote.kind].replace('A', (shimmer * 0.75).toFixed(3))
        const edge = COLORS[mote.kind].replace('A', '0')
        gradient.addColorStop(0, base)
        gradient.addColorStop(1, edge)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(px, py, glow, 0, Math.PI * 2)
        ctx.fill()

        // Nucleo brillante.
        ctx.globalAlpha = shimmer
        ctx.fillStyle = mote.kind === 3 ? '#ffd9a0' : '#fff8dc'
        ctx.beginPath()
        ctx.arc(px, py, mote.r * 0.55, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      // Si el puntero lleva quieto 8 s, dormimos el fondo (ahorro total).
      idle += Math.abs(target.x - current.x) + Math.abs(target.y - current.y) < 0.05 ? 1 : 0
      if (idle > 480) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
    }

    const onVisibility = () => {
      paused = document.hidden
      if (paused) {
        window.cancelAnimationFrame(frame)
        frame = 0
      } else {
        wake()
      }
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    frame = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="gpu pointer-events-none fixed inset-0"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -5 }}
    />
  )
}
