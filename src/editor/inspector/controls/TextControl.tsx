// TextControl
// Inspector-Control für Text-Properties (kind 'text').
// Komponiert Field-Molekül + TextInput-Atom.

import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { useEingabeSitzung } from './eingabeSitzung'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'

interface TextControlProps {
  property: PropertyDescription
  value: string
  onChange: (value: string) => void
  // Eine Eingabe-Sitzung klammern (Undo): siehe eingabeSitzung.ts.
  onBeginBearbeitung?: () => void
  onEndeBearbeitung?: () => void
}

export function TextControl({
  property,
  value,
  onChange,
  onBeginBearbeitung,
  onEndeBearbeitung,
}: TextControlProps) {
  const sitzung = useEingabeSitzung(onBeginBearbeitung, onEndeBearbeitung)
  return (
    <Field label={property.name} description={property.description}>
      {(field) => (
        <TextInput
          {...field}
          value={value}
          maxLength={property.maxLength || undefined}
          onChange={(e) => {
            sitzung.beginnen()
            onChange(e.currentTarget.value)
          }}
          onBlur={sitzung.beenden}
        />
      )}
    </Field>
  )
}
