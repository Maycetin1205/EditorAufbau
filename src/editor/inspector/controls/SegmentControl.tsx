// SegmentControl
// Inspector-Control für kind 'segment': die Options-Liste als kompakte
// Segmentgruppe statt Dropdown (ein Klick, alle Werte sichtbar — dieselbe
// Optik wie die Seiten-Reiter in der Top-Bar). Options-Werte mit Icon in
// der Editor-Tabelle segmentIcons zeigen das Icon, der Klarname bleibt
// Tooltip + zugänglicher Name; sonst steht der Klarname als Text.
//
// `label` gesetzt -> eigenständige Zeile (Field-Hülle). Ohne `label` rendert
// nur die Gruppe — für geteilte Inspector-Zeilen (inspectorRow), in denen
// das Zeilen-Label schon steht.

import type { PropertySelectOption } from '../../../core/blocks/PropertyDescription'
import { Field } from '@/ui/molecules/field'
import { cn } from '@/lib/utils'
import { segmentIcon } from '../segmentIcons'

interface SegmentControlProps {
  /** Zugänglicher Name der Gruppe (Property-Klarname), auch ohne label. */
  name: string
  label?: string
  description?: string
  value: string
  options: PropertySelectOption[]
  onChange: (value: string) => void
}

function Segmente({ name, description, value, options, onChange, id }: SegmentControlProps & { id?: string }) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={name}
      title={description}
      className="flex h-7 w-fit items-center gap-0.5 rounded-md border border-border bg-muted p-0.5"
    >
      {options.map((o) => {
        const gewaehlt = o.value === value
        const icon = segmentIcon(o.value, { size: 13 })
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={gewaehlt}
            aria-label={o.label}
            title={o.label}
            onClick={() => onChange(o.value)}
            className={cn(
              'flex h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-md text-[11px] transition-colors',
              icon ? 'px-1.5' : 'px-2',
              gewaehlt
                ? 'bg-card font-semibold text-foreground shadow-sm'
                : 'font-medium text-muted-foreground hover:bg-card/60 hover:text-foreground',
            )}
          >
            {icon ?? o.label}
          </button>
        )
      })}
    </div>
  )
}

export function SegmentControl({ label, ...rest }: SegmentControlProps) {
  if (!label) return <Segmente {...rest} />
  // Mit Field-Hülle liegt die Beschreibung schon als Label-Tooltip an —
  // kein zweiter title auf der Gruppe.
  return (
    <Field label={label} description={rest.description}>
      {(field) => <Segmente {...rest} description={undefined} id={field.id} />}
    </Field>
  )
}
