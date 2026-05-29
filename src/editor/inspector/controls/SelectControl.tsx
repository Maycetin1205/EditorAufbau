// SelectControl
// Inspector-Control fuer Properties mit fester Option-Liste (kind 'select').

import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { Select } from '@/ui/atoms/select'

interface SelectControlProps {
  property: PropertyDescription
  value: string
  onChange: (value: string) => void
}

export function SelectControl({ property, value, onChange }: SelectControlProps) {
  return (
    <Select
      label={property.name}
      description={property.description}
      value={value ?? ''}
      onChange={(e) => onChange(e.currentTarget.value)}
      options={property.options ?? []}
    />
  )
}
