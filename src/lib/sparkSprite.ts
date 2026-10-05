/**
 * Lado del sprite pre-renderizado de una chispa. Todas las partículas
 * reutilizan esta textura: se evita crear un `createRadialGradient()` por
 * chispa y fotograma (el cuello de botella original de las estelas).
 */
export const SPARK_SPRITE_SIZE = 64

/**
 * Pre-renderiza una chispa radial (UNA sola vez por tono). El resultado se
 * pinta con `drawImage` + `globalCompositeOperation = 'lighter'`, dejando el
 * destello aditivo a la GPU.
 */
export function makeSparkSprite(hue: number): HTMLCanvasElement {
  const sprite = document.createElement('canvas')
  sprite.width = SPARK_SPRITE_SIZE
  sprite.height = SPARK_SPRITE_SIZE
  const ctx = sprite.getContext('2d')
  if (!ctx) return sprite

  const center = SPARK_SPRITE_SIZE / 2
  const glow = ctx.createRadialGradient(center, center, 0, center, center, center)
  glow.addColorStop(0, 'hsla(' + hue + ', 100%, 92%, 1)')
  glow.addColorStop(0.25, 'hsla(' + hue + ', 100%, 70%, 0.55)')
  glow.addColorStop(0.55, 'hsla(' + hue + ', 95%, 55%, 0.16)')
  glow.addColorStop(1, 'hsla(' + hue + ', 90%, 45%, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, SPARK_SPRITE_SIZE, SPARK_SPRITE_SIZE)
  return sprite
}
