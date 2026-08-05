// TextareaControl
// Inspector-Control für mehrzeilige Text-Properties (kind 'textarea').
// Komponiert Field-Molekül + Textarea-Atom.

import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { useEingabeSitzung } from './eingabeSitzung'
import { Textarea } from '@/ui/atoms/textarea'
import { Field } from '@/ui/molecules/field'

interface TextareaControlProps {
  property: PropertyDescription
  value: string
  onChange: (value: string) => void
  // Eine Eingabe-Sitzung klammern (Undo): siehe eingabeSitzung.ts.
  onBeginBearbeitung?: () => void
  onEndeBearbeitung?: () => void
}

export function TextareaControl({
  property,
  value,
  onChange,
  onBeginBearbeitung,
  onEndeBearbeitung,
}: TextareaControlProps) {
  const sitzung = useEingabeSitzung(onBeginBearbeitung, onEndeBearbeitung)
  return (
    <Field label={property.name} description={property.description}>
      {(field) => (
        <Textarea
          {...field}
          value={value ?? ''}
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
