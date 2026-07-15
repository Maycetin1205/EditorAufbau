// StepForm (Z2; entschlackt 2026-07-15 auf Nutzer-Anweisung)
// Anlegen/Bearbeiten EINES Schritts einer Aktionskette. Die Schritt-Arten
// heißen wie ihre SE-Fachbegriffe (START_TOOL; GET_RELATION/PUT_RELATION
// folgen mit Fahrplan-Schritt 3). START_TOOL trägt nur die Nummer —
// KEINE Parameter (Nutzer-Entscheidung 2026-07-15; das Modell behält
// toolParams für Altbestände und die Laufzeit, das Formular bietet sie
// nicht mehr an und speichert leer).
//
// Kein Ergebnis-Name-Feld in Z2: das Modell trägt resultKey ab Tag 1
// (Zwischenspeicher), gefüllt erst mit „Relation ausführen" (Schritt 3).
// Inline im Detail-Bereich (FormularKarte); Escape bricht nur das
// Formular ab (Escape-Schichtung, Z1).

import { useState } from 'react'
import { Button } from '@/ui/atoms/button'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'
import { STEP_TYPES, type ActionStep } from '../../core/data/aktionen'
import { SelectControl } from '../inspector/controls/SelectControl'
import { FormularKarte } from './FormularKarte'

interface StepFormProps {
  // Vorhandener Schritt = Bearbeiten; undefined = Anlegen.
  step?: ActionStep
  onSave: (step: ActionStep) => void
  onClose: () => void
}

export function StepForm({ step, onSave, onClose }: StepFormProps) {
  const [typ, setTyp] = useState(step?.type ?? STEP_TYPES[0].key)
  const [toolNr, setToolNr] = useState(step?.toolNr ?? '')
  // Fehler erst nach dem ersten Speichern-Versuch anzeigen.
  const [zeigeFehler, setZeigeFehler] = useState(false)

  const nrFehler = !/^\d+$/.test(toolNr.trim())
    ? 'Nummer als Zahl angeben (z. B. 3003).'
    : ''

  function speichern() {
    if (nrFehler !== '') {
      setZeigeFehler(true)
      return
    }
    onSave({
      id: step?.id ?? crypto.randomUUID(),
      type: typ,
      resultKey: step?.resultKey ?? '',
      toolNr: toolNr.trim(),
      toolParams: [],
    })
    onClose()
  }

  return (
    <FormularKarte title={step ? 'Schritt bearbeiten' : 'Neuer Schritt'} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <SelectControl
          label="Schritt-Art"
          value={typ}
          options={STEP_TYPES.map((t) => ({ value: t.key, label: t.name }))}
          onChange={setTyp}
        />

        <Field label="Nummer" error={zeigeFehler ? nrFehler : ''}>
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

        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>Abbrechen</Button>
          <Button size="sm" onClick={speichern}>Speichern</Button>
        </div>
      </div>
    </FormularKarte>
  )
}
