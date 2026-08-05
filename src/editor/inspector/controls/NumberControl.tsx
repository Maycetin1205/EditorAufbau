// NumberControl
// Inspector-Control für kind 'number': kompaktes Zahlenfeld mit Einheit
// (z. B. „14 px"). Während des Tippens hält ein Entwurfs-Zustand auch
// Zwischenstände aus (leeres Feld, angefangene Zahl) — gespeichert wird nur
// ein gültiger Wert innerhalb der Grenzen; Verlassen des Felds stellt sonst
// den letzten gültigen Wert wieder her.
//
// `label` gesetzt -> eigenständige Zeile (Field-Hülle). Ohne `label` rendert
// nur das Feld — für geteilte Inspector-Zeilen (inspectorRow).

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
  // Eine Eingabe-Sitzung klammern (Undo): siehe eingabeSitzung.ts.
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
  // Entwurf folgt dem Prop-Wert, solange nicht getippt wird (State-Anpassung
  // beim Rendern — Muster „adjusting state when props change").
  const [entwurf, setEntwurf] = useState(aussen)
  const [basis, setBasis] = useState(aussen)
  if (basis !== aussen) {
    setBasis(aussen)
    setEntwurf(aussen)
  }

  const uebernehmen = (roh: string): void => {
    setEntwurf(roh)
    const n = Number.parseFloat(roh.replace(',', '.'))
    // Die Sitzung erst oeffnen, wenn wirklich ein Wert rausgeht: ein
    // Zwischenstand ohne gueltige Zahl soll keinen Leer-Schritt erzeugen.
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
          // Ungültiges/leeres Feld springt auf den letzten gültigen Wert,
          // Werte ausserhalb der Grenzen werden eingegrenzt und gespeichert.
          const n = Number.parseFloat(entwurf.replace(',', '.'))
          if (Number.isFinite(n)) {
            const begrenzt = eingrenzen(n, property)
            setEntwurf(String(begrenzt))
            // Noch INNERHALB der Sitzung: der eingegrenzte Endwert gehoert
            // zum selben Undo-Schritt wie das Getippte davor.
            sitzung.beginnen()
            onChange(begrenzt)
          } else {
            setEntwurf(aussen)
          }
          sitzung.beenden()
        }}
        // Browser-Spinner ausblenden (sie säßen auf der Einheit; Pfeiltasten
        // funktionieren weiter), Einheit hat rechts ihren festen Platz.
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
