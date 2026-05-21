// FieldControl
// Waehlt ein Feld innerhalb einer Datenquelle. Datenquelle kommt aus einer
// anderen Property im selben Block (property.bindsTo).
// Fallback: freies Textfeld, wenn keine bindsTo gesetzt oder Datenquelle leer.

import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { useCatalog } from '../../../softengine/catalog/useCatalog'
import { Select } from '@/ui/select'
import { TextInput } from '@/ui/text-input'

interface FieldControlProps {
  property: PropertyDescription
  value: string
  onChange: (value: string) => void
  // Alle props des Blocks, fuer bindsTo-Aufloesung.
  blockProps: Record<string, unknown>
}

export function FieldControl({ property, value, onChange, blockProps }: FieldControlProps) {
  const cat = useCatalog()
  const bindKey = property.bindsTo ?? 'dataSourceId'
  const sourceId = String(blockProps[bindKey] ?? '')
  const entry = sourceId ? cat.getEntry(sourceId) : undefined

  if (!entry || entry.fields.length === 0) {
    return (
      <TextInput
        label={property.name}
        description={property.description || (entry ? 'Keine Felder in Datenquelle' : 'Keine Datenquelle gewaehlt')}
        value={value ?? ''}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    )
  }

  const options = entry.fields.map((f) => ({
    value: f.name,
    label: `${f.name} (${f.field})`,
  }))
  return (
    <Select
      label={property.name}
      description={property.description}
      value={value ?? ''}
      onChange={(e) => onChange(e.currentTarget.value)}
      options={options}
      placeholder="(kein Feld)"
    />
  )
}
