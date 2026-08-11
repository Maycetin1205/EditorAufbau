// ColorTileControl
// Dezente Reihe kleiner Farb-Kacheln statt Dropdown (Nutzer-Entscheidung
// 2026-07-21). Jede Kachel zeigt die echte Masken-Farbe der Option; die
// gewaehlte traegt einen weissen Haken IN der Kachel (frueher ein Aussen-
// Ring — der zeichnete 3px AUSSERHALB und wurde am Panel-Rand abgeschnitten,
// „passt nicht rein", Nutzer 2026-07-21; alles Sichtbare bleibt jetzt in der
// Kachel). Der Hover-Tooltip nennt den Klarnamen („Erfolg", „Hinweis", …).
// REIN Editor-seitig — die Eigenschaft bleibt in der Baustein-Datei ein
// `select` (Runtime-Buendel/Export unveraendert); der Inspector waehlt dieses
// Control nur, wenn alle Options-Werte in optionColors stehen. Gleiche
// Prop-Form wie SelectControl (label/description/value/options/onChange),
// damit der Inspector generisch zwischen beiden umschalten kann.

import { Check } from '@/ui/zeichen'
import type { PropertySelectOption } from '../../../core/blocks/PropertyDescription'
import { Field } from '@/ui/molecules/field'
import { cn } from '@/lib/utils'
import { optionColor } from '../optionColors'

interface ColorTileControlProps {
  label: string
  description?: string
  value: string
  options: PropertySelectOption[]
  onChange: (value: string) => void
}

export function ColorTileControl({ label, description, value, options, onChange }: ColorTileControlProps) {
  return (
    <Field label={label} description={description}>
      {(field) => (
        <div
          id={field.id}
          aria-describedby={field['aria-describedby']}
          className="flex flex-wrap items-center gap-1.5"
        >
          {options.map((o) => {
            const gewaehlt = o.value === value
            return (
              <button
                key={o.value}
                type="button"
                // Klarname als zugaenglicher Name UND Hover-Tooltip.
                aria-label={o.label}
                aria-pressed={gewaehlt}
                title={o.label}
                onClick={() => onChange(o.value)}
                // Ringe nur NACH INNEN (ring-inset): nichts ragt über die
                // Kachel hinaus, nichts wird am Panel-Rand abgeschnitten.
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-md border border-black/10',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80',
                  !gewaehlt && 'hover:ring-2 hover:ring-inset hover:ring-white/50',
                )}
                style={{ backgroundColor: optionColor(o.value) }}
              >
                {gewaehlt && <Check size={13} strokeWidth={3} className="text-white" />}
              </button>
            )
          })}
        </div>
      )}
    </Field>
  )
}
