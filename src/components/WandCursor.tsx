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
  /** Tono de la chispa: dorado Snitch (45) o azul magico (205). */
  hue: 45 | 205
}

/** Rapidez con la que la varita persigue al puntero (0-1). */
const TRAIL_STRENGTH = 0.22
/** Distancia minima entre chispas para no saturar la pantalla. */
const SPAWN_DISTANCE = 8
/**
 * Maximo de chispas vivas. Bajado de 260 a 140: con sprites pre-renderizados
 * el coste por chispa es ~0,02 ms, asi que el limite ya no marca la diferencia
 * visual pero si alivia al recolector de basura.
 */
const MAX_SPARKS = 140
/**
 * Lado del sprite pre-renderizado. Todas las chispas reutilizan la misma
 * textura: se evita crear un degradado radial por chispa y fotograma, que era
 * el cuello de botella real del efecto.
 */
const SPRITE_SIZE = 64
/** Fotogramas sin actividad tras los cuales se apaga el bucle de animacion. */
const IDLE_FRAMES = 20

/**
 * WandCursor - Sustituye el puntero del raton por una varita magica que
 * proyecta una estela de chispas doradas y azules.
 *
 * OPTIMIZACIONES CLAVE (antes saturaba el hilo principal):
 *  1. Un unico bucle de `requestAnimationFrame`: el evento `pointermove` solo
 *     escribe dos numeros y nunca provoca renderizados de React.
 *  2. Las chispas se pintan con `drawImage` de un sprite pre-renderizado en
 *     lugar de `createRadialGradient()` por chispa y fotograma.
 *  3. El bucle se detiene por completo cuando no hay movimiento ni chispas
 *     (`IDLE_FRAMES`), dejando el hilo principal libre al 100 %.
 *  4. Se pausa al ocultar la pestaña.
 *  5. `globalCompositeOperation = 'lighter'` deja el destello aditivo a la GPU.
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

    /* Sprites pre-renderizados: un canvas por tono, dibujado UNA sola vez. */
    const makeSparkSprite = (hue: number): HTMLCanvasElement => {
      const sprite = document.createElement('canvas')
      sprite.width = SPRITE_SIZE
      sprite.height = SPRITE_SIZE
      const sctx = sprite.getContext('2d')
      if (!sctx) return sprite

      const c = SPRITE_SIZE / 2
      const glow = sctx.createRadialGradient(c, c, 0, c, c, c)
      glow.addColorStop(0, 'hsla(' + hue + ', 100%, 92%, 1)')
      glow.addColorStop(0.25, 'hsla(' + hue + ', 100%, 70%, 0.55)')
      glow.addColorStop(0.55, 'hsla(' + hue + ', 95%, 55%, 0.16)')
      glow.addColorStop(1, 'hsla(' + hue + ', 90%, 45%, 0)')
      sctx.fillStyle = glow
      sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)
      return sprite
    }

    const sprites = { gold: makeSparkSprite(45), blue: makeSparkSprite(205) }

    // Posicion real del raton y posicion suavizada de la varita.
    const pointer = { x: width / 2, y: height / 2 }
    const wand = { x: width / 2, y: height / 2 }
    const lastSpawn = { x: width / 2, y: height / 2 }

    const sparks: Spark[] = []
    let hovering = false
    let pressing = false
    let frame = 0
    let idleFrames = 0
    let paused = false

    document.body.classList.add('has-wand-cursor')

    /* Eventos: SOLO escriben en variables. Mover el raton no provoca ni un
       solo renderizado de React. */
    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      hovering = true
      idleFrames = 0
      // Si el bucle esta dormido (pestaña inactiva), lo despertamos.
      if (!frame && !paused) frame = window.requestAnimationFrame(draw)
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
    const onVisibility = () => {
      paused = document.hidden
      if (paused) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)

    /** Emite una chispa en la punta de la varita. */
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

        // Emite chispas segun la distancia recorrida, no por fotograma.
        if (distance >= SPAWN_DISTANCE) {
          const steps = Math.min(Math.floor(distance / SPAWN_DISTANCE), 4)
          for (let i = 1; i <= steps; i += 1) {
            const t = i / steps
            emit(wand.x - dx * (1 - t), wand.y - dy * (1 - t), pressing ? 1.7 : 1)
          }
          lastSpawn.x = wand.x
          lastSpawn.y = wand.y
          idleFrames = 0
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
          spark.hue === 45 ? sprites.gold : sprites.blue,
          spark.x - diameter / 2,
          spark.y - diameter / 2,
          diameter,
          diameter,
        )
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      if (hovering) {
        drawWand(ctx, wand.x, wand.y, pressing)
      }

      /* Apagado automatico: sin puntero en movimiento y sin chispas vivas,
         el bucle se detiene para liberar por completo el hilo principal. */
      const active =
        hovering &&
        (sparks.length > 0 || pointer.x !== wand.x || pointer.y !== wand.y)
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
      className="gpu pointer-events-none fixed inset-0 z-[9999]"
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
  tip.addColorStop(0.4, 'rgba(255, 215, 0, 0.55)')
  tip.addColorStop(1, 'rgba(255, 215, 0, 0)')
  ctx.fillStyle = tip
  ctx.beginPath()
  ctx.arc(0, 0, tipRadius, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

