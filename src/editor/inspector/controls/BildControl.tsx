import { useRef, useState } from 'react'
import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { meldungen } from '../../../state/meldungen'
import { bildEinbetten } from './bildEinbetten'
import { Button } from '@/ui/atoms/button'
import { Field } from '@/ui/molecules/field'

interface BildControlProps {
  property: PropertyDescription
  value: string
  onChange: (value: string) => void
}

export function BildControl({ property, value, onChange }: BildControlProps) {
  const dateiRef = useRef<HTMLInputElement>(null)

  const [laeuft, setLaeuft] = useState(false)
  const hatBild = value !== ''

  const gewaehlt = async (datei: File): Promise<void> => {
    setLaeuft(true)
    try {
      onChange(await bildEinbetten(datei))
    } catch {
      meldungen.melde('Die Datei ist kein lesbares Bild.')
    } finally {
      setLaeuft(false)
    }
  }

  return (
    <Field label={property.name} description={property.description}>
      {(field) => (
        <div {...field} className="flex min-w-0 flex-col gap-1.5">

          {hatBild && (
            <img
              src={value}
              alt=""
              className="max-h-24 w-full rounded-md border border-input object-contain"
            />
          )}
          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={laeuft}
              onClick={() => dateiRef.current?.click()}
            >
              {hatBild ? 'Anderes Bild …' : 'Bild wählen …'}
            </Button>
            {hatBild && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={laeuft}
                onClick={() => onChange('')}
              >
                Entfernen
              </Button>
            )}
          </div>

          <input
            ref={dateiRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const datei = e.target.files?.[0]
              try {
                if (datei) void gewaehlt(datei)
              } finally {
                e.target.value = ''
              }
            }}
          />
        </div>
      )}
    </Field>
  )
}
