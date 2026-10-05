import { useEffect, useRef } from 'react'
import { onSparkBurst } from '../lib/magicFx'
import { makeSparkSprite } from '../lib/sparkSprite'

/** Numero maximo de particulas vivas: contiene el coste del recolector. */
const MAX_PARTICLES = 160
/** Fotogramas en reposo tras los cuales se apaga el bucle. */
const IDLE_FRAMES = 12

/** Una chispa de la explosión. */
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  /** 0 = oro #gold, 1 = plata, 2 = púrpura #violet (misma paleta que la varita). */
  kind: 0 | 1 | 2
}

/**
 * WandSparks — Explosión de chispas doradas al guardar en "Mi Lista".
 *
 * Se suscribe al bus tipado `magicFx` (sin `setState` de React) y pinta las
 * particulas en un canvas fijo a pantalla completa.
 *
 * RENDIMIENTO (60 FPS garantizados):
 *  1. Sprites pre-renderizados por tono: ni un `createRadialGradient` por
 *     partícula ni por fotograma.
 *  2. Un unico bucle `requestAnimationFrame` que solo está vivo mientras hay
 *     chispas; con `IDLE_FRAMES` en reposo se apaga por completo.
 *  3. `globalCompositeOperation = 'lighter'` → el destello aditivo lo resuelve
 *     la GPU; `clearRect` + `drawImage` son las unicas operaciones del hilo
 *     principal.
 *  4. Se pausa (y purga) al ocultar la pestaña y se desactiva con
 *     `prefers-reduced-motion`.
 */
export default function WandSparks() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Movimiento reducido: no se generan particulas (canvas queda vacio).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = 1

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    /* Sprites compartidos con WandCursor: un canvas por tono, ya renderizado.
       Oro #d4af37, plata #e0e0e0 y púrpura #8a2be2. */
    const sprites = {
      gold: makeSparkSprite(45),
      silver: makeSparkSprite(0, 0),
      violet: makeSparkSprite(280),
    }
    const spriteFor = (kind: Particle['kind']) =>
      kind === 0 ? sprites.gold : kind === 1 ? sprites.silver : sprites.violet

    let particles: Particle[] = []
    let frame = 0
    let idleFrames = 0

    /** Añade las particulas de una explosión (radial con sesgo hacia arriba). */
    const spawn = (count: number, x: number, y: number) => {
      const total = Math.min(Math.max(Math.round(count), 4), 40)
      for (let i = 0; i < total && particles.length < MAX_PARTICLES; i += 1) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1.6 + Math.random() * 4.2
        const life = 34 + Math.floor(Math.random() * 26)
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          life,
          maxLife: life,
          size: 1.5 + Math.random() * 2.8,
          kind: Math.random() < 0.55 ? 0 : Math.random() < 0.62 ? 1 : 2,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i]
        particle.x += particle.vx
        particle.y += particle.vy
        // Frena y cae con suavidad, como rescoldo que se apaga.
        particle.vx *= 0.94
        particle.vy = particle.vy * 0.94 + 0.045
        particle.life -= 1

        if (particle.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        const progress = particle.life / particle.maxLife
        const radius = particle.size * (0.35 + progress * 0.65)
        const diameter = radius * 8
        ctx.globalAlpha = progress * progress
        ctx.drawImage(
          spriteFor(particle.kind),
          particle.x - diameter / 2,
          particle.y - diameter / 2,
          diameter,
          diameter,
        )
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      // Apagado automatico: sin particulas vivas, el bucle se detiene.
      idleFrames = particles.length === 0 ? idleFrames + 1 : 0
      if (idleFrames > IDLE_FRAMES) {
        window.cancelAnimationFrame(frame)
        frame = 0
        return
      }
      frame = window.requestAnimationFrame(draw)
    }

    /** Baja el bus y arranca el bucle (una sola pasada por explosión). */
    const unsubscribe = onSparkBurst((burst) => {
      spawn(burst.count, burst.x, burst.y)
      idleFrames = 0
      if (!frame) frame = window.requestAnimationFrame(draw)
    })

    /** Al ocultar la pestaña se purga todo: cero coste en segundo plano. */
    const onVisibility = () => {
      if (!document.hidden || !frame) return
      window.cancelAnimationFrame(frame)
      frame = 0
      particles = []
      ctx.clearRect(0, 0, width, height)
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      unsubscribe()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', resize)
      if (frame) window.cancelAnimationFrame(frame)
      particles = []
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="gpu pointer-events-none fixed inset-0 z-[9998]"
    />
  )
}
