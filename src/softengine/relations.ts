// softengine/relations (U3, aus blocks/kanban/seRuntime.ts, Kap. 5.5)
// Relations-Vorlagen der EXPORTIERTEN Maske auflösen und einen PUT über die
// aufgelöste Vorlage senden. Reine SoftEngine-Mechanik — die Frage, WELCHE
// Vorlage/Quelle ein konkreter Baustein benutzt, beantwortet der Baustein
// (er liest seine Attribute) und ruft dann hier herein.

import {
  formatNowDate,
  RELATION_VERBS,
  resolveParams,
  splitFieldCode,
  type RelationTemplate,
  type RelationVerb,
} from '../core/data/relations'
import { isRecord, seGlobal } from './types'

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

// PUT über die aufgelöste Vorlage. Bridge-Wächter: außerhalb von SoftEngine
// (Vorschau, Tests ohne Stub) wird nichts gesendet — der lokale Zug ist dann
// die Vorschau. PUT ist fire-and-forget (Spec (c)).
export function sendPut(
  path: { template: RuntimeRelation; relId: string },
  fieldCode: string,
  pindex: string,
  value: string,
): void {
  const g = seGlobal()
  if (typeof g.basisHTML_SND_MSG !== 'function') return
  const field = splitFieldCode(fieldCode)
  if (!field) return
  g.basisHTML_SND_MSG(path.template.verb, {
    NR: path.template.nr,
    PARAMS: resolveParams(path.template, {
      FELD_POS: field.pos,
      FELD_LEN: field.len,
      PINDEX: pindex,
      // Beim Kanban-Drop ist die gezogene Karte der betroffene Satz —
      // {DROP_PINDEX} und {PINDEX} sind hier derselbe Wert. {SELKEY}
      // (Auswahl) füllt erst Kap. 8.
      DROP_PINDEX: pindex,
      RELID: path.relId,
      VALUE: value,
      NOW_DATE: formatNowDate(new Date()),
    }),
  })
}
