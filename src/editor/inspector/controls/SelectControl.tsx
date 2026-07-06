// SelectControl
// Inspector-Control für Werte mit fester Option-Liste.
// Generische Props (label/value/options) — wird sowohl von den
// PropertyDescription-Feldern (Inspector) als auch von der Layout-Sektion
// benutzt. Komponiert Field-Molekül + shadcn/Radix-Select-Primitives.

import type { PropertySelectOption } from '../../../core/blocks/PropertyDescription'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/atoms/select'
import { Field } from '@/ui/molecules/field'

interface SelectControlProps {
  label: string
  description?: string
  value: string
  options: PropertySelectOption[]
  onChange: (value: string) => void
}

export function SelectControl({ label, description, value, options, onChange }: SelectControlProps) {
  return (
    <Field label={label} description={description}>
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
