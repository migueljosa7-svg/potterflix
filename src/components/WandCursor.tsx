import { useEffect, useRef } from 'react'

/** Una chispa individual de la estela de la varita. */
interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  /** Tono de la chispa, oscila entre dorado y azul magico. */
  hue: number
}

/** Rapidez con la que la varita persigue al puntero (0-1). */
const TRAIL_STRENGTH = 0.22
/** Distancia minima entre chispas para no saturar la pantalla. */
const SPAWN_DISTANCE = 6
/** Maximo de chispas vivas simultaneamente. */
const MAX_SPARKS = 260

/**
 * WandCursor - Sustituye el puntero del raton por una varita magica que
 * proyecta una estela de chispas doradas y azules sobre un canvas a pantalla
 * completa. Se desactiva automaticamente en dispositivos tactiles.
 */
export default function WandCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Los dispositivos tactiles no tienen puntero: no tiene sentido el cursor.
    if (window.matchMedia('(pointer: coarse)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
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
    window.addEventListener('resize', resize)

    // Posicion real del raton y posicion suavizada de la varita.
    const pointer = { x: width / 2, y: height / 2 }
    const wand = { x: width / 2, y: height / 2 }
    const lastSpawn = { x: width / 2, y: height / 2 }

    const sparks: Spark[] = []
    let hovering = false
    let pressing = false
    let frame = 0

    document.body.classList.add('has-wand-cursor')

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      hovering = true
    }
    const onLeave = () => {
      hovering = false
    }
    const onDown = () => {
      pressing = true
    }
    const onUp = () => {
      pressing = false
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    /** Emite una chispa en la punta de la varita. */
    const emit = (x: number, y: number, boost: number) => {
      if (sparks.length >= MAX_SPARKS) return
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 0.9 + 0.15
      const maxLife = 34 + Math.random() * 46

      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed * 0.55,
        vy: Math.sin(angle) * speed * 0.55 - 0.22,
        life: maxLife,
        maxLife: maxLife,
        size: (Math.random() * 2.1 + 0.7) * boost,
        // 45 = dorado Snitch, 205 = azul magico
        hue: Math.random() > 0.35 ? 45 : 205,
      })
    }

    const draw = () => {
      frame = window.requestAnimationFrame(draw)

      // La varita persigue al puntero con inercia suave.
      wand.x += (pointer.x - wand.x) * TRAIL_STRENGTH
      wand.y += (pointer.y - wand.y) * TRAIL_STRENGTH

      ctx.clearRect(0, 0, width, height)

      if (hovering) {
        const dx = wand.x - lastSpawn.x
        const dy = wand.y - lastSpawn.y
        const distance = Math.hypot(dx, dy)

        // Emite chispas segun la distancia recorrida, no por frame.
        if (distance >= SPAWN_DISTANCE) {
          const steps = Math.min(Math.floor(distance / SPAWN_DISTANCE), 6)
          for (let i = 1; i <= steps; i += 1) {
            const t = i / steps
            emit(wand.x - dx * (1 - t), wand.y - dy * (1 - t), pressing ? 1.7 : 1)
          }
          lastSpawn.x = wand.x
          lastSpawn.y = wand.y
        }
      }

      // Integracion y dibujado de las chispas.
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
        const alpha = progress * progress
        const radius = spark.size * (0.35 + progress * 0.65)

        const glow = ctx.createRadialGradient(
          spark.x,
          spark.y,
          0,
          spark.x,
          spark.y,
          radius * 4,
        )
        glow.addColorStop(0, 'hsla(' + spark.hue + ', 100%, 88%, ' + alpha + ')')
        glow.addColorStop(0.35, 'hsla(' + spark.hue + ', 95%, 62%, ' + alpha * 0.6 + ')')
        glow.addColorStop(1, 'hsla(' + spark.hue + ', 90%, 45%, 0)')

        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(spark.x, spark.y, radius * 4, 0, Math.PI * 2)
        ctx.fill()
      }

      if (hovering) {
        drawWand(ctx, wand.x, wand.y, pressing)
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
      document.body.classList.remove('has-wand-cursor')
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999]"
    />
  )
}

/** Dibuja la varita: mango, cuerpo de madera y destello en la punta. */
function drawWand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pressing: boolean,
) {
  const length = pressing ? 40 : 32
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

  // Destello de la punta
  const tipRadius = pressing ? 11 : 7
  const tip = ctx.createRadialGradient(0, 0, 0, 0, 0, tipRadius)
  tip.addColorStop(0, 'rgba(255, 248, 214, 0.95)')
  tip.addColorStop(0.4, 'rgba(212, 175, 55, 0.55)')
  tip.addColorStop(1, 'rgba(212, 175, 55, 0)')
  ctx.fillStyle = tip
  ctx.beginPath()
  ctx.arc(0, 0, tipRadius, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}
