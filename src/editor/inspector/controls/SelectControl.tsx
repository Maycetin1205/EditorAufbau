// SelectControl
// Inspector-Control für Properties mit fester Option-Liste (kind 'select').
// Komponiert Field-Molekül + shadcn/Radix-Select-Primitives.

import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/atoms/select'
import { Field } from '@/ui/molecules/field'

interface SelectControlProps {
  property: PropertyDescription
  value: string
  onChange: (value: string) => void
}

export function SelectControl({ property, value, onChange }: SelectControlProps) {
  const options = property.options ?? []

  return (
    <Field label={property.name} description={property.description}>
      {(field) => (
        <Select value={value ?? ''} onValueChange={onChange}>
          <SelectTrigger id={field.id} aria-describedby={field['aria-describedby']}>
            <SelectValue placeholder="Wählen…" />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Field>
  )
}
