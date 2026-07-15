// StepForm (Z2)
// Anlegen/Bearbeiten EINES Schritts einer Aktionskette. Der Bediener wählt
// die Schritt-Art (Klarname; Z2 gibt es nur „Werkzeug starten") und füllt
// die Felder — für START_TOOL die Werkzeug-Nummer der Installation und
// optionale Parameter (feste Werte + {PLATZHALTER}).
//
// Kein Ergebnis-Name-Feld in Z2: das Modell trägt resultKey ab Tag 1
// (Zwischenspeicher), aber „Werkzeug starten" liefert kein Ergebnis — das
// Feld erscheint mit „Relation ausführen" (Z3).
//
// Muster: RelationForm (dieselbe Zeilen-Mechanik für Parameter, Validierung
// erst beim Speichern). Seit dem Gerüst (2026-07-15) inline im Detail-
// Bereich (FormularKarte) statt als Modal — die Karte fängt ihr Escape
// weiterhin vor der Zentrale ab (Escape-Schichtung, Z1).

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'
import {
  AKTIONS_PLATZHALTER,
  STEP_TYPES,
  type ActionStep,
} from '../../core/data/aktionen'
import { unknownPlaceholders } from '../../core/data/relations'
import { SelectControl } from '../inspector/controls/SelectControl'
import { FormularKarte } from './FormularKarte'

// Klarnamen der Platzhalter für den Hinweis-Text (Technikwert in Klammern
// ist hier der Platzhalter selbst — den muss der Bediener ja eintippen).
const PLATZHALTER_HILFE =
  '{PINDEX} = Satznummer der auslösenden Karte/Zeile, '
  + '{VALUE} = auslösender Wert (z. B. Ziel-Spalte beim Verschieben), '
  + '{NOW_DATE} = heutiges Datum'

interface StepFormProps {
  // Vorhandener Schritt = Bearbeiten; undefined = Anlegen.
  step?: ActionStep
  onSave: (step: ActionStep) => void
  onClose: () => void
}

export function StepForm({ step, onSave, onClose }: StepFormProps) {
  const [typ, setTyp] = useState(step?.type ?? STEP_TYPES[0].key)
  const [toolNr, setToolNr] = useState(step?.toolNr ?? '')
  const [params, setParams] = useState<string[]>(step ? [...step.toolParams] : [])
  // Fehler erst nach dem ersten Speichern-Versuch anzeigen (Muster RelationForm).
  const [zeigeFehler, setZeigeFehler] = useState(false)

  const setParam = (at: number, value: string) =>
    setParams((ps) => ps.map((p, i) => (i === at ? value : p)))

  // ---------- Validierung (Fehlertexte '' = gültig) ----------
  const nrFehler = !/^\d+$/.test(toolNr.trim())
    ? 'Werkzeug-Nummer als Zahl angeben (z. B. 3003).'
    : ''
  const paramFehler = params.map((p) => {
    if (p.trim() === '') return 'Parameter darf nicht leer sein (Zeile entfernen oder füllen).'
    const unbekannt = unknownPlaceholders(p, AKTIONS_PLATZHALTER)
    if (unbekannt.length > 0) return `Unbekannter Platzhalter: {${unbekannt.join('}, {')}}`
    return ''
  })
  const alleFehler = [nrFehler, ...paramFehler]

  function speichern() {
    if (alleFehler.some((f) => f !== '')) {
      setZeigeFehler(true)
      return
    }
    onSave({
      id: step?.id ?? crypto.randomUUID(),
      type: typ,
      resultKey: step?.resultKey ?? '',
      toolNr: toolNr.trim(),
      toolParams: params.map((p) => p.trim()),
    })
    onClose()
  }

  return (
    <FormularKarte title={step ? 'Schritt bearbeiten' : 'Neuer Schritt'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <SelectControl
          label="Schritt-Art"
          description="Was dieser Schritt tut. Weitere Arten folgen."
          value={typ}
          options={STEP_TYPES.map((t) => ({ value: t.key, label: t.name }))}
          onChange={setTyp}
        />

        <Field
          label="Werkzeug-Nummer"
          description="Nummer des SoftEngine-Werkzeugs Ihrer Installation, das gestartet wird."
          error={zeigeFehler ? nrFehler : ''}
        >
          {(f) => (
            <TextInput
              {...f}
              value={toolNr}
              placeholder="z. B. 3003"
              className="w-28"
              onChange={(e) => setToolNr(e.target.value)}
            />
          )}
        </Field>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Parameter (optional)</span>
            <Button variant="outline" size="sm" onClick={() => setParams((ps) => [...ps, ''])}>
              <Plus size={14} /> Parameter
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Feste Werte oder Platzhalter: {PLATZHALTER_HILFE}
          </p>
          {params.map((p, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-right text-[11px] text-muted-foreground">
                  {i + 1}.
                </span>
                <TextInput
                  aria-label={`Parameter ${i + 1}`}
                  value={p}
                  placeholder="z. B. {PINDEX}"
                  onChange={(e) => setParam(i, e.target.value)}
                />
                <IconButton
                  aria-label={`Parameter ${i + 1} entfernen`}
                  onClick={() => setParams((ps) => ps.filter((_, at) => at !== i))}
                >
                  <X size={14} />
                </IconButton>
              </div>
              {zeigeFehler && paramFehler[i] !== '' && (
                <p className="pl-8 text-xs text-destructive">{paramFehler[i]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={speichern}>Speichern</Button>
        </div>
      </div>
    </FormularKarte>
  )
}
