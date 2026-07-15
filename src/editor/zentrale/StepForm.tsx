// Ein Schritt im bestehenden Ablauf: Baustein -> Ereignis -> Aktion.
// START_TOOL und RELATION teilen nur die Huelle; ihre Felder bleiben durch
// das typisierte Kernmodell strikt getrennt.
// START_TOOL traegt nur die Nummer — KEINE Parameter im Formular
// (Nutzer-Entscheidung 2026-07-15); toolParams bleibt im Modell fuer
// Altbestaende und die Laufzeit, gespeichert wird leer.

import { useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'
import {
  ACTION_PARAM_SOURCES,
  AKTIONS_PLATZHALTER,
  STEP_TYPES,
  defaultRelationParams,
  stepProblem,
  type ActionParamBinding,
  type ActionParamSource,
  type ActionStep,
  type StepTypeKey,
} from '../../core/data/aktionen'
import type { DataSource } from '../../core/data/dataSources'
import {
  formatRelationSyntax,
  relationMatchesSearch,
} from '../../core/data/relations'
import { useRelations } from '../../state/useRelations'
import { useDataSources } from '../../state/useDataSources'
import { SelectControl } from '../inspector/controls/SelectControl'
import { FormularKarte } from './FormularKarte'

interface StepFormProps {
  step?: ActionStep
  onSave: (step: ActionStep) => void
  onClose: () => void
}

const CONTEXT_OPTIONS = AKTIONS_PLATZHALTER.map((value) => ({
  value,
  label: value === 'PINDEX' ? 'Satznummer' : value === 'VALUE' ? 'Ereigniswert' : 'Heutiges Datum',
}))

function BindingValue({
  binding,
  dataSources,
  onChange,
}: {
  binding: ActionParamBinding
  dataSources: readonly DataSource[]
  onChange: (binding: ActionParamBinding) => void
}) {
  if (binding.source === 'previous_result') {
    return (
      <div className="flex h-7 items-center rounded border border-input bg-secondary/50 px-2 text-[11px] text-muted-foreground">
        Ergebnis des vorherigen Schritts
      </div>
    )
  }
  if (binding.source === 'context') {
    return (
      <select
        value={binding.value}
        onChange={(e) => onChange({ ...binding, value: e.target.value })}
        className="h-7 w-full rounded border border-input bg-background px-2 text-xs"
      >
        <option value="">— wählen —</option>
        {CONTEXT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    )
  }
  if (binding.source === 'data_field') {
    const selectedSource = dataSources.find((source) => source.id === binding.dataSourceId)
    return (
      <div className="grid grid-cols-2 gap-1">
        <select
          value={binding.dataSourceId ?? ''}
          onChange={(e) => onChange({ ...binding, dataSourceId: e.target.value, value: '' })}
          className="h-7 min-w-0 rounded border border-input bg-background px-1 text-[11px]"
        >
          <option value="">— Quelle —</option>
          {dataSources.map((source) => (
            <option key={source.id} value={source.id}>{source.name}</option>
          ))}
        </select>
        <select
          value={binding.value}
          onChange={(e) => onChange({ ...binding, value: e.target.value })}
          className="h-7 min-w-0 rounded border border-input bg-background px-1 text-[11px]"
        >
          <option value="">— Feld —</option>
          {selectedSource?.fields.map((field) => (
            <option key={field.code} value={field.code}>{field.label}</option>
          ))}
        </select>
      </div>
    )
  }
  return (
    <TextInput
      value={binding.value}
      placeholder={binding.source === 'se_variable' ? 'Variablenname' : 'Wert'}
      onChange={(e) => onChange({ ...binding, value: e.target.value })}
    />
  )
}

function BindingRow({
  label,
  binding,
  dataSources,
  removable = false,
  onChange,
  onRemove,
}: {
  label: string
  binding: ActionParamBinding
  dataSources: readonly DataSource[]
  removable?: boolean
  onChange: (binding: ActionParamBinding) => void
  onRemove?: () => void
}) {
  const setSource = (source: ActionParamSource) => {
    const value = source === 'previous_result'
      ? ''
      : source === 'context'
        ? 'VALUE'
        : ''
    onChange({ source, value })
  }

  return (
    <div className="grid grid-cols-[minmax(80px,0.8fr)_minmax(120px,1.5fr)_130px_28px] items-center gap-2">
      <span className="truncate font-mono text-[11px]" title={label}>{label}</span>
      <BindingValue binding={binding} dataSources={dataSources} onChange={onChange} />
      <select
        value={binding.source}
        onChange={(e) => setSource(e.target.value as ActionParamSource)}
        className="h-7 rounded border border-input bg-background px-2 text-[11px]"
      >
        {ACTION_PARAM_SOURCES.map((source) => (
          <option
            key={source.key}
            value={source.key}
            disabled={source.key === 'data_field' && dataSources.length === 0}
          >
            {source.name}
          </option>
        ))}
      </select>
      {removable && onRemove
        ? <IconButton aria-label={`${label} entfernen`} onClick={onRemove}><X size={13} /></IconButton>
        : <span />}
    </div>
  )
}

export function StepForm({ step, onSave, onClose }: StepFormProps) {
  const relations = useRelations()
  const dataSources = useDataSources()
  const [typ, setTyp] = useState<StepTypeKey>(step?.type ?? 'START_TOOL')
  const [toolNr, setToolNr] = useState(step?.type === 'START_TOOL' ? step.toolNr : '')
  const [relationId, setRelationId] = useState(
    step?.type === 'RELATION' ? step.relationId : '',
  )
  const initialRelation = step?.type === 'RELATION' ? relations.get(step.relationId) : undefined
  const [relationParams, setRelationParams] = useState<ActionParamBinding[]>(() => {
    if (step?.type !== 'RELATION') return []
    if (initialRelation && step.params.length !== initialRelation.params.length) {
      return defaultRelationParams(initialRelation)
    }
    return step.params.map((binding) => ({ ...binding }))
  })
  const [extraParams, setExtraParams] = useState<ActionParamBinding[]>(
    step?.type === 'RELATION' ? step.extraParams.map((binding) => ({ ...binding })) : [],
  )
  const [resultKey, setResultKey] = useState(step?.resultKey ?? '')
  const [suche, setSuche] = useState('')
  const [zeigeFehler, setZeigeFehler] = useState(false)

  const relation = relations.get(relationId)
  const sichtbareRelationen = relations.list.filter((entry) => relationMatchesSearch(entry, suche))
  const defaultParams = relation ? defaultRelationParams(relation) : []
  const bindingFor = (index: number): ActionParamBinding =>
    relationParams[index] ?? defaultParams[index] ?? { source: 'fixed', value: '' }
  const setBinding = (index: number, binding: ActionParamBinding) => {
    setRelationParams((current) => {
      const next = relation ? defaultRelationParams(relation) : [...current]
      current.forEach((value, at) => { if (at < next.length) next[at] = value })
      next[index] = binding
      return next
    })
  }

  function selectRelation(id: string) {
    const selected = relations.get(id)
    setRelationId(id)
    if (!selected) return
    setRelationParams(defaultRelationParams(selected))
    if (!selected.allowExtraParams) setExtraParams([])
  }

  function candidate(): ActionStep {
    const id = step?.id ?? crypto.randomUUID()
    if (typ === 'START_TOOL') {
      return {
        id,
        type: 'START_TOOL',
        resultKey: '',
        toolNr: toolNr.trim(),
        toolParams: [],
      }
    }
    const normalizedParams = relation
      ? relation.params.map((_, index) => {
          const binding = bindingFor(index)
          return { ...binding, value: binding.value.trim() }
        })
      : []
    return {
      id,
      type: 'RELATION',
      relationId,
      params: normalizedParams,
      extraParams: extraParams.map((binding) => ({ ...binding, value: binding.value.trim() })),
      resultKey: relation?.verb === 'GET_RELATION' ? resultKey.trim() : '',
    }
  }

  const problem = stepProblem(candidate(), relations.list, dataSources.list)

  function speichern() {
    const next = candidate()
    if (stepProblem(next, relations.list, dataSources.list)) {
      setZeigeFehler(true)
      return
    }
    onSave(next)
    onClose()
  }

  return (
    <FormularKarte title={step ? 'Schritt bearbeiten' : 'Neuer Schritt'} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <SelectControl
          label="Aktion"
          value={typ}
          options={STEP_TYPES.map((entry) => ({ value: entry.key, label: entry.name }))}
          onChange={(value) => setTyp(value as StepTypeKey)}
        />

        {typ === 'START_TOOL' && (
          <Field label="Nummer" error={zeigeFehler ? problem ?? '' : ''}>
            {(field) => (
              <TextInput
                {...field}
                value={toolNr}
                className="w-28"
                onChange={(e) => setToolNr(e.target.value)}
              />
            )}
          </Field>
        )}

        {typ === 'RELATION' && (
          <>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium">Relation</span>
              <div className="relative">
                <Search size={13} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <TextInput
                  aria-label="Relation suchen"
                  value={suche}
                  placeholder="Name, Nummer oder Syntax"
                  className="pl-7"
                  onChange={(e) => setSuche(e.target.value)}
                />
              </div>
              <div className="max-h-36 overflow-y-auto border-y border-border py-1">
                {sichtbareRelationen.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => selectRelation(entry.id)}
                    className={`w-full px-2 py-1.5 text-left text-xs ${
                      entry.id === relationId ? 'bg-secondary font-medium' : 'hover:bg-secondary/60'
                    }`}
                  >
                    <span className="block truncate">{entry.name}</span>
                    <span className="block truncate font-mono text-[10px] text-muted-foreground">
                      {formatRelationSyntax(entry)}
                    </span>
                  </button>
                ))}
                {sichtbareRelationen.length === 0 && (
                  <p className="px-2 py-1 text-xs text-muted-foreground">Keine Treffer.</p>
                )}
              </div>
            </div>

            {relation && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[minmax(80px,0.8fr)_minmax(120px,1.5fr)_130px_28px] gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Parameter</span><span>Wert</span><span>Quelle</span><span />
                </div>
                {relation.params.map((raw, index) => (
                  <BindingRow
                    key={index}
                    label={`${index + 1}. ${raw === '' ? '(leer)' : raw}`}
                    binding={bindingFor(index)}
                    dataSources={dataSources.list}
                    onChange={(binding) => setBinding(index, binding)}
                  />
                ))}
                {relation.params.length === 0 && (
                  <p className="text-xs text-muted-foreground">Keine Parameter.</p>
                )}
              </div>
            )}

            {relation?.allowExtraParams && (
              <div className="flex flex-col gap-2 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Zusatzparameter</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExtraParams((current) => [...current, { source: 'fixed', value: '' }])}
                  >
                    <Plus size={14} /> Parameter
                  </Button>
                </div>
                {extraParams.map((binding, index) => (
                  <BindingRow
                    key={index}
                    label={`${index + 1}.`}
                    binding={binding}
                    dataSources={dataSources.list}
                    removable
                    onChange={(next) => setExtraParams((current) => current.map((value, at) => at === index ? next : value))}
                    onRemove={() => setExtraParams((current) => current.filter((_, at) => at !== index))}
                  />
                ))}
              </div>
            )}

            {relation?.verb === 'GET_RELATION' && (
              <Field label="Ergebnisname">
                {(field) => (
                  <TextInput
                    {...field}
                    value={resultKey}
                    placeholder="optional"
                    onChange={(e) => setResultKey(e.target.value)}
                  />
                )}
              </Field>
            )}
          </>
        )}

        {zeigeFehler && problem && typ === 'RELATION' && (
          <p className="text-xs text-destructive">{problem}</p>
        )}

        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>Abbrechen</Button>
          <Button size="sm" onClick={speichern}>Speichern</Button>
        </div>
      </div>
    </FormularKarte>
  )
}
