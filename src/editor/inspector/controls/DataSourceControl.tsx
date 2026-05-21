// DataSourceControl
// Waehlt eine Datenquelle (DataSourceEntry) aus dem Catalog.
// Speichert die Entry-ID als Wert in den Block-Props.

import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { useCatalog } from '../../../softengine/catalog/useCatalog'
import { getTypeShortBadge } from '../../../softengine/catalog/vorschlaege'
import { Select } from '@/ui/select'

interface DataSourceControlProps {
  property: PropertyDescription
  value: string
  onChange: (value: string) => void
}

export function DataSourceControl({ property, value, onChange }: DataSourceControlProps) {
  const cat = useCatalog()
  const options = cat.entries.map((e) => ({
    value: e.id,
    label: `${getTypeShortBadge(e.type)} · ${e.alias || e.sourceId || e.id}`,
  }))
  return (
    <Select
      label={property.name}
      description={property.description || 'Datenquelle aus dem Katalog'}
      value={value ?? ''}
      onChange={(e) => onChange(e.currentTarget.value)}
      options={options}
      placeholder={options.length === 0 ? 'Keine Datenquellen' : '(nicht gebunden)'}
    />
  )
}
