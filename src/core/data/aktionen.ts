// aktionen (Z2)
// Aktionsketten am Baustein je Ereignis — der Kern von Kap. 8, vorgezogen
// als Z-Programm. Ketten sind DATEN im Baum (BlockNode.events), kein Code:
// Schluessel = Ereignis-Key aus der Registry (blockEvents, Vokabular des
// alten Editors: onClick/onCardClick/onCardDrop), Wert = geordnete
// Schrittkette. Schritt-Typen sind eine Registry (STEP_TYPES) — Z2 liefert
// nur „Werkzeug starten" (START_TOOL), Z3 ergaenzt Relation ausfuehren /
// Wert setzen / Daten neu laden.
//
// VERBINDLICHE QUELLE des START_TOOL-Kontrakts: behandlung-umbau,
// empfang/index.basis.source.html Z. 861-882 (seStartTool): primaer
// sendBWLinkIntern('0,START_TOOL,<nr>[,<params URL-kodiert>]'), Fallback
// basisHTML_SND_MSG('START_TOOL', { NR: nr, PARAMS: params }). Werkzeug-
// Nummern sind je Installation individuell (3003 ist in der Empfang-Maske
// das Refresh-Werkzeug!) und werden NIE festverdrahtet — der Bediener gibt
// sie ein (dieselbe Regel wie Relations-NRs, CLAUDE.md 5.3b (d)).
//
// ZWISCHENSPEICHER (Nutzer-Kernanforderung, CLAUDE.md Z-Programm): jeder
// Schritt traegt ab Tag 1 einen optionalen Ergebnis-Namen (resultKey).
// „Werkzeug starten" liefert kein Ergebnis — gefuellt und benutzt wird der
// Zwischenspeicher erst mit „Relation ausfuehren" (Z3, seGetNewIndex-
// Muster); das Modell ist dafuer vorbereitet.
//
// Regel Technikwert ≠ Anzeigename: type/eventKey/Platzhalter sind
// Technikwerte; der Bediener sieht nur Klarnamen (STEP_TYPES.name,
// blockEvents.name aus der Registry).

// ---------- Schritt-Typen (Registry, Muster RELATION_VERBS) ----------

export interface StepTypeSpec {
  // Technikwert — das Vokabular des alten Editors (STEP_TYPES dort).
  key: string
  // Klarname fuer den Bediener.
  name: string
}

export const STEP_TYPES: readonly StepTypeSpec[] = [
  { key: 'START_TOOL', name: 'Werkzeug starten' },
]

export function stepTypeName(typeKey: string): string {
  return STEP_TYPES.find((t) => t.key === typeKey)?.name ?? typeKey
}

// ---------- Schritt + Ereignis-Map ----------

export interface ActionStep {
  // Editor-interner Schluessel (React-Keys, Umsortieren/Duplizieren/
  // Loeschen). Reist NICHT in den Export.
  id: string
  // Technikwert aus STEP_TYPES.
  type: string
  // Zwischenspeicher: Name, unter dem das Schritt-Ergebnis fuer
  // Folgeschritte abgelegt wird ('' = keiner). Ab Tag 1 im Modell.
  resultKey: string
  // START_TOOL: Werkzeug-Nummer der Installation (freie Eingabe).
  toolNr: string
  // START_TOOL: Parameter — feste Werte und {PLATZHALTER}.
  toolParams: string[]
}

// Ereignis-Key -> Schrittkette. Liegt als optionales `events` am BlockNode.
export type BlockEventsMap = Record<string, ActionStep[]>

// Frischer Schritt mit Typ-Defaults (UI „+ Schritt").
export function createStep(typeKey: string): ActionStep | null {
  if (!STEP_TYPES.some((t) => t.key === typeKey)) return null
  return { id: crypto.randomUUID(), type: typeKey, resultKey: '', toolNr: '', toolParams: [] }
}

// ---------- Platzhalter (Teilmenge des Relations-Vokabulars) ----------

// In Werkzeug-Parametern erlaubte Platzhalter — aufgeloest ueber DIESELBE
// Mechanik wie Relations (resolveParams in relations.ts):
//  PINDEX    Satznummer der ausloesenden Karte/Zeile
//  VALUE     ausloesender Wert (z. B. Ziel-Spaltenwert beim Verschieben)
//  NOW_DATE  heutiges Datum (fuellt der Konsument, z. B. seAktionen)
export const AKTIONS_PLATZHALTER = ['PINDEX', 'VALUE', 'NOW_DATE'] as const

// ---------- Strukturelle Pruefung (Muster sanitizeRelationTemplates) ----------

// Typ-geprüfte Schritt-Felder aus rohen Daten — ohne id (die braucht nur
// der Editor). Kaputt -> null.
function stepFields(raw: unknown): Omit<ActionStep, 'id'> | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>
  if (typeof s.type !== 'string' || !STEP_TYPES.some((t) => t.key === s.type)) return null
  if (typeof s.resultKey !== 'string') return null
  if (typeof s.toolNr !== 'string') return null
  if (!Array.isArray(s.toolParams) || s.toolParams.some((p) => typeof p !== 'string')) return null
  return {
    type: s.type,
    resultKey: s.resultKey,
    toolNr: s.toolNr,
    toolParams: [...(s.toolParams as string[])],
  }
}

// Baut aus rohen (evtl. kaputten) Daten eine saubere Ereignis-Map fuer den
// Editor-Baum (sanitizeTree). Streng: nur Ereignis-Keys, die der Block-Typ
// in der Registry deklariert (allowedEvents); EIN kaputter oder id-loser
// Schritt verwirft die GANZE Kette des Ereignisses — eine Luecke wuerde
// die Reihenfolge-Semantik verschieben und falsch ausfuehren (dieselbe
// Begruendung wie die Stelligkeit bei sanitizeRelationTemplates).
// Nichts Brauchbares -> undefined (Feld entfaellt).
export function sanitizeBlockEvents(
  raw: unknown,
  allowedEvents: readonly string[],
): BlockEventsMap | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const src = raw as Record<string, unknown>
  const out: BlockEventsMap = {}
  for (const key of allowedEvents) {
    const chain = src[key]
    if (!Array.isArray(chain) || chain.length === 0) continue
    const steps: ActionStep[] = []
    const seenIds = new Set<string>()
    let broken = false
    for (const entry of chain) {
      const fields = stepFields(entry)
      const id = fields && typeof (entry as Record<string, unknown>).id === 'string'
        ? ((entry as Record<string, unknown>).id as string)
        : ''
      if (!fields || id === '' || seenIds.has(id)) {
        broken = true
        break
      }
      seenIds.add(id)
      steps.push({ id, ...fields })
    }
    if (!broken && steps.length > 0) out[key] = steps
  }
  return Object.keys(out).length > 0 ? out : undefined
}

// ---------- Export-Transport (Attribut data-ff-aktionen) ----------

// Ketten fuer den Export serialisieren: Ereignis-Keys in Registry-
// Reihenfolge (eventOrder = blockEvents-Keys -> deterministisch), nur
// nicht-leere Ketten, OHNE Editor-ids (die Laufzeit braucht sie nicht).
// Nichts zu transportieren -> null (kein Attribut).
export function serializeBlockEvents(
  events: BlockEventsMap | undefined,
  eventOrder: readonly string[],
): string | null {
  if (!events) return null
  const out: Record<string, Omit<ActionStep, 'id'>[]> = {}
  for (const key of eventOrder) {
    const steps = events[key]
    if (!steps || steps.length === 0) continue
    out[key] = steps.map((s) => ({
      type: s.type,
      resultKey: s.resultKey,
      toolNr: s.toolNr,
      toolParams: [...s.toolParams],
    }))
  }
  return Object.keys(out).length > 0 ? JSON.stringify(out) : null
}

// Schritt in der EXPORTIERTEN Maske (ohne Editor-id).
export type RuntimeStep = Omit<ActionStep, 'id'>

// Gegenstueck zu serializeBlockEvents fuer die Laufzeit: liest das
// data-ff-aktionen-Attribut. Kaputte/fremde Eintraege werden verworfen —
// nie raten (Muster findRuntimeDataSource/findRuntimeRelation).
export function parseBlockEvents(raw: string | null): Record<string, RuntimeStep[]> {
  if (!raw) return {}
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {}
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
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

// ---------- Export-Tauglichkeit (Preflight) ----------

// Verstaendliche Meldung, wenn ein Schritt nicht exportfaehig ist — sonst
// null. Das Typ-Wissen bleibt hier im Modell; die Preflight bleibt generisch.
export function stepProblem(step: Pick<ActionStep, 'type' | 'toolNr'>): string | null {
  if (step.type === 'START_TOOL' && step.toolNr.trim() === '') {
    return 'Schritt "Werkzeug starten" hat keine Werkzeug-Nummer.'
  }
  return null
}
