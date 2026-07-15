// RelationForm
// Kap. 5.5b: Anlegen/Bearbeiten einer Relation-Vorlage. Der Bediener gibt
// Anzeigename, Verb, NR und die Parameter-Syntax ein. Die Syntax darf feste
// Werte (z. B. 'L') UND Platzhalter ({PINDEX}, {VALUE} …) enthalten, die die
// Konsumenten zur Laufzeit füllen (relations.ts, RELATION_PLACEHOLDERS).
//
// Beim Bearbeiten bleibt die id der Vorlage stabil (Konsumenten wie das
// Kanban behalten ihre Vorlage) — das erledigt relationStore.update.
//
// Muster: DataSourceForm (dasselbe Modal-Molekül, dieselbe Zeilen-Mechanik
// für die Parameter wie dort für die Felder; Validierung erst beim Speichern).

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'
import {
  RELATION_PLACEHOLDERS,
  RELATION_VERBS,
  unknownPlaceholders,
  type RelationTemplate,
  type RelationVerb,
} from '../../core/data/relations'
import { useRelations } from '../../state/useRelations'
import { SelectControl } from '../inspector/controls/SelectControl'
import { FormularKarte } from './FormularKarte'
import { VERB_LABELS } from './helfer'

interface RelationFormProps {
  // Vorhandene Vorlage = Bearbeiten; undefined = Anlegen.
  relation?: RelationTemplate
  onClose: () => void
}

export function RelationForm({ relation, onClose }: RelationFormProps) {
  const store = useRelations()
  const [name, setName] = useState(relation?.name ?? '')
  const [verb, setVerb] = useState<RelationVerb>(relation?.verb ?? 'PUT_RELATION')
  const [nr, setNr] = useState(relation?.nr ?? '')
  const [params, setParams] = useState<string[]>(
    relation && relation.params.length > 0 ? [...relation.params] : [''],
  )
  // Fehler erst nach dem ersten Speichern-Versuch anzeigen (nicht beim Tippen).
  const [zeigeFehler, setZeigeFehler] = useState(false)

  const setParam = (at: number, value: string) =>
    setParams((ps) => ps.map((p, i) => (i === at ? value : p)))

  // ---------- Validierung (Fehlertexte '' = gültig) ----------
  const nameFehler = name.trim() === '' ? 'Anzeigename fehlt.' : ''
  const nrFehler = !/^\d+$/.test(nr.trim()) ? 'NR als Zahl angeben (z. B. 174).' : ''
  const paramFehler = params.map((p) => {
    if (p.trim() === '') return 'Parameter darf nicht leer sein (Zeile entfernen oder füllen).'
    const unbekannt = unknownPlaceholders(p)
    if (unbekannt.length > 0) return `Unbekannter Platzhalter: {${unbekannt.join('}, {')}}`
    return ''
  })
  const alleFehler = [nameFehler, nrFehler, ...paramFehler]

  function speichern() {
    if (alleFehler.some((f) => f !== '')) {
      setZeigeFehler(true)
      return
    }
    const daten: Omit<RelationTemplate, 'id'> = {
      name: name.trim(),
      verb,
      nr: nr.trim(),
      params: params.map((p) => p.trim()),
    }
    if (relation) store.update(relation.id, daten)
    else store.add(daten)
    onClose()
  }

  return (
    <FormularKarte title={relation ? 'Relation bearbeiten' : 'Neue Relation'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Field label="Anzeigename" error={zeigeFehler ? nameFehler : ''}>
          {(f) => (
            <TextInput
              {...f}
              value={name}
              placeholder="z. B. Termin verschieben"
              onChange={(e) => setName(e.target.value)}
            />
          )}
        </Field>

        <SelectControl
          label="Art"
          description="Was die Relation tut — bestimmt das SoftEngine-Kommando."
          value={verb}
          options={RELATION_VERBS.map((v) => ({ value: v, label: VERB_LABELS[v] }))}
          onChange={(v) => setVerb(v as RelationVerb)}
        />

        <Field
          label="NR"
          description="Nummer der Relation in Ihrer Installation."
          error={zeigeFehler ? nrFehler : ''}
        >
          {(f) => (
            <TextInput
              {...f}
              value={nr}
              placeholder="z. B. 174"
              className="w-28"
              onChange={(e) => setNr(e.target.value)}
            />
          )}
        </Field>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Parameter</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setParams((ps) => [...ps, ''])}
            >
              <Plus size={14} /> Parameter
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Feste Werte oder Platzhalter (in geschweiften Klammern), die beim
            Ausführen gefüllt werden: {RELATION_PLACEHOLDERS.map((p) => `{${p}}`).join(' ')}
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
                  placeholder="z. B. {PINDEX} oder L"
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
