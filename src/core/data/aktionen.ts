import type { RelationTemplate } from './relations'

export type StepTypeKey = 'START_TOOL' | 'RELATION' | 'POPUP_OPEN' | 'POPUP_CLOSE'

export interface StepTypeSpec {
  key: StepTypeKey
  name: string
}

export const STEP_TYPES: readonly StepTypeSpec[] = [

  { key: 'START_TOOL', name: 'START_TOOL' },
  { key: 'RELATION', name: 'Relation' },

  { key: 'POPUP_OPEN', name: 'Popup öffnen' },
  { key: 'POPUP_CLOSE', name: 'Popup schließen' },
]

export function stepTypeName(typeKey: string): string {
  return STEP_TYPES.find((t) => t.key === typeKey)?.name ?? typeKey
}

export const ACTION_VALUE_ID_ATTR = 'data-ff-block-id'

export const ACTION_PARAM_SOURCES = [
  'fixed',
  'context',
  'data_field',
  'block_value',
  'gewaehlte_zeile',

  // „Wert aus Erfassungszelle <Spalte>": liefert je Ketten-Lauf den
  // sichtbaren Zellwert der jeweiligen erfassten Zeile — Herkunft egal,
  // gewaehlt oder frei getippt (Formularfeld-Prinzip, G4). blockId = die
  // Tabelle, value = der Spalten-Index. Die Kette laeuft einmal je Zeile.
  'erfassungszelle',
  'previous_result',
  'step_result',
  'se_variable',
] as const

export const GESPEICHERTE_PARAM_QUELLEN = [...ACTION_PARAM_SOURCES, 'aus'] as const

export type ActionParamSource = (typeof GESPEICHERTE_PARAM_QUELLEN)[number]

export interface ActionParamBinding {
  source: ActionParamSource

  value: string

  dataSourceId?: string

  blockId?: string

  ergebnisFeld?: string
}

export interface ErgebnisSchritt {
  id: string
  nr: number
  name: string

  quelleId?: string
}

export function ergebnisSchritteVor(
  chain: readonly ActionStep[],
  stepId: string | undefined, // undefined = neuer Schritt ans Kettenende
  relations: readonly RelationTemplate[] | undefined,
): ErgebnisSchritt[] {
  const eigene = stepId === undefined ? -1 : chain.findIndex((s) => s.id === stepId)
  const bis = eigene < 0 ? chain.length : eigene
  const out: ErgebnisSchritt[] = []
  for (let i = 0; i < bis; i++) {
    const s = chain[i]
    if (s.type !== 'RELATION') continue
    const rel = relations?.find((r) => r.id === s.relationId)
    if (!rel || rel.verb !== 'GET_RELATION') continue
    const quelleId = [...s.params, ...s.extraParams]
      .find((b) => b.source === 'data_field' && (b.dataSourceId ?? '') !== '')
      ?.dataSourceId
    out.push({
      id: s.id, nr: i + 1, name: rel.name,
      ...(quelleId === undefined ? {} : { quelleId }),
    })
  }
  return out
}

interface ActionStepBase {
  id: string
  type: StepTypeKey

  resultKey: string

  notiz?: string
}

export interface StartToolStep extends ActionStepBase {
  type: 'START_TOOL'
  toolNr: string
  toolParams: string[]
}

export interface RelationStep extends ActionStepBase {
  type: 'RELATION'

  relationId: string

  params: ActionParamBinding[]

  extraParams: ActionParamBinding[]
}

export interface PopupOpenStep extends ActionStepBase {
  type: 'POPUP_OPEN'
  popupId: string
}

export interface PopupCloseStep extends ActionStepBase {
  type: 'POPUP_CLOSE'
  popupId: string
}

export type PopupStep = PopupOpenStep | PopupCloseStep

export type ActionStep = StartToolStep | RelationStep | PopupStep
export type BlockEventsMap = Record<string, ActionStep[]>

export const AKTIONS_PLATZHALTER = ['PINDEX', 'VALUE', 'ZIMMER', 'NOW_DATE'] as const

export function defaultRelationParams(
  relation: Pick<RelationTemplate, 'params'>,
): ActionParamBinding[] {
  return relation.params.map((raw) => {
    const placeholder = /^\{([A-Za-z0-9_]+)\}$/.exec(raw)?.[1]
    return placeholder && (AKTIONS_PLATZHALTER as readonly string[]).includes(placeholder)
      ? { source: 'context', value: placeholder }
      : { source: 'fixed', value: '' }
  })
}

interface RuntimePopupFields {
  resultKey: string
  popupId?: string
  popup?: string
}

export type RuntimePopupStep =
  | (RuntimePopupFields & { type: 'POPUP_OPEN' })
  | (RuntimePopupFields & { type: 'POPUP_CLOSE' })

export type RuntimeStep =
  | Omit<StartToolStep, 'id'>
  | Omit<RelationStep, 'id'>
  | RuntimePopupStep

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function bindingFields(raw: unknown): ActionParamBinding | null {
  if (!isRecord(raw)) return null
  if (
    typeof raw.source !== 'string'
    || !(GESPEICHERTE_PARAM_QUELLEN as readonly string[]).includes(raw.source)
    || typeof raw.value !== 'string'
  ) return null
  if (raw.dataSourceId !== undefined && typeof raw.dataSourceId !== 'string') return null
  if (raw.blockId !== undefined && typeof raw.blockId !== 'string') return null
  if (raw.ergebnisFeld !== undefined && typeof raw.ergebnisFeld !== 'string') return null
  return {
    source: raw.source as ActionParamSource,
    value: raw.value,
    ...(typeof raw.dataSourceId === 'string' ? { dataSourceId: raw.dataSourceId } : {}),
    ...(typeof raw.blockId === 'string' ? { blockId: raw.blockId } : {}),

    ...(raw.source === 'step_result' && typeof raw.ergebnisFeld === 'string'
      ? { ergebnisFeld: raw.ergebnisFeld }
      : {}),
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
  if (raw.type === 'POPUP_OPEN' || raw.type === 'POPUP_CLOSE') {
    const popupId = typeof raw.popupId === 'string' ? raw.popupId : undefined
    const popup = typeof raw.popup === 'string' ? raw.popup : undefined
    if (popupId === undefined && popup === undefined) return null
    return {
      type: raw.type,
      resultKey: raw.resultKey,
      ...(popupId !== undefined ? { popupId } : {}),
      ...(popup !== undefined ? { popup } : {}),
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

      const notiz = isRecord(entry) && typeof entry.notiz === 'string' ? entry.notiz.trim() : ''
      steps.push({ id, ...fields, ...(notiz !== '' ? { notiz } : {}) } as ActionStep)
    }
    if (!broken && steps.length > 0) out[key] = steps
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function withoutEditorId(
  step: ActionStep,
  popupName: (id: string) => string,

  stepPosition: (id: string) => string,
): RuntimeStep {
  const binding = (b: ActionParamBinding): ActionParamBinding =>
    b.source === 'step_result' ? { ...b, value: stepPosition(b.value) } : { ...b }
  if (step.type === 'START_TOOL') {
    return {
      type: step.type,
      resultKey: step.resultKey,
      toolNr: step.toolNr,
      toolParams: [...step.toolParams],
    }
  }
  if (step.type === 'POPUP_OPEN' || step.type === 'POPUP_CLOSE') {
    return {
      type: step.type,
      resultKey: step.resultKey,
      popup: popupName(step.popupId),
    }
  }
  return {
    type: step.type,
    resultKey: step.resultKey,
    relationId: step.relationId,
    params: step.params.map(binding),
    extraParams: step.extraParams.map(binding),
  }
}

export function serializeBlockEvents(
  events: BlockEventsMap | undefined,
  eventOrder: readonly string[],

  popupName: (id: string) => string = () => '',
): string | null {
  if (!events) return null
  const out: Record<string, RuntimeStep[]> = {}
  for (const key of eventOrder) {
    const steps = events[key]
    if (!steps?.length) continue

    const position = new Map(steps.map((s, i) => [s.id, String(i)]))
    out[key] = steps.map((step) =>
      withoutEditorId(step, popupName, (id) => position.get(id) ?? '-1'))
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
