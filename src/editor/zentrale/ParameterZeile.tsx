// ParameterZeile — EINE Zeile eines Aktions-Parameters: Name | Quelle | Wert.
//
// Aus StepForm herausgeloest (2026-07-24), weil die Datei ueber den
// 500-Zeilen-Deckel gewachsen war. Der Schnitt ist der natuerliche: hier die
// EINZELNE Parameterzeile mit ihren Wert-Steuerungen, drueben das Formular,
// das die Zeilen anordnet.
//
// Einzeilig, damit die Parameterliste in der schmalen Inspector-Spalte
// (340 px) nicht doppelt so hoch wird wie noetig. Lange Technikwerte kuerzen
// sich, der Tooltip zeigt sie ganz.

import { Link2, X } from 'lucide-react'
import { IconButton } from '@/ui/atoms/icon-button'
import { TextInput } from '@/ui/atoms/text-input'
import {
  ACTION_PARAM_SOURCES,
  AKTIONS_PLATZHALTER,
  type ActionParamBinding,
  type ActionParamSource,
  type ErgebnisSchritt,
} from '../../core/data/aktionen'
import type { DataSource } from '../../core/data/dataSources'
import type { FeldUebernahmeZiel } from './feldUebernahme'
import { blockValueKey, type BlockValueOption } from './helfer'
import { SchrittSelect } from './SchrittSelect'

// Anzeige = der Platzhalter selbst, wie er in der Relations-Syntax steht
// (Fachbegriff-Entscheidung 2026-07-15, keine erfundenen Klarnamen).
const CONTEXT_OPTIONS = AKTIONS_PLATZHALTER.map((value) => ({ value, label: value }))

// Klarnamen der Parameterquellen — Editor-Tabelle (Muster optionColors):
// kurz genug fuer die schmale Quelle-Spalte (Nutzer-Go 2026-07-22), und die
// Namen bleiben aus dem Runtime-Buendel heraus (dort zaehlen nur die Keys).
const QUELLEN_NAMEN: Record<ActionParamSource, string> = {
  fixed: 'Fest',
  context: 'Ereigniswert',
  data_field: 'Datenfeld',
  block_value: 'Baustein',
  previous_result: 'Vorheriger Schritt',
  step_result: 'Ergebnis von Schritt',
  se_variable: 'SE VAR-Array',
}

// Die Wert-Steuerung EINES Parameters — welche es ist, bestimmt die Quelle.
function BindingValue({
  binding,
  dataSources,
  blockValues,
  schritte,
  onChange,
}: {
  binding: ActionParamBinding
  dataSources: readonly DataSource[]
  blockValues: readonly BlockValueOption[]
  schritte: readonly ErgebnisSchritt[]
  onChange: (binding: ActionParamBinding) => void
}) {
  if (binding.source === 'previous_result') {
    return (
      <div className="flex h-7 items-center rounded border border-input bg-secondary/50 px-2 text-xs text-muted-foreground">
        Ergebnis des vorherigen Schritts
      </div>
    )
  }
  if (binding.source === 'step_result') {
    // GET-Schritte davor, per Position angeboten — kein Namen-Vergeben,
    // nur anklicken (Nutzer-Entscheidung 2026-07-17).
    return (
      <SchrittSelect
        value={binding.value}
        onChange={(e) => onChange({ ...binding, value: e.target.value })}
      >
        <option value="">
          {schritte.length === 0 ? '(kein GET-Schritt davor)' : '— wählen —'}
        </option>
        {schritte.map((s) => (
          <option key={s.id} value={s.id}>{`Schritt ${s.nr} — ${s.name}`}</option>
        ))}
      </SchrittSelect>
    )
  }
  if (binding.source === 'context') {
    return (
      <SchrittSelect
        value={binding.value}
        onChange={(e) => onChange({ ...binding, value: e.target.value })}
      >
        <option value="">— wählen —</option>
        {CONTEXT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </SchrittSelect>
    )
  }
  if (binding.source === 'data_field') {
    const selectedSource = dataSources.find((source) => source.id === binding.dataSourceId)
    return (
      <div className="grid grid-cols-2 gap-1">
        <SchrittSelect
          className="min-w-0"
          value={binding.dataSourceId ?? ''}
          onChange={(e) => onChange({ ...binding, dataSourceId: e.target.value, value: '' })}
        >
          <option value="">— Quelle —</option>
          {dataSources.map((source) => (
            <option key={source.id} value={source.id}>{source.name}</option>
          ))}
        </SchrittSelect>
        <SchrittSelect
          className="min-w-0"
          value={binding.value}
          onChange={(e) => onChange({ ...binding, value: e.target.value })}
        >
          <option value="">— Feld —</option>
          {selectedSource?.fields.map((field) => (
            <option key={field.code} value={field.code}>{field.label}</option>
          ))}
        </SchrittSelect>
      </div>
    )
  }
  if (binding.source === 'block_value') {
    const current = binding.blockId ? blockValueKey(binding.blockId, binding.value) : ''
    return (
      <SchrittSelect
        value={current}
        onChange={(e) => {
          const selected = blockValues.find((option) => option.key === e.target.value)
          onChange(selected
            ? { source: 'block_value', blockId: selected.blockId, value: selected.prop }
            : { source: 'block_value', blockId: '', value: '' })
        }}
      >
        <option value="">— Baustein —</option>
        {blockValues.map((option) => (
          <option key={option.key} value={option.key}>{option.label}</option>
        ))}
      </SchrittSelect>
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

export function ParameterZeile({
  label,
  binding,
  dataSources,
  blockValues,
  schritte,
  removable = false,
  ausloeser,
  onChange,
  onAusloeser,
  onRemove,
}: {
  label: string
  binding: ActionParamBinding
  dataSources: readonly DataSource[]
  blockValues: readonly BlockValueOption[]
  schritte: readonly ErgebnisSchritt[]
  removable?: boolean
  ausloeser?: FeldUebernahmeZiel
  onChange: (binding: ActionParamBinding) => void
  onAusloeser?: (anchor: HTMLElement) => void
  onRemove?: () => void
}) {
  const setSource = (source: ActionParamSource) => {
    if (source === 'block_value' && blockValues.length === 1) {
      const target = blockValues[0]
      onChange({ source, blockId: target.blockId, value: target.prop })
      return
    }
    const value = source === 'context'
      ? 'VALUE'
      // Genau EIN GET davor: direkt vorwählen — der häufigste Fall
      // (GET Index holen → benutzen) kommt dann ohne zweiten Klick aus.
      : source === 'step_result' && schritte.length === 1
        ? schritte[0].id
        : ''
    onChange({ source, value })
  }

  return (
    <div className="flex items-center gap-1">
      <span className="w-14 shrink-0 truncate font-mono text-[0.6875rem]" title={label}>{label}</span>
      <SchrittSelect
        className="w-24 shrink-0"
        value={binding.source}
        onChange={(e) => setSource(e.target.value as ActionParamSource)}
      >
        {ACTION_PARAM_SOURCES.map((source) => (
          <option
            key={source}
            value={source}
            disabled={(source === 'data_field' && dataSources.length === 0)
              || (source === 'block_value' && blockValues.length === 0)
              || (source === 'step_result' && schritte.length === 0)}
          >
            {QUELLEN_NAMEN[source]}
          </option>
        ))}
      </SchrittSelect>
      <div
        className="min-w-0 flex-1"
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || !ausloeser || !onAusloeser) return
          e.preventDefault()
          onAusloeser(e.currentTarget)
        }}
      >
        <BindingValue
          binding={binding}
          dataSources={dataSources}
          blockValues={blockValues}
          schritte={schritte}
          onChange={onChange}
        />
      </div>
      {ausloeser && onAusloeser && (
        <IconButton
          aria-label={ausloeser === 'feld' ? 'Feld übernehmen' : 'Tabelle übernehmen'}
          onClick={(e) => onAusloeser(e.currentTarget)}
        >
          <Link2 size={13} />
        </IconButton>
      )}
      {removable && onRemove && (
        <IconButton aria-label={`${label} entfernen`} onClick={onRemove}><X size={13} /></IconButton>
      )}
    </div>
  )
}
