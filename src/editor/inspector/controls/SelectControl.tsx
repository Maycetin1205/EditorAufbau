import type { PropertySelectOption } from '../../../core/blocks/PropertyDescription'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/atoms/select'
import { Field } from '@/ui/molecules/field'

type SelectOption = PropertySelectOption & { detail?: string }

interface SelectControlProps {
  label: string
  description?: string
  value: string
  options: SelectOption[]
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
                {o.detail !== undefined && o.detail !== '' && (
                  <span className="ml-2 font-mono text-[0.6875rem] text-muted-foreground">
                    {o.detail}
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Field>
  )
}
