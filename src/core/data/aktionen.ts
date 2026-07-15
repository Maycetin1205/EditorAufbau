// Aktionsketten am Baustein je Ereignis. Die Ketten sind reine Daten im
// Block-Baum; die konkrete Ausfuehrung gehoert in die Export-Runtime.

import type { DataSource } from './dataSources'
import type { RelationTemplate } from './relations'
import { unknownPlaceholders } from './relations'

// ---------- Schritt-Typen ----------

export type StepTypeKey = 'START_TOOL' | 'RELATION'

export interface StepTypeSpec {
  key: StepTypeKey
  name: string
}

export const STEP_TYPES: readonly StepTypeSpec[] = [
  { key: 'START_TOOL', name: 'Werkzeug starten' },
  { key: 'RELATION', name: 'Relation' },
]

export function stepTypeName(typeKey: string): string {
  return STEP_TYPES.find((t) => t.key === typeKey)?.name ?? typeKey
}

// ---------- Parameterquellen fuer Relationsschritte ----------

export const ACTION_PARAM_SOURCES = [
  { key: 'fixed', name: 'Fester Wert' },
  { key: 'context', name: 'Ereigniswert' },
  { key: 'data_field', name: 'Feld der Datenquelle' },
  { key: 'previous_result', name: 'Vorheriger Schritt' },
  { key: 'se_variable', name: 'SE VAR-Array' },
] as const

export type ActionParamSource = (typeof ACTION_PARAM_SOURCES)[number]['key']

export interface ActionParamBinding {
  source: ActionParamSource
  // fixed: Wert, context: PINDEX/VALUE/NOW_DATE, data_field: Feldcode,
  // se_variable: Variablenname. previous_result braucht keinen Wert.
  value: string
  // Nur data_field: stabile ID der Datenquellen-Vorlage. Der Feldcode allein
  // ist zwischen verschiedenen Tabellen nicht eindeutig.
  dataSourceId?: string
}

interface ActionStepBase {
  id: string
  type: StepTypeKey
  // Optionaler Name fuer das Ergebnis eines Schritts. START_TOOL liefert
  // heute keines; RELATION nutzt ihn spaeter fuer GET-Ergebnisse.
  resultKey: string
}

export interface StartToolStep extends ActionStepBase {
  type: 'START_TOOL'
  toolNr: string
  toolParams: string[]
}

export interface RelationStep extends ActionStepBase {
  type: 'RELATION'
  // Stabile ID aus dem RelationStore; Syntax wird niemals in den Schritt
  // kopiert und bleibt damit an genau einer Stelle gepflegt.
  relationId: string
  // Jede Syntaxposition genau einmal und in derselben Reihenfolge. Auch feste
  // und leere Parameter bleiben sichtbar und koennen bei Bedarf eine andere
  // Wertquelle erhalten.
  params: ActionParamBinding[]
  // Nur fuer Vorlagen mit abschliessendem ... relevant.
  extraParams: ActionParamBinding[]
}

export type ActionStep = StartToolStep | RelationStep
export type BlockEventsMap = Record<string, ActionStep[]>

export function createStep(typeKey: StepTypeKey): ActionStep {
  const base = { id: crypto.randomUUID(), resultKey: '' }
  return typeKey === 'RELATION'
    ? { ...base, type: 'RELATION', relationId: '', params: [], extraParams: [] }
    : { ...base, type: 'START_TOOL', toolNr: '', toolParams: [] }
}

// In Werkzeug-Parametern erlaubte Platzhalter.
export const AKTIONS_PLATZHALTER = ['PINDEX', 'VALUE', 'NOW_DATE'] as const

// Syntaxpositionen werden wie im OG-Editor vollstaendig aufgeteilt: normale
// Werte bleiben feste Vorbelegung, leere Positionen bleiben leer. Nur ein
// vollstaendiger bekannter {KONTEXT}-Wert wird automatisch zugeordnet;
// installationsspezifische Platzhalter bleiben bewusst offen.
export function defaultRelationParams(
  relation: Pick<RelationTemplate, 'params'>,
): ActionParamBinding[] {
  return relation.params.map((raw) => {
    const placeholder = /^\{([A-Za-z0-9_]+)\}$/.exec(raw)?.[1]
    return placeholder && (AKTIONS_PLATZHALTER as readonly string[]).includes(placeholder)
      ? { source: 'context', value: placeholder }
      : { source: 'fixed', value: placeholder ? '' : raw }
  })
}

// ---------- Strukturelle Pruefung ----------

export type RuntimeStep = Omit<StartToolStep, 'id'> | Omit<RelationStep, 'id'>

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function bindingFields(raw: unknown): ActionParamBinding | null {
  if (!isRecord(raw)) return null
  if (
    typeof raw.source !== 'string'
    || !ACTION_PARAM_SOURCES.some((source) => source.key === raw.source)
    || typeof raw.value !== 'string'
  ) return null
  if (raw.dataSourceId !== undefined && typeof raw.dataSourceId !== 'string') return null
  return {
    source: raw.source as ActionParamSource,
    value: raw.value,
    ...(typeof raw.dataSourceId === 'string' ? { dataSourceId: raw.dataSourceId } : {}),
  }
}

function stepFields(raw: unknown): RuntimeStep | null {
  if (!isRecord(raw) || typeof raw.type !== 'string' || typeof raw.resultKey !== 'string') {
    return null
  }
  if (raw.type === 'START_TOOL') {
    if (typeof raw.toolNr !== 'string') return null
    if (!Array.isArray(raw.toolParams) || raw.toolParams.some((p) => typeof p !== 'string')) return null
    return {
      type: 'START_TOOL',
      resultKey: raw.resultKey,
      toolNr: raw.toolNr,
      toolParams: [...raw.toolParams] as string[],
    }
  }
  if (raw.type === 'RELATION') {
    if (typeof raw.relationId !== 'string') return null
    if (!Array.isArray(raw.extraParams)) return null
    if (!Array.isArray(raw.params) && !isRecord(raw.bindings)) return null
    const params: ActionParamBinding[] = []
    if (Array.isArray(raw.params)) {
      for (const value of raw.params) {
        const binding = bindingFields(value)
        if (!binding) return null
        params.push(binding)
      }
    }
    // Kurzzeitig im Browser gespeicherte Vorab-Version mit `bindings` wird
    // als leere Positionsliste geladen; das Formular setzt beim Bearbeiten
    // die Vorlagen-Defaults ein. Keine kaputte Kette wegen unseres Umbaus.
    const extraParams: ActionParamBinding[] = []
    for (const value of raw.extraParams) {
      const binding = bindingFields(value)
      if (!binding) return null
      extraParams.push(binding)
    }
    return {
      type: 'RELATION',
      resultKey: raw.resultKey,
      relationId: raw.relationId,
      params,
      extraParams,
    }
  }
  return null
}

export function sanitizeBlockEvents(
  raw: unknown,
  allowedEvents: readonly string[],
): BlockEventsMap | undefined {
  if (!isRecord(raw)) return undefined
  const out: BlockEventsMap = {}
  for (const key of allowedEvents) {
    const chain = raw[key]
    if (!Array.isArray(chain) || chain.length === 0) continue
    const steps: ActionStep[] = []
    const seenIds = new Set<string>()
    let broken = false
    for (const entry of chain) {
      const fields = stepFields(entry)
      const id = isRecord(entry) && typeof entry.id === 'string' ? entry.id : ''
      if (!fields || id === '' || seenIds.has(id)) {
        broken = true
        break
      }
      seenIds.add(id)
      steps.push({ id, ...fields } as ActionStep)
    }
    if (!broken && steps.length > 0) out[key] = steps
  }
  return Object.keys(out).length > 0 ? out : undefined
}

// ---------- Export-Transport ----------

function withoutEditorId(step: ActionStep): RuntimeStep {
  if (step.type === 'START_TOOL') {
    return {
      type: step.type,
      resultKey: step.resultKey,
      toolNr: step.toolNr,
      toolParams: [...step.toolParams],
    }
  }
  return {
    type: step.type,
    resultKey: step.resultKey,
    relationId: step.relationId,
    params: step.params.map((binding) => ({ ...binding })),
    extraParams: step.extraParams.map((binding) => ({ ...binding })),
  }
}

export function serializeBlockEvents(
  events: BlockEventsMap | undefined,
  eventOrder: readonly string[],
): string | null {
  if (!events) return null
  const out: Record<string, RuntimeStep[]> = {}
  for (const key of eventOrder) {
    const steps = events[key]
    if (steps?.length) out[key] = steps.map(withoutEditorId)
  }
  return Object.keys(out).length > 0 ? JSON.stringify(out) : null
}

export function parseBlockEvents(raw: string | null): Record<string, RuntimeStep[]> {
  if (!raw) return {}
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {}
  }
  if (!isRecord(parsed)) return {}
  const out: Record<string, RuntimeStep[]> = {}
  for (const [key, chain] of Object.entries(parsed)) {
    if (!Array.isArray(chain) || chain.length === 0) continue
    const steps: RuntimeStep[] = []
    let broken = false
    for (const entry of chain) {
      const fields = stepFields(entry)
      if (!fields) {
        broken = true
        break
      }
      steps.push(fields)
    }
    if (!broken && steps.length > 0) out[key] = steps
  }
  return out
}

// ---------- Vollstaendigkeit ----------

function bindingProblem(binding: ActionParamBinding | undefined): boolean {
  if (!binding) return true
  if (binding.source === 'fixed' || binding.source === 'previous_result') return false
  if (binding.source === 'data_field') {
    return !binding.dataSourceId?.trim() || binding.value.trim() === ''
  }
  return binding.value.trim() === ''
}

export function stepProblem(
  step: ActionStep,
  relations?: readonly RelationTemplate[],
  dataSources?: readonly DataSource[],
): string | null {
  if (step.type === 'START_TOOL') {
    if (step.toolNr.trim() === '') {
      return `Schritt "${stepTypeName(step.type)}" hat keine Werkzeug-Nummer.`
    }
    if (step.toolParams.some((param) => param.trim() === '')) {
      return `Schritt "${stepTypeName(step.type)}" hat einen leeren Parameter.`
    }
    const unknown = step.toolParams.flatMap((param) => unknownPlaceholders(param, AKTIONS_PLATZHALTER))
    if (unknown.length > 0) {
      return `Schritt "${stepTypeName(step.type)}" hat einen unbekannten Platzhalter.`
    }
    return null
  }
  if (step.relationId === '') return 'Schritt "Relation" hat keine Vorlage.'
  if (!relations) return null
  const relation = relations.find((entry) => entry.id === step.relationId)
  if (!relation) return 'Schritt "Relation" verweist auf eine geloeschte Vorlage.'
  if (step.params.length !== relation.params.length) {
    return 'Schritt "Relation" hat nicht alle Syntaxparameter uebernommen.'
  }
  const missing = step.params.findIndex(bindingProblem)
  if (missing >= 0) return `Schritt "Relation": Parameter ${missing + 1} ist unvollstaendig.`
  if (!relation.allowExtraParams && step.extraParams.length > 0) {
    return 'Schritt "Relation" hat nicht erlaubte Zusatzparameter.'
  }
  if (step.extraParams.some(bindingProblem)) {
    return 'Schritt "Relation" hat einen leeren Zusatzparameter.'
  }
  const allBindings = [
    ...step.params,
    ...step.extraParams,
  ]
  const missingSource = allBindings.find((binding) =>
    binding?.source === 'data_field'
    && dataSources
    && !dataSources.some((source) => source.id === binding.dataSourceId),
  )
  if (missingSource) return 'Schritt "Relation" verweist auf eine geloeschte Datenquelle.'
  return null
}
