// BildControl
// Inspector-Control fuer Bild-Properties (kind 'bild', N5). Es waehlt eine
// Datei, bettet sie ein (bildEinbetten: verkleinern + Daten-URI) und schreibt
// das Ergebnis in die Prop. Der Baustein bekommt nur den fertigen String.
//
// Generisch wie jedes andere Control: es kennt keinen Bausteintyp, nur die
// PropertyDescription (Regel 2). Wer als naechster ein Bild braucht,
// deklariert kind 'bild' und ist fertig.
//
// WARUM DAS BILD IM INSPECTOR GEWAEHLT WIRD und nicht per Doppelklick am
// Baustein (Regel 7 sagt „Bedienung am Ding"): der Doppelklick auf einer
// Baustein-Stelle hat heute schon ZWEI Bedeutungen — Feld-Picker an einer
// gebundenen Stelle und Inline-Edit an einer ungebundenen (useBindingPicker).
// U8 hat dieses Zusammenspiel mit der Auswahl gerade erst geradegerueckt.
// Eine dritte Bedeutung ist eine eigene Entscheidung des Nutzers, kein
// Nebeneffekt davon, dass ein neuer Baustein dazukommt (N5, 2026-08-13).

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
  // Waehrend des Einbettens laeuft ein await — ohne diesen Riegel koennte der
  // Bauer ein zweites Bild anstossen, und welches am Ende in der Prop steht,
  // entschiede die Reihenfolge der Antworten.
  const [laeuft, setLaeuft] = useState(false)
  const hatBild = value !== ''

  const gewaehlt = async (datei: File): Promise<void> => {
    setLaeuft(true)
    try {
      onChange(await bildEinbetten(datei))
    } catch {
      // Die EINE Meldungsspur des Editors (U2). Kein Alert, keine
      // Warn-Anzeige am Baustein — nur der Fall, in dem gar nichts entstanden
      // ist, wird ueberhaupt gemeldet; das stille Verkleinern nicht.
      meldungen.melde('Die Datei ist kein lesbares Bild.')
    } finally {
      setLaeuft(false)
    }
  }

  return (
    <Field label={property.name} description={property.description}>
      {(field) => (
        <div {...field} className="flex min-w-0 flex-col gap-1.5">
          {/* Die Vorschau zeigt, was wirklich in der Maske landet — der
              eingebettete Daten-URI, nicht die Originaldatei. Ohne sie muesste
              der Bauer auf der Flaeche nachsehen, welches Bild er gewaehlt
              hat. Kariert wie ueblich waere hier zu viel Aufwand: der stille
              Rahmen genuegt, um ein weisses Bild vom leeren Kasten zu
              unterscheiden. */}
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
          {/* Verstecktes Datei-Feld (Muster: Toolbar, DatenquellenBereich).
              Der Wert wird nach JEDEM Versuch geleert — sonst loest dieselbe
              Datei kein zweites 'change' aus und der Bediener klickt ins
              Leere, ohne zu verstehen warum. */}
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
