// softengine/relations — Relation-Vorlagen auflösen + Schreibweg (PUT)
//
// Teil der gemeinsamen SoftEngine-Schicht (Umzug 2026-07-15 aus
// blocks/kanban/seRuntime.ts, verhaltensgleich). Die GET-Warteschlange
// (Antworten aus SEDATA.Message<N>, immer nur eine Anfrage in Flug —
// Muster seGetNewIndex) zieht mit Fahrplan-Schritt 3 hier ein.
//
// Abhängigkeitsregel der Schicht: Bausteine importieren src/softengine/*,
// diese Schicht kennt NIE einen Baustein.

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

// Relation-Vorlage in der EXPORTIERTEN Maske (Kap. 5.5): die Vorlagen sind
// benutzerdefiniert und leben im Editor-localStorage — exportMask bettet die
// benutzten Vorlagen als `window.FF_RELATIONS = […]` ein (Muster
// FF_DATA_SOURCES; window. statt var wegen WebUI-Kapselung, s. exportMask).
// Der Anzeigename reist nicht mit (Laufzeit braucht nur
// Technikwerte). Kaputte/fremde Einträge werden ignoriert — nie raten.
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

// ---------- Allgemeine Relations-Ausführung ----------

const RESULT_KEYS = [
  'RESULT', 'result', 'PINDEX', 'pindex', 'INDEX', 'index',
  '0_10', 'KEY', 'key', 'ID', 'id', 'VALUE', 'value',
] as const

function parsed(value: unknown): unknown {
  if (typeof value !== 'string') return value
  try { return JSON.parse(value) as unknown } catch { return undefined }
}

function scalar(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() === '' ? undefined : value.trim()
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

// GET_RELATION-Antworten sind nicht nummeriert oder einer Anfrage
// zugeordnet. Darum wird nur ein expliziter Ergebnis-/Index-Schlüssel als
// Antwort akzeptiert; irgendein fremder Skalar im Callback reicht nicht.
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

export function seMessageKeys(seData: unknown): string[] {
  if (!isRecord(seData)) return []
  return Object.keys(seData).filter((key) => /^Message\d+$/.test(key))
}

export function newSeMessageResult(
  seData: unknown,
  before: ReadonlySet<string>,
): string | undefined {
  if (!isRecord(seData)) return undefined
  const keys = seMessageKeys(seData)
    .filter((key) => !before.has(key))
    .sort((a, b) => Number(b.slice(7)) - Number(a.slice(7)))
  for (const key of keys) {
    const found = extractRelationResult(seData[key])
    if (found !== undefined) return found
  }
  return undefined
}

interface GetJob {
  template: RuntimeRelation
  params: string[]
  resolve: (value: string) => void
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

  const finish = (value: string): void => {
    if (settled) return
    settled = true
    unsubscribe()
    clearInterval(poll)
    clearTimeout(timeout)
    getBusy = false
    job.resolve(value)
    runNextGet()
  }

  // Abonnieren, BEVOR gesendet wird: Test-Stubs und manche Hosts antworten
  // synchron. Der Callback ist für BWMSG und WWMSG derselbe Hauptweg.
  const unsubscribe = onSeAntwort((raw) => {
    const result = extractRelationResult(raw)
    if (result !== undefined) finish(result)
  })

  const poll = setInterval(() => {
    const result = newSeMessageResult(seGlobal().SEDATA, before)
    if (result !== undefined) finish(result)
  }, GET_POLL_MS)
  const timeout = setTimeout(() => { finish('') }, GET_TIMEOUT_MS)

  if (typeof g.basisHTML_SND_MSG !== 'function') {
    finish('')
    return
  }
  try {
    g.basisHTML_SND_MSG('GET_RELATION', {
      NR: job.template.nr,
      PARAMS: job.params,
    })
  } catch {
    finish('')
  }
}

// Ein gemeinsamer Vertrag für Aktionsketten: PUT/PUTADD werden nur gesendet;
// GET wartet seriell auf die plattformneutral empfangene Antwort.
export function executeRelation(
  template: RuntimeRelation,
  params: readonly string[],
): Promise<string> {
  bootSe()
  const g = seGlobal()
  if (template.verb !== 'GET_RELATION') {
    if (typeof g.basisHTML_SND_MSG === 'function') {
      try {
        g.basisHTML_SND_MSG(template.verb, { NR: template.nr, PARAMS: [...params] })
      } catch { /* nicht in SE */ }
    }
    return Promise.resolve('')
  }
  return new Promise((resolve) => {
    getQueue.push({ template, params: [...params], resolve })
    runNextGet()
  })
}

// ---------- Parameterquellen der Relationsaktion ----------

export interface RuntimeActionValues {
  context: Readonly<Record<string, string | undefined>>
  previousResult: string
  // Ergebnis je Ketten-Schritt in Ausführungs-Reihenfolge (runEvent führt
  // die Liste; nur GET-Schritte liefern etwas, alle anderen ''). Der
  // Zwischenspeicher des Nutzers: „Ergebnis von Schritt N" (2026-07-17).
  stepResults?: readonly string[]
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
  if (binding.source === 'fixed') return binding.value
  if (binding.source === 'context') return values.context[binding.value] ?? ''
  if (binding.source === 'previous_result') return values.previousResult
  if (binding.source === 'step_result') {
    // In der Maske traegt die Bindung die 0-basierte Ketten-Position
    // (Export uebersetzt die Editor-Schritt-id); Unsinn loest zu '' auf.
    const idx = Number(binding.value)
    return Number.isInteger(idx) && idx >= 0 ? values.stepResults?.[idx] ?? '' : ''
  }
  if (binding.source === 'block_value') return resolveBlockValue(binding, runtime)
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
  // Mit Ereignis-Index (z. B. Kanban-Karte) die passende Zeile; OHNE (z. B.
  // Knopf-Klick) die ERSTE Zeile — dieselbe Regel wie die Feld-Hydrierung
  // (feldRuntime). Vorher lief der Knopf-Fall still auf '' (Befund
  // 2026-07-17: PUTs am Knopf kamen nie an ihre Feldwerte).
  const row = pindex !== '' && source.indexField !== ''
    ? rows.find((entry) => getField(entry, source.indexField) === pindex)
    : rows[0]
  return row ? getField(row, binding.value) : ''
}
