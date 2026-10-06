import { useEffect, useRef } from 'react'
import { makeSparkSprite } from '../lib/sparkSprite'

/** Una chispa individual de la estela de la varita. */
interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  /** Tono de la chispa: oro #d4af37 (45), plata #e0e0e0 (0/sat 0) y púrpura #8a2be2 (280). */
  hue: 45 | 0 | 280
}

/** Anillo expansivo del Spell Burst (clic interactivo). */
interface Ring {
  x: number
  y: number
  r: number
  maxR: number
  life: number
  maxLife: number
}

/** Distancia minima entre chispas para no saturar la pantalla. */
const SPAWN_DISTANCE = 7
/** Maximo de chispas vivas (sprites => ~0,02 ms por chispa). */
const MAX_SPARKS = 180
/** Fotogramas sin actividad tras los cuales se apaga el bucle. */
const IDLE_FRAMES = 24

/** Acento luminoso por casa: tine la punta y el anillo del Spell Burst. */
const HOUSE_TIP: Record<string, string> = {
  gryffindor: '#ff8a7a',
  slytherin: '#7dfcb0',
  ravenclaw: '#a9c8ff',
  hufflepuff: '#ffd75e',
}

const currentHouse = (): string =>
  document.documentElement.getAttribute('data-house') ?? 'gryffindor'

/**
 * WandCursor ULTRA — varita a 60 FPS sobre overlay Canvas.
 * Overlay: position fixed, inset 0, pointer-events none, z-index 999999.
 * La PUNTA vive en las coordenadas EXACTAS del raton (cero latencia).
 * Estela tricolor oro/plata/purpura + Spell Burst radial en clics.
 */
export default function WandCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Los dispositivos tactiles no tienen puntero: no tiene sentido el cursor.
    if (window.matchMedia('(pointer: coarse)').matches) return
    // Respeta la preferencia del sistema: sin varita, sin destellos.
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

    /* Sprites pre-renderizados (compartidos con WandSparks), una sola vez.
       Oro #d4af37 (45), plata #e0e0e0 (luna, saturación 0) y púrpura #8a2be2 (280). */
    const sprites = {
      gold: makeSparkSprite(45),
      silver: makeSparkSprite(0, 0),
      violet: makeSparkSprite(280),
    }
    const spriteFor = (hue: Spark['hue']) =>
      hue === 45 ? sprites.gold : hue === 0 ? sprites.silver : sprites.violet

    // Punta EXACTA del raton + ultimo spawn. Sin suavizado: cero latencia.
    const pointer = { x: width / 2, y: height / 2 }
    const lastSpawn = { x: width / 2, y: height / 2 }

    const sparks: Spark[] = []
    const rings: Ring[] = []
    let hovering = false
    let pressing = false
    let frame = 0
    let idleFrames = 0
    let paused = false

    document.body.classList.add('has-wand-cursor')

    const wake = () => {
      idleFrames = 0
      if (!frame && !paused) frame = window.requestAnimationFrame(draw)
    }

    /* Eventos: SOLO escriben en variables, cero renders de React. */
    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      hovering = true
      wake()
    }
    const onLeave = () => {
      hovering = false
    }
    const onDown = (event: PointerEvent) => {
      pressing = true
      pointer.x = event.clientX
      pointer.y = event.clientY
      // Spell Burst: explosion radial + anillo con el color de la casa.
      const target = event.target as HTMLElement | null
      const interactive = Boolean(
        target?.closest?.(
          'button, a, input, select, textarea, [role="button"], [role="link"], label, summary',
        ),
      )
      burst(pointer.x, pointer.y, interactive ? 30 : 10)
      if (interactive) {
        rings.push({ x: pointer.x, y: pointer.y, r: 6, maxR: 64, life: 22, maxLife: 22 })
        if (rings.length > 6) rings.shift()
      }
      wake()
    }
    const onUp = () => {
      pressing = false
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

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)

    /** Tono tricolor de la estela: oro #d4af37, plata #e0e0e0 y púrpura #8a2be2. */
    const pickHue = (): Spark['hue'] => {
      const roll = Math.random()
      if (roll < 0.55) return 45
      if (roll < 0.8) return 0
      return 280
    }

    /** Emite una chispa en la punta de la varita (gravedad + fricción + fade). */
    const emit = (x: number, y: number, boost: number) => {
      if (sparks.length >= MAX_SPARKS) return
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 0.9 + 0.15
      const maxLife = 30 + Math.random() * 34

      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed * 0.55,
        vy: Math.sin(angle) * speed * 0.55 - 0.22,
        life: maxLife,
        maxLife: maxLife,
        size: (Math.random() * 2.1 + 0.7) * boost,
        hue: pickHue(),
      })
    }

    /** Estallido radial de hechizo (clic): rafaga tricolor de alta energia. */
    const burst = (x: number, y: number, count: number) => {
      const total = Math.max(4, Math.min(Math.round(count), 34))
      for (let i = 0; i < total && sparks.length < MAX_SPARKS; i += 1) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1.8 + Math.random() * 3.6
        const maxLife = 36 + Math.random() * 30
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.6,
          life: maxLife,
          maxLife,
          size: 1.4 + Math.random() * 2.6,
          hue: pickHue(),
        })
      }
    }
    const draw = () => {
      frame = window.requestAnimationFrame(draw)
      ctx.clearRect(0, 0, width, height)

      // Emision por distancia desde la PUNTA EXACTA (no por fotograma).
      if (hovering) {
        const dx = pointer.x - lastSpawn.x
        const dy = pointer.y - lastSpawn.y
        const distance = Math.hypot(dx, dy)
        if (distance >= SPAWN_DISTANCE) {
          const steps = Math.min(Math.floor(distance / SPAWN_DISTANCE), 5)
          for (let i = 1; i <= steps; i += 1) {
            const t = i / steps
            emit(pointer.x - dx * (1 - t), pointer.y - dy * (1 - t), pressing ? 1.7 : 1)
          }
          lastSpawn.x = pointer.x
          lastSpawn.y = pointer.y
        }
      }

      // Aditivo: el destello lo compone la GPU en un solo paso.
      ctx.globalCompositeOperation = 'lighter'

      // Integracion y dibujado con sprite pre-renderizado.
      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const spark = sparks[i]
        spark.x += spark.vx
        spark.y += spark.vy
        // Frena y flota hacia arriba, como polvo de estrellas.
        spark.vx *= 0.94
        spark.vy = spark.vy * 0.94 - 0.012
        spark.life -= 1

        if (spark.life <= 0) {
          sparks.splice(i, 1)
          continue
        }

        const progress = spark.life / spark.maxLife
        const radius = spark.size * (0.35 + progress * 0.65)
        const diameter = radius * 8

        ctx.globalAlpha = progress * progress
        ctx.drawImage(
          spriteFor(spark.hue),
          spark.x - diameter / 2,
          spark.y - diameter / 2,
          diameter,
          diameter,
        )
      }

      // Anillos del Spell Burst con el color de la casa activa.
      const tipColor = HOUSE_TIP[currentHouse()] ?? '#ffd700'
      for (let i = rings.length - 1; i >= 0; i -= 1) {
        const ring = rings[i]
        ring.life -= 1
        const p = ring.life / ring.maxLife
        if (ring.life <= 0) {
          rings.splice(i, 1)
          continue
        }
        ring.r += (ring.maxR - ring.r) * 0.22
        ctx.globalAlpha = p * 0.8
        ctx.strokeStyle = tipColor
        ctx.lineWidth = 1.6 + (1 - p) * 1.4
        ctx.beginPath()
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      // La punta vive en las coordenadas EXACTAS del raton.
      if (hovering) drawWand(ctx, pointer.x, pointer.y, pressing, tipColor)

      const active =
        hovering &&
        (sparks.length > 0 ||
          rings.length > 0 ||
          pointer.x !== lastSpawn.x ||
          pointer.y !== lastSpawn.y)
      idleFrames = active ? 0 : idleFrames + 1
      if (idleFrames > IDLE_FRAMES) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
    }

    frame = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      document.body.classList.remove('has-wand-cursor')
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="gpu pointer-events-none fixed inset-0"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999999 }}
    />
  )
}

/** Varita con la punta EXACTA en (x, y) + halo del color de la casa. */
function drawWand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pressing: boolean,
  tipColor: string,
) {
  const length = pressing ? 42 : 34
  const angle = -Math.PI / 3.6

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  // Mango de madera
  ctx.fillStyle = '#3a2a1c'
  ctx.beginPath()
  ctx.roundRect(-length, -2.6, 11, 5.2, 2.6)
  ctx.fill()

  // Empuñadura de cuero
  ctx.fillStyle = '#1a1310'
  ctx.fillRect(-length + 2, -2.6, 3, 5.2)

  // Cuerpo de la varita con veta dorada
  const shaft = ctx.createLinearGradient(-length, 0, 0, 0)
  shaft.addColorStop(0, '#5a4526')
  shaft.addColorStop(0.5, '#8c6f1f')
  shaft.addColorStop(1, '#f3d97b')
  ctx.fillStyle = shaft
  ctx.beginPath()
  ctx.roundRect(-length + 10, -1.5, length - 10, 3, 1.5)
  ctx.fill()

  // Destello de la punta: nucleo blanco + halo del color de la casa.
  const tipRadius = pressing ? 12 : 7.5
  const tip = ctx.createRadialGradient(0, 0, 0, 0, 0, tipRadius)
  tip.addColorStop(0, 'rgba(255, 248, 214, 0.95)')
  tip.addColorStop(0.35, tipColor + 'cc')
  tip.addColorStop(1, 'rgba(255, 215, 0, 0)')
  ctx.fillStyle = tip
  ctx.beginPath()
  ctx.arc(0, 0, tipRadius, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

