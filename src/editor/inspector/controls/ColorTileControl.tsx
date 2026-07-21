// ColorTileControl
// Dezente Reihe kleiner Farb-Kacheln statt Dropdown (Nutzer-Entscheidung
// 2026-07-21). Jede Kachel zeigt die echte Masken-Farbe der Option; die
// gewaehlte kriegt einen feinen Ring, der Hover-Tooltip nennt den Klarnamen
// („Erfolg", „Hinweis", …). REIN Editor-seitig — die Eigenschaft bleibt in
// der Baustein-Datei ein `select` (Runtime-Buendel/Export unveraendert); der
// Inspector waehlt dieses Control nur, wenn alle Options-Werte in optionColors
// stehen. Gleiche Prop-Form wie SelectControl (label/description/value/options/
// onChange), damit der Inspector generisch zwischen beiden umschalten kann.

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
                className={cn(
                  'h-6 w-6 rounded-md border border-black/10 transition-shadow',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
                  gewaehlt
                    ? 'ring-2 ring-ring ring-offset-1 ring-offset-background'
                    : 'hover:ring-2 hover:ring-ring/40 hover:ring-offset-1 hover:ring-offset-background',
                )}
                style={{ backgroundColor: optionColor(o.value) }}
              />
            )
          })}
        </div>
      )}
    </Field>
  )
}
