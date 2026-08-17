import { useState } from 'react'
import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { useEingabeSitzung } from './eingabeSitzung'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'
import { cn } from '@/lib/utils'

interface NumberControlProps {
  property: PropertyDescription
  value: unknown
  label?: string
  onChange: (value: number) => void

  onBeginBearbeitung?: () => void
  onEndeBearbeitung?: () => void
}

function eingrenzen(n: number, property: PropertyDescription): number {
  const min = property.min ?? Number.NEGATIVE_INFINITY
  const max = property.max ?? Number.POSITIVE_INFINITY
  return Math.min(max, Math.max(min, n))
}

function Zahlenfeld({
  property,
  value,
  onChange,
  onBeginBearbeitung,
  onEndeBearbeitung,
  id,
}: NumberControlProps & { id?: string }) {
  const sitzung = useEingabeSitzung(onBeginBearbeitung, onEndeBearbeitung)
  const aussen = typeof value === 'number' && Number.isFinite(value) ? String(value) : ''

  const [entwurf, setEntwurf] = useState(aussen)
  const [basis, setBasis] = useState(aussen)
  if (basis !== aussen) {
    setBasis(aussen)
    setEntwurf(aussen)
  }

  const uebernehmen = (roh: string): void => {
    setEntwurf(roh)
    const n = Number.parseFloat(roh.replace(',', '.'))

    if (Number.isFinite(n) && eingrenzen(n, property) === n) {
      sitzung.beginnen()
      onChange(n)
    }
  }

  return (
    <span className="relative inline-flex w-16 shrink-0 items-center">
      <TextInput
        id={id}
        type="number"
        inputMode="decimal"
        min={property.min}
        max={property.max}
        step={0.5}
        aria-label={property.name}
        title={property.description}
        value={entwurf}
        onChange={(e) => uebernehmen(e.currentTarget.value)}
        onBlur={() => {
          const n = Number.parseFloat(entwurf.replace(',', '.'))
          if (Number.isFinite(n)) {
            const begrenzt = eingrenzen(n, property)
            setEntwurf(String(begrenzt))

            sitzung.beginnen()
            onChange(begrenzt)
          } else {
            setEntwurf(aussen)
          }
          sitzung.beenden()
        }}

        className={cn(
          '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          property.unit && 'pr-6',
        )}
      />
      {property.unit && (
        <span className="pointer-events-none absolute right-1.5 text-[0.625rem] text-muted-foreground">
          {property.unit}
        </span>
      )}
    </span>
  )
}

export function NumberControl({ label, ...rest }: NumberControlProps) {
  if (!label) return <Zahlenfeld {...rest} />
  return (
    <Field label={label} description={rest.property.description}>
      {(field) => <Zahlenfeld {...rest} id={field.id} />}
    </Field>
  )
}
