import {
  RELATION_VERBS,
  type RelationTemplate,
  type RelationVerb,
} from '../core/data/relations'
import { ACTION_VALUE_ID_ATTR, type ActionParamBinding } from '../core/data/aktionen'
import { bootSe, onSeAntwort, seGlobal } from './bridge'
import {
  findRuntimeDataSource,
  getField,
  isRecord,
  rowsFor,
} from './data'
import { meldeFehler } from './meldung'

export interface RelationAntwort {
  wert: string

  roh: unknown
}

function fehlertext(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export type RuntimeRelation = Pick<RelationTemplate, 'id' | 'verb' | 'nr' | 'params'>

export function findRuntimeRelation(list: unknown, id: string): RuntimeRelation | undefined {
  if (!Array.isArray(list) || id === '') return undefined
  for (const entry of list) {
    if (!isRecord(entry) || entry.id !== id) continue
    if (typeof entry.verb !== 'string' || !RELATION_VERBS.includes(entry.verb as RelationVerb)) continue
    if (typeof entry.nr !== 'string' || entry.nr === '') continue
    if (!Array.isArray(entry.params) || entry.params.some((p) => typeof p !== 'string')) continue
    return { id, verb: entry.verb as RelationVerb, nr: entry.nr, params: entry.params as string[] }
  }
  return undefined
}

const RESULT_KEYS = [
  'RESULT', 'result', 'PINDEX', 'pindex', 'INDEX', 'index',
  '0_10', 'KEY', 'key', 'ID', 'id', 'VALUE', 'value',
] as const

function parsed(value: unknown): unknown {
  if (typeof value !== 'string') return value
  try { return JSON.parse(value) as unknown } catch { return undefined }
}

function scalar(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const t = value.trim()
    return t === '' ? undefined : t
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return undefined
}

function firstScalar(value: unknown, depth: number): string | undefined {
  if (depth > 12) return undefined
  const direct = scalar(value)
  if (direct !== undefined) return direct
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = firstScalar(entry, depth + 1)
      if (found !== undefined) return found
    }
    return undefined
  }
  if (!isRecord(value)) return undefined
  for (const key of RESULT_KEYS) {
    if (!(key in value)) continue
    const found = firstScalar(value[key], depth + 1)
    if (found !== undefined) return found
  }
  for (const entry of Object.values(value)) {
    const found = firstScalar(entry, depth + 1)
    if (found !== undefined) return found
  }
  return undefined
}

export function extractRelationResult(raw: unknown): string | undefined {
  const value = parsed(raw)
  if (!isRecord(value)) return undefined
  for (const key of RESULT_KEYS) {
    if (!(key in value)) continue
    const found = firstScalar(value[key], 0)
    if (found !== undefined) return found
  }
  for (const entry of Object.values(value)) {
    if (Array.isArray(entry)) {
      for (const item of entry) {
        const found = extractRelationResult(item)
        if (found !== undefined) return found
      }
    } else if (isRecord(entry)) {
      const found = extractRelationResult(entry)
      if (found !== undefined) return found
    }
  }
  return undefined
}

const SATZ_SCHLUESSEL = ['RESULT', 'result'] as const

export function extractSatzAntwort(raw: unknown, tiefe = 0): string | undefined {
  if (tiefe > 12) return undefined
  const value = typeof raw === 'string' ? parsed(raw) : raw
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = extractSatzAntwort(entry, tiefe + 1)
      if (found !== undefined) return found
    }
    return undefined
  }
  if (!isRecord(value)) return undefined
  for (const key of SATZ_SCHLUESSEL) {
    const wert = value[key]
    if (typeof wert === 'string') return wert
    if (typeof wert === 'number' || typeof wert === 'boolean') return String(wert)
  }
  for (const entry of Object.values(value)) {
    const found = extractSatzAntwort(entry, tiefe + 1)
    if (found !== undefined) return found
  }
  return undefined
}

export function extractRelationFeld(raw: unknown, code: string, tiefe = 0): string {
  if (code.trim() === '' || tiefe > 12) return ''
  const value = typeof raw === 'string' ? parsed(raw) : raw
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = extractRelationFeld(entry, code, tiefe + 1)
      if (found !== '') return found
    }
    return ''
  }
  if (!isRecord(value)) return ''
  const direkt = getField(value, code)
  if (direkt !== '') return direkt
  for (const entry of Object.values(value)) {
    const found = extractRelationFeld(entry, code, tiefe + 1)
    if (found !== '') return found
  }
  return ''
}

export function seMessageKeys(seData: unknown): string[] {
  if (!isRecord(seData)) return []
  return Object.keys(seData).filter((key) => /^Message\d+$/.test(key))
}

export function newSeMessageResult(
  seData: unknown,
  before: ReadonlySet<string>,
  satzAntwort = false,
): RelationAntwort | undefined {
  if (!isRecord(seData)) return undefined
  const keys = seMessageKeys(seData)
    .filter((key) => !before.has(key))
    .sort((a, b) => Number(b.slice(7)) - Number(a.slice(7)))
  for (const key of keys) {
    const found = satzAntwort ? extractSatzAntwort(seData[key]) : extractRelationResult(seData[key])
    if (found !== undefined) return { wert: found, roh: seData[key] }
  }
  return undefined
}

export interface RelationOptionen {
  still?: boolean
  satzAntwort?: boolean
}

interface GetJob {
  template: RuntimeRelation
  params: string[]
  resolve: (antwort: RelationAntwort) => void
  optionen: RelationOptionen
}

const getQueue: GetJob[] = []
let getBusy = false
const GET_TIMEOUT_MS = 6_000
const GET_POLL_MS = 100

function runNextGet(): void {
  if (getBusy || getQueue.length === 0) return
  getBusy = true
  const job = getQueue.shift()!
  const g = seGlobal()
  const before = new Set(seMessageKeys(g.SEDATA))
  let settled = false

  const finish = (wert: string, roh: unknown): void => {
    if (settled) return
    settled = true
    unsubscribe()
    clearInterval(poll)
    clearTimeout(timeout)
    getBusy = false
    job.resolve({ wert, roh })

    queueMicrotask(runNextGet)
  }

  const satzAntwort = job.optionen.satzAntwort === true

  const unsubscribe = onSeAntwort((raw) => {
    const result = satzAntwort ? extractSatzAntwort(raw) : extractRelationResult(raw)
    if (result !== undefined) finish(result, raw)
  })

  const poll = setInterval(() => {
    const antwort = newSeMessageResult(seGlobal().SEDATA, before, satzAntwort)
    if (antwort !== undefined) finish(antwort.wert, antwort.roh)
  }, GET_POLL_MS)

  const timeout = setTimeout(() => {
    if (!job.optionen.still) {
      meldeFehler(`Daten laden: SoftEngine hat nicht geantwortet (Relation Nr. ${job.template.nr}).`)
    }
    finish('', undefined)
  }, GET_TIMEOUT_MS)

  if (typeof g.basisHTML_SND_MSG !== 'function') {
    if (!job.optionen.still) {
      meldeFehler('Daten laden nicht möglich: keine Verbindung zu SoftEngine.')
    }
    finish('', undefined)
    return
  }
  try {
    g.basisHTML_SND_MSG('GET_RELATION', {
      NR: job.template.nr,
      PARAMS: job.params,
    })
  } catch (error) {
    if (!job.optionen.still) {
      meldeFehler(`Daten laden fehlgeschlagen (Relation Nr. ${job.template.nr}): ${fehlertext(error)}`)
    }
    finish('', undefined)
  }
}

export function executeRelation(
  template: RuntimeRelation,
  params: readonly string[],
  optionen: RelationOptionen = {},
): Promise<RelationAntwort> {
  bootSe()
  const g = seGlobal()
  if (template.verb !== 'GET_RELATION') {
    if (typeof g.basisHTML_SND_MSG !== 'function') {
      meldeFehler('Speichern nicht möglich: keine Verbindung zu SoftEngine. Die Eingabe wurde NICHT übernommen.')
      return Promise.resolve({ wert: '', roh: undefined })
    }
    try {
      g.basisHTML_SND_MSG(template.verb, { NR: template.nr, PARAMS: [...params] })
    } catch (error) {
      meldeFehler(`Speichern fehlgeschlagen (Relation Nr. ${template.nr}): ${fehlertext(error)}`)
    }

    return Promise.resolve({ wert: '', roh: undefined })
  }
  return new Promise((resolve) => {
    getQueue.push({ template, params: [...params], resolve, optionen })
    runNextGet()
  })
}

export interface RuntimeActionValues {
  context: Readonly<Record<string, string | undefined>>
  previousResult: string

  stepResults?: readonly string[]

  stepRohErgebnisse?: readonly unknown[]

  gewaehlteZeile?: (geberId: string) => unknown

  // Gesetzt, wenn die Kette gerade eine erfasste Zeile abarbeitet (G4):
  // liefert den Zellwert der Spalte dieser einen Zeile.
  erfassteZelle?: (blockId: string, spaltenIndex: number) => string
}

function resolveBlockValue(binding: ActionParamBinding, runtime: unknown): string {
  if (!isRecord(runtime)) return ''
  const doc = runtime.document as ParentNode | undefined
  if (!doc || typeof doc.querySelectorAll !== 'function') return ''
  const element = Array.from(doc.querySelectorAll<HTMLElement>(`[${ACTION_VALUE_ID_ATTR}]`))
    .find((candidate) => candidate.getAttribute(ACTION_VALUE_ID_ATTR) === binding.blockId)
  if (!element) return ''
  const raw = (element as unknown as Record<string, unknown>)[binding.value]
  return raw == null ? '' : String(raw)
}

export function resolveActionParam(
  binding: ActionParamBinding,
  values: RuntimeActionValues,
  runtime: unknown = seGlobal(),
): string {
  if (binding.source === 'aus') return ''
  if (binding.source === 'fixed') return binding.value
  if (binding.source === 'context') return values.context[binding.value] ?? ''
  if (binding.source === 'previous_result') return values.previousResult
  if (binding.source === 'step_result') {
    const idx = Number(binding.value)
    if (!Number.isInteger(idx) || idx < 0) return ''

    const feld = binding.ergebnisFeld ?? ''
    if (feld === '') return values.stepResults?.[idx] ?? ''
    return extractRelationFeld(values.stepRohErgebnisse?.[idx], feld)
  }
  if (binding.source === 'block_value') return resolveBlockValue(binding, runtime)
  if (binding.source === 'erfassungszelle') {
    const index = Number(binding.value)
    if (!Number.isInteger(index) || index < 0) return ''
    return values.erfassteZelle?.(binding.blockId ?? '', index) ?? ''
  }
  if (binding.source === 'gewaehlte_zeile') {
    const zeile = values.gewaehlteZeile?.(binding.blockId ?? '')
    return zeile === undefined ? '' : getField(zeile, binding.value)
  }
  if (!isRecord(runtime)) return ''

  if (binding.source === 'se_variable') {
    const seData = runtime.SEDATA
    if (!isRecord(seData) || !isRecord(seData.Daten) || !isRecord(seData.Daten.VARArrays)) return ''
    const value = seData.Daten.VARArrays[binding.value]
    return value == null ? '' : String(value)
  }

  const source = findRuntimeDataSource(runtime.FF_DATA_SOURCES, binding.dataSourceId ?? '')
  if (!source) return ''
  const rows = rowsFor(runtime.SEDATA, source.name, source.tableId)
  const pindex = values.context.PINDEX ?? ''

  const row = pindex !== '' && source.indexField !== ''
    ? rows.find((entry) => getField(entry, source.indexField) === pindex)
    : rows[0]
  return row ? getField(row, binding.value) : ''
}
