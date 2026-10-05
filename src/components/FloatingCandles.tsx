import { useMemo } from 'react'
import { seededRandom, hashSeed } from '../data/filmArt'

/** Numero de velas en pantalla. Bajo a proposito: cada una es un elemento. */
const CANDLE_COUNT = 18

interface Candle {
  id: number
  /** Posicion horizontal en porcentaje. */
  left: number
  /** Escala de la vela (las del fondo son mas pequenas). */
  scale: number
  /** Duracion del ascenso en segundos. */
  duration: number
  /** Retardo inicial para desincronizar las llamas. */
  delay: number
  /** Balanceo lateral durante el ascenso. */
  sway: number
  /** Opacidad maxima de la vela. */
  opacity: number
  /** Duracion del parpadeo de la llama. */
  flicker: number
  /** Tinte de la cera: marfil o cera de abeja. */
  wax: string
}

/**
 * FloatingCandles - Fondo de velas flotantes al estilo del Gran Comedor.
 *
 * Rendimiento: son elementos CSS puros animados con `transform` y `opacity`
 * (propiedades que el navegador compone en la GPU). El componente no registra
 * ningun listener, no usa estado y no vuelve a renderizar: el coste en el hilo
 * principal es cero. La lista se genera una vez con un PRNG determinista para
 * que el servidor y el cliente coincidan.
 */
export default function FloatingCandles() {
  const candles = useMemo<Candle[]>(() => {
    const random = seededRandom(hashSeed('potterflix-candles'))
    return Array.from({ length: CANDLE_COUNT }, (_, index) => ({
      id: index,
      left: random() * 100,
      // Las velas del fondo son mas pequenas que las del frente.
      scale: 0.45 + random() * 0.75,
      duration: 26 + random() * 22,
      delay: random() * 40,
      sway: (random() - 0.5) * 90,
      opacity: 0.18 + random() * 0.42,
      flicker: 1.3 + random() * 1.4,
      wax: random() > 0.5 ? '#f3e4c4' : '#e8d3a8',
    }))
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {candles.map((candle) => (
        <div
          key={candle.id}
          className="absolute bottom-0 animate-candle-drift gpu"
          style={
            {
              left: candle.left + '%',
              animationDuration: candle.duration + 's',
              animationDelay: candle.delay + 's',
              '--candle-sway': candle.sway + 'px',
              '--candle-opacity': candle.opacity,
            } as React.CSSProperties
          }
        >
          <div
            style={{ transform: `scale(${candle.scale})`, opacity: candle.opacity }}
          >
            {/* Aura calida de la llama */}
            <span
              className="absolute left-1/2 top-0 -ml-[22px] h-16 w-11 rounded-full blur-xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,196,84,0.55) 0%, rgba(255,150,40,0.22) 45%, rgba(255,120,20,0) 75%)',
              }}
            />

            {/* Llama */}
            <span
              className="absolute left-1/2 top-[-13px] -ml-[5px] h-[15px] w-[10px] animate-flame-flicker rounded-[50%_50%_45%_45%]"
              style={{
                animationDuration: candle.flicker + 's',
                background:
                  'linear-gradient(to top, #ff8a00 0%, #ffc043 45%, #fff6cf 100%)',
                boxShadow: '0 0 12px 4px rgba(255,170,50,0.75)',
              }}
            />

            {/* Cuerpo de cera con la mecha */}
            <span
              className="block h-[38px] w-[14px] rounded-t-[3px]"
              style={{
                background:
                  'linear-gradient(90deg, rgba(0,0,0,0.35) 0%, ' +
                  candle.wax +
                  ' 35%, ' +
                  candle.wax +
                  ' 65%, rgba(0,0,0,0.4) 100%)',
                boxShadow: 'inset 0 0 6px rgba(255,214,140,0.35)',
              }}
            >
              {/* Cera derramada en la base */}
              <span className="absolute bottom-0 left-1/2 h-2 w-[22px] -translate-x-1/2 rounded-full bg-black/25 blur-[1px]" />
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}