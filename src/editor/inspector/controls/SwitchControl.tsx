// SwitchControl
// Inspector-Control fuer boolean-Properties (kind 'boolean').

import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { Switch } from '@/ui/switch'

interface SwitchControlProps {
  property: PropertyDescription
  value: boolean
  onChange: (value: boolean) => void
}

export function SwitchControl({ property, value, onChange }: SwitchControlProps) {
  return (
    <Switch
      label={property.name}
      description={property.description}
      checked={!!value}
      onChange={onChange}
    />
  )
}
