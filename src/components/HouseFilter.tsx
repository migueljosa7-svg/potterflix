import { memo } from 'react'
import { HOUSES } from '../services/tmdb'
import { burstFromElement } from '../lib/magicFx'
import type { House } from '../types/tmdb'

interface HouseFilterProps {
  activeHouse: House
  onHouseChange: (house: House) => void
  /** Variante compacta para el panel movil. */
  compact?: boolean
}

/**
 * HouseFilter ULTRA — Selector interactivo de Casas de Hogwarts.
 *
 * - Actualiza el `data-house` global (via `onHouseChange` -> App -> <html>):
 *   paleta de iluminacion, auras (`--house-aura`) y tonos de la varita
 *   (WandCursor lee `data-house` en cada frame para la punta y el anillo).
 * - Botones con sigilo, aura por casa, anillo pulsante en la activa y
 *   Spell Burst dorado al cambiar de casa (bus tipado, sin setState).
 * - Accesible: `radiogroup` + `aria-checked`, navegable por teclado.
 */
function HouseFilter({ activeHouse, onHouseChange, compact = false }: HouseFilterProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Elige tu casa de Hogwarts"
      className={'flex items-center ' + (compact ? 'gap-2' : 'gap-1.5')}
    >
      {HOUSES.map((house) => {
        const isActive = activeHouse === house.id
        return (
          <button
            key={house.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={'Casa ' + house.name}
            title={house.name + ' — ' + house.motto}
            onClick={(event) => {
              if (isActive) return
              onHouseChange(house.id)
              burstFromElement(event.currentTarget, 26)
            }}
            data-house={house.id}
            className={
              'group relative flex items-center justify-center rounded-full border-2 transition-all duration-300 ' +
              (compact ? 'h-10 w-10 text-lg' : 'h-9 w-9 text-base ') +
              (isActive
                ? 'ultra-house-glow scale-110'
                : 'opacity-65 hover:scale-105 hover:opacity-100')
            }
            style={{
              borderColor: isActive ? house.secondary : house.color + '99',
              background: isActive ? house.color : 'rgba(8,9,15,0.8)',
              boxShadow: isActive ? '0 0 18px -2px ' + house.accent : undefined,
            }}
          >
            <span aria-hidden="true" className="leading-none">
              {house.sigil}
            </span>
            {isActive && (
              <span
                aria-hidden="true"
                className="ultra-aura pointer-events-none absolute inset-0 rounded-full border"
                style={{ borderColor: house.accent + '66' }}
              />
            )}
            <span className="sr-only">{house.name}</span>
          </button>
        )
      })}
    </div>
  )
}

export default memo(HouseFilter)
