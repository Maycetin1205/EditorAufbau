// Aktionsketten am Baustein je Ereignis. Die Ketten sind reine Daten im
// Block-Baum; die konkrete Ausfuehrung gehoert in die Export-Runtime.

import type { DataSource } from './dataSources'
import type { RelationTemplate } from './relations'
import { unknownPlaceholders } from './relations'

// ---------- Schritt-Typen ----------

export type StepTypeKey = 'START_TOOL' | 'RELATION' | 'POPUP_OPEN' | 'POPUP_CLOSE' | 'QUELLE_SPEICHERN'

export interface StepTypeSpec {
  key: StepTypeKey
  name: string
}

export const STEP_TYPES: readonly StepTypeSpec[] = [
  // Anzeige-Name = SE-Fachbegriff selbst (Nutzer-Entscheidung 2026-07-15).
  { key: 'START_TOOL', name: 'START_TOOL' },
  { key: 'RELATION', name: 'Relation' },
  // Popup-Schritte (P-B) sind KEINE SE-Fachbegriffe — sie bekommen Klarnamen.
  { key: 'POPUP_OPEN', name: 'Popup öffnen' },
  { key: 'POPUP_CLOSE', name: 'Popup schließen' },
  // Sammel-Schreiben (Nutzer-Go 2026-07-17): ebenfalls Klarname.
  { key: 'QUELLE_SPEICHERN', name: 'Quelle speichern' },
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
  // Zwischenspeicher (Nutzer-Befund + -Vorschlag 2026-07-17): das Ergebnis
  // eines FRÜHEREN GET-Schritts der Kette, per Auswahl „Schritt N" — kein
  // Namen-Vergeben. Referenz-Beleg: SE-Log „Termin anlegen" (GET 640 →
  // PUTs auf den Index; ZWEI GET-Ergebnisse gleichzeitig in Gebrauch).
  { key: 'step_result', name: 'Ergebnis von Schritt' },
  { key: 'se_variable', name: 'SE VAR-Array' },
] as const

export type ActionParamSource = (typeof ACTION_PARAM_SOURCES)[number]['key']

export interface ActionParamBinding {
  source: ActionParamSource
  // fixed: Wert, context: PINDEX/VALUE/NOW_DATE, data_field: Feldcode,
  // se_variable: Variablenname. previous_result braucht keinen Wert.
  // step_result: im EDITOR die stabile Schritt-id (übersteht Umsortieren,
  // Muster popupId), in der MASKE die Position in der Kette (Editor-ids
  // reisen nie mit — serializeBlockEvents übersetzt).
  value: string
  // Nur data_field: stabile ID der Datenquellen-Vorlage. Der Feldcode allein
  // ist zwischen verschiedenen Tabellen nicht eindeutig.
  dataSourceId?: string
}

// GET-Schritte VOR einer Position — die Auswahl „Ergebnis von Schritt N"
// (StepForm) und die Gültigkeitsprüfung (stepProblem-Aufrufer) lesen
// dieselbe Liste. Nur echte GET-Vorlagen liefern ein Ergebnis; Schritte
// mit gelöschter Vorlage werden nicht angeboten (die blockt stepProblem).
export interface ErgebnisSchritt {
  id: string
  nr: number // 1-basierte Anzeige-Position in der Kette
  name: string
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
    out.push({ id: s.id, nr: i + 1, name: rel.name })
  }
  return out
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

// Im EDITOR: stabile Knoten-id der Popup-Seite (übersteht Umbenennen).
// Der Export übersetzt sie in den Klarnamen (Editor-ids reisen nie mit,
// s. serializeBlockEvents); die Laufzeit adressiert das ff-popup über
// sein name-Attribut — die Preflight erzwingt dafür eindeutige Namen.
// Öffnen/Schließen sind ZWEI Typen (je eine Diskriminante), damit
// TypeScript sie in den Schritt-Weichen sauber ausschließen kann.
export interface PopupOpenStep extends ActionStepBase {
  type: 'POPUP_OPEN'
  popupId: string
}

export interface PopupCloseStep extends ActionStepBase {
  type: 'POPUP_CLOSE'
  popupId: string
}

export type PopupStep = PopupOpenStep | PopupCloseStep

// „Quelle speichern" (Nutzer-Go 2026-07-17): schreibt alle seit dem letzten
// Daten-Push LOKAL GEÄNDERTEN Felder einer Quelle (setField-Spur der
// SoftEngine-Schicht — bausteinneutral: jeder Baustein, der lokal schreibt,
// ist automatisch dabei) über EINE frei wählbare Schreib-Vorlage
// (PUT/PUTADD, Platzhalter-Auflösung wie sendPut — nichts fest verdrahtet).
// pos/len je Feld stecken im Feldcode, die relId in der Quelle; konfiguriert
// wird nur Quelle + Vorlage + Herkunft des PINDEX (typisch: das benannte
// GET-Ergebnis des Schritts davor).
export interface QuelleSpeichernStep extends ActionStepBase {
  type: 'QUELLE_SPEICHERN'
  // Stabile ID der Datenquellen-Vorlage (reist unverändert in die Maske —
  // FF_DATA_SOURCES löst sie auf, wie das source-Attribut der Bausteine).
  dataSourceId: string
  // Stabile ID der Schreib-Vorlage (FF_RELATIONS, Muster RelationStep).
  relationId: string
  // Herkunft des PINDEX — dieselben Wertquellen wie Relationsparameter.
  pindex: ActionParamBinding
}

export type ActionStep = StartToolStep | RelationStep | PopupStep | QuelleSpeichernStep
export type BlockEventsMap = Record<string, ActionStep[]>

export function createStep(typeKey: StepTypeKey): ActionStep {
  const base = { id: crypto.randomUUID(), resultKey: '' }
  if (typeKey === 'RELATION') {
    return { ...base, type: 'RELATION', relationId: '', params: [], extraParams: [] }
  }
  if (typeKey === 'POPUP_OPEN' || typeKey === 'POPUP_CLOSE') {
    return { ...base, type: typeKey, popupId: '' }
  }
  if (typeKey === 'QUELLE_SPEICHERN') {
    // Vorbelegung „Vorheriger Schritt": der gelebte Fluss ist GET (Index
    // holen) → Quelle speichern — und damit ist der Schritt sofort gültig.
    return {
      ...base,
      type: 'QUELLE_SPEICHERN',
      dataSourceId: '',
      relationId: '',
      pindex: { source: 'previous_result', value: '' },
    }
  }
  return { ...base, type: 'START_TOOL', toolNr: '', toolParams: [] }
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

// Popup-Schritt unterwegs: im gespeicherten Baum trägt er die popupId
// (Editor), im data-ff-aktionen-Attribut der Maske stattdessen `popup`
// (Klarname — Editor-ids reisen nie mit). stepFields akzeptiert beide
// Darstellungen; wer welche braucht, prüft selbst (Laufzeit: popup).
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
  | Omit<QuelleSpeichernStep, 'id'>
  | RuntimePopupStep

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
  if (raw.type === 'QUELLE_SPEICHERN') {
    if (typeof raw.dataSourceId !== 'string' || typeof raw.relationId !== 'string') return null
    const pindex = bindingFields(raw.pindex)
    if (!pindex) return null
    return {
      type: 'QUELLE_SPEICHERN',
      resultKey: raw.resultKey,
      dataSourceId: raw.dataSourceId,
      relationId: raw.relationId,
      pindex,
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

function withoutEditorId(
  step: ActionStep,
  popupName: (id: string) => string,
  // step_result-Bindungen: Schritt-id (Editor) → Ketten-Position (Maske).
  // Editor-ids reisen nie mit; unbekannte id → '-1' (die Preflight blockt
  // das vorher, die Laufzeit löst -1 defensiv zu '' auf).
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
    // Editor-ids reisen nie mit: der Schritt trägt in der Maske den
    // KLARNAMEN des Popups (die Preflight erzwingt eindeutige Namen).
    return {
      type: step.type,
      resultKey: step.resultKey,
      popup: popupName(step.popupId),
    }
  }
  if (step.type === 'QUELLE_SPEICHERN') {
    // dataSourceId/relationId sind stabile VORLAGEN-ids (keine Editor-ids):
    // sie reisen unverändert — FF_DATA_SOURCES/FF_RELATIONS lösen sie auf.
    return {
      type: step.type,
      resultKey: step.resultKey,
      dataSourceId: step.dataSourceId,
      relationId: step.relationId,
      pindex: binding(step.pindex),
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
  // Übersetzt die popupId eines Popup-Schritts in den Klarnamen der Seite
  // (Export-Aufrufer reicht den Baum-Blick herein). Ohne Auflösung → ''.
  popupName: (id: string) => string = () => '',
): string | null {
  if (!events) return null
  const out: Record<string, RuntimeStep[]> = {}
  for (const key of eventOrder) {
    const steps = events[key]
    if (!steps?.length) continue
    // Position je Schritt-id DIESER Kette (0-basiert) — die Laufzeit führt
    // eine Ergebnis-Liste in exakt derselben Reihenfolge (runEvent).
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
  // Vorhandene Popup-Seiten (ids) — nur wer sie kennt (Zentrale, Preflight),
  // bekommt die Meldung über eine gelöschte Seite.
  popupIds?: readonly string[],
  // Gültige „Ergebnis von Schritt"-Ziele für DIESEN Schritt (ids der GET-
  // Schritte davor, ergebnisSchritteVor) — nur wer die Kette kennt, prüft.
  ergebnisIds?: readonly string[],
): string | null {
  // step_result muss auf einen GET-Schritt DAVOR zeigen — ein gelöschter,
  // späterer oder Nicht-GET-Schritt liefe in der Maske still auf ''.
  const ergebnisKaputt = (binding: ActionParamBinding | undefined): boolean =>
    binding?.source === 'step_result'
    && ergebnisIds !== undefined
    && !ergebnisIds.includes(binding.value)
  if (step.type === 'POPUP_OPEN' || step.type === 'POPUP_CLOSE') {
    const name = stepTypeName(step.type)
    if (step.popupId.trim() === '') return `Schritt "${name}" hat kein Popup gewählt.`
    if (popupIds && !popupIds.includes(step.popupId)) {
      return `Schritt "${name}" verweist auf eine gelöschte Popup-Seite.`
    }
    return null
  }
  if (step.type === 'START_TOOL') {
    if (step.toolNr.trim() === '') {
      // Codex-Wortlaut 2026-07-15 (Erklärtexte raus): „Nummer", nicht „Werkzeug-Nummer".
      return `Schritt "${stepTypeName(step.type)}" hat keine Nummer.`
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
  if (step.type === 'QUELLE_SPEICHERN') {
    const name = stepTypeName(step.type)
    if (step.dataSourceId.trim() === '') return `Schritt "${name}" hat keine Quelle gewählt.`
    if (dataSources && !dataSources.some((source) => source.id === step.dataSourceId)) {
      return `Schritt "${name}" verweist auf eine geloeschte Datenquelle.`
    }
    if (step.relationId === '') return `Schritt "${name}" hat keine Schreib-Vorlage.`
    if (relations) {
      const relation = relations.find((entry) => entry.id === step.relationId)
      if (!relation) return `Schritt "${name}" verweist auf eine geloeschte Vorlage.`
      // Fachliche Grenze wie der Bibliotheks-Filter: gespeichert wird über
      // Schreib-Verben — eine GET-Vorlage kann nichts schreiben.
      if (relation.verb === 'GET_RELATION') {
        return `Schritt "${name}" braucht eine Schreib-Vorlage (PUT/PUTADD).`
      }
    }
    // Ein leerer fester PINDEX wäre ein stiller Fehlgriff — anders als bei
    // Syntaxparametern (dort sind Leerwerte legitime Positionen).
    if (bindingProblem(step.pindex)
      || (step.pindex.source === 'fixed' && step.pindex.value.trim() === '')) {
      return `Schritt "${name}": PINDEX ist unvollstaendig.`
    }
    if (step.pindex.source === 'data_field'
      && dataSources
      && !dataSources.some((source) => source.id === step.pindex.dataSourceId)) {
      return `Schritt "${name}" verweist auf eine geloeschte Datenquelle.`
    }
    if (ergebnisKaputt(step.pindex)) {
      return `Schritt "${name}": PINDEX zeigt auf keinen GET-Schritt davor.`
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
  if (allBindings.some(ergebnisKaputt)) {
    return 'Schritt "Relation": ein Parameter zeigt auf keinen GET-Schritt davor.'
  }
  return null
}
