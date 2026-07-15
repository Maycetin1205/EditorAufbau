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
  formatNowDate,
  RELATION_VERBS,
  resolveParams,
  splitFieldCode,
  type RelationTemplate,
  type RelationVerb,
} from '../core/data/relations'
import { seGlobal } from './bridge'
import { isRecord } from './data'

// Relation-Vorlage in der EXPORTIERTEN Maske (Kap. 5.5): die Vorlagen sind
// benutzerdefiniert und leben im Editor-localStorage — exportMask bettet die
// benutzten Vorlagen als `var FF_RELATIONS = […]` ein (Muster
// FF_DATA_SOURCES). Der Anzeigename reist nicht mit (Laufzeit braucht nur
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

// PUT über eine aufgelöste Vorlage. Bridge-Wächter: außerhalb von SoftEngine
// (Vorschau, Tests ohne Stub) wird nichts gesendet. PUT ist fire-and-forget
// (Spec 5.3b (c)). {DROP_PINDEX} erhält denselben Wert wie {PINDEX} — die
// Bedeutung bestimmt der Aufrufer (beim Kanban-Drop ist die gezogene Karte
// der betroffene Satz); {SELKEY} (Auswahl) füllt erst Kap. 8.
export function sendPut(
  template: RuntimeRelation,
  relId: string,
  fieldCode: string,
  pindex: string,
  value: string,
): void {
  const g = seGlobal()
  if (typeof g.basisHTML_SND_MSG !== 'function') return
  const field = splitFieldCode(fieldCode)
  if (!field) return
  g.basisHTML_SND_MSG(template.verb, {
    NR: template.nr,
    PARAMS: resolveParams(template, {
      FELD_POS: field.pos,
      FELD_LEN: field.len,
      PINDEX: pindex,
      DROP_PINDEX: pindex,
      RELID: relId,
      VALUE: value,
      NOW_DATE: formatNowDate(new Date()),
    }),
  })
}
