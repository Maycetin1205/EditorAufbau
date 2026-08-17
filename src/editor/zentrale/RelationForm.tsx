import { useState } from 'react'
import { Button } from '@/ui/atoms/button'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'
import {
  formatRelationSyntax,
  parseRelationSyntax,
  type RelationTemplate,
} from '../../core/data/relations'
import { useRelations } from '../../state/useRelations'
import { FormularKarte } from './FormularKarte'

interface RelationFormProps {
  relation?: RelationTemplate
  onClose: () => void
}

export function RelationForm({ relation, onClose }: RelationFormProps) {
  const store = useRelations()
  const [name, setName] = useState(relation?.name ?? '')
  const [syntaxInput, setSyntaxInput] = useState(
    relation ? formatRelationSyntax(relation) : '',
  )
  const [zeigeFehler, setZeigeFehler] = useState(false)

  const syntax = syntaxInput.trim() === '' ? null : parseRelationSyntax(syntaxInput)
  const nameFehler = name.trim() === '' ? 'Anzeigename fehlt.' : ''
  const syntaxFehler = syntaxInput.trim() === ''
    ? 'Syntax fehlt.'
    : syntax
      ? ''
      : 'Syntax ist ungültig.'

  function speichern() {
    if (nameFehler !== '' || !syntax) {
      setZeigeFehler(true)
      return
    }
    const daten: Omit<RelationTemplate, 'id'> = {
      name: name.trim(),
      verb: syntax.verb,
      nr: syntax.nr,
      params: [...syntax.params],
      allowExtraParams: syntax.allowExtraParams,
    }
    if (relation) store.update(relation.id, daten)
    else store.add(daten)
    onClose()
  }

  return (
    <FormularKarte title={relation ? 'Relation bearbeiten' : 'Neue Relation'} onClose={onClose}>
      <div className="flex flex-col gap-3">
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

        <Field
          label="SoftEngine-Syntax"
          error={zeigeFehler || (syntaxInput.trim() !== '' && !syntax) ? syntaxFehler : ''}
        >
          {(f) => (
            <TextInput
              {...f}
              value={syntaxInput}
              placeholder="z. B. GET_RELATION[640!{IDBID}!{DATUM}]"
              className="font-mono text-[0.6875rem]"
              onChange={(e) => setSyntaxInput(e.target.value)}
            />
          )}
        </Field>

        {syntax && (
          <div className="rounded-md border border-border bg-background p-2 text-[0.6875rem]">
            <div className="font-medium">
              {syntax.verb.replace('_RELATION', '')} {syntax.nr} · {syntax.params.length} Parameter
              {syntax.allowExtraParams ? ' · weitere erlaubt' : ''}
            </div>
            <div className="mt-1 max-h-32 overflow-y-auto font-mono text-muted-foreground">
              {syntax.params.map((param, i) => (
                <div key={i} className="flex gap-2">
                  <span className="w-5 shrink-0 text-right">{i + 1}.</span>
                  <span>{param === '' ? '(leer)' : param}</span>
                </div>
              ))}
              {syntax.params.length === 0 && <div>Keine Parameter.</div>}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>Abbrechen</Button>
          <Button size="sm" onClick={speichern}>Speichern</Button>
        </div>
      </div>
    </FormularKarte>
  )
}
