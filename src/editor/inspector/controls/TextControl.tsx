// TextControl
// Inspector-Control für Text-Properties (kind 'text').
// Komponiert Field-Molekül + TextInput-Atom.

import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'

interface TextControlProps {
  property: PropertyDescription
  value: string
  onChange: (value: string) => void
}

export function TextControl({ property, value, onChange }: TextControlProps) {
  return (
    <Field label={property.name} description={property.description}>
      {(field) => (
        <TextInput
          {...field}
          value={value}
          maxLength={property.maxLength || undefined}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      )}
    </Field>
  )
}
