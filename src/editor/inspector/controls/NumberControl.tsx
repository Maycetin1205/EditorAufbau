// NumberControl
// Inspector-Molekuel fuer Zahlen-Properties.
// Wraps src/ui NumberInput und gibt nur echte number-Werte nach oben.

import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { NumberInput } from '@/ui/number-input'

interface NumberControlProps {
  property: PropertyDescription
  value: number
  onChange: (value: number) => void
}

export function NumberControl({ property, value, onChange }: NumberControlProps) {
  return (
    <NumberInput
      label={property.name}
      description={property.description}
      min={0}
      value={value}
      onChange={onChange}
    />
  )
}
