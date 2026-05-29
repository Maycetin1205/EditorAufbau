// TextareaControl
// Inspector-Control fuer mehrzeilige Text-Properties (kind 'textarea').

import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { Textarea } from '@/ui/atoms/textarea'

interface TextareaControlProps {
  property: PropertyDescription
  value: string
  onChange: (value: string) => void
}

export function TextareaControl({ property, value, onChange }: TextareaControlProps) {
  return (
    <Textarea
      label={property.name}
      description={property.description}
      value={value ?? ''}
      maxLength={property.maxLength > 0 ? property.maxLength : undefined}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  )
}
