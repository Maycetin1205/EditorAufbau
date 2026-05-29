// TextControl
// Inspector-Molekuel fuer Text-Properties.
// Wraps src/ui TextInput.
// Bekommt PropertyDescription (Label/Hilfetext/maxLength) + aktuellen Wert + onChange-Callback.

import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { TextInput } from '@/ui/atoms/text-input'

interface TextControlProps {
  property: PropertyDescription
  value: string
  onChange: (value: string) => void
}

export function TextControl({ property, value, onChange }: TextControlProps) {
  return (
    <TextInput
      label={property.name}
      description={property.description}
      maxLength={property.maxLength > 0 ? property.maxLength : undefined}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  )
}
