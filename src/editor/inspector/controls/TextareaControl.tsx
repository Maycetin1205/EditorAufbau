// TextareaControl
// Inspector-Control für mehrzeilige Text-Properties (kind 'textarea').
// Komponiert Field-Molekül + Textarea-Atom.

import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { Textarea } from '@/ui/atoms/textarea'
import { Field } from '@/ui/molecules/field'

interface TextareaControlProps {
  property: PropertyDescription
  value: string
  onChange: (value: string) => void
}

export function TextareaControl({ property, value, onChange }: TextareaControlProps) {
  return (
    <Field label={property.name} description={property.description}>
      {(field) => (
        <Textarea
          {...field}
          value={value ?? ''}
          maxLength={property.maxLength || undefined}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      )}
    </Field>
  )
}
