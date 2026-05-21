// ColorControl
// Inspector-Control fuer Farbwerte (kind 'color'). Hex-Strings.

import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { ColorInput } from '@/ui/color-input'

interface ColorControlProps {
  property: PropertyDescription
  value: string
  onChange: (value: string) => void
}

export function ColorControl({ property, value, onChange }: ColorControlProps) {
  return (
    <ColorInput
      label={property.name}
      description={property.description}
      value={value ?? ''}
      onChange={onChange}
    />
  )
}
