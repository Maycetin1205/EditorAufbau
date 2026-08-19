import type { BlockNode } from '../blocks/BlockData'
import type { ActionParamBinding, ActionStep } from './aktionen'

// Eine Kette, die aus einem bestimmten Baustein liest — z. B. der Knopf,
// dessen Schritt „Wert aus Erfassungszelle" die Zeilen einer Tabelle holt.
export interface LesendeKette {
  // Der Baustein, an dem die Kette haengt (der Knopf), NICHT der gelesene.
  blockId: string

  eventKey: string

  // Wie viele Schritte der Kette aus dem gelesenen Baustein schoepfen.
  stellen: number
}

function bindungenVon(step: ActionStep): readonly ActionParamBinding[] {
  return step.type === 'RELATION' ? [...step.params, ...step.extraParams] : []
}

// Wer liest aus diesem Baustein? Generisch ueber blockId am Parameter — die
// Frage stellt sich fuer jede Parameter-Art, die auf einen Baustein zeigt
// (Erfassungszelle, Baustein-Wert, gewaehlte Zeile), nicht nur fuer eine.
export function lesendeKetten(
  baum: Readonly<Record<string, BlockNode>>,
  gelesenerBlockId: string,
): LesendeKette[] {
  if (gelesenerBlockId === '') return []
  const raus: LesendeKette[] = []
  for (const node of Object.values(baum)) {
    for (const [eventKey, kette] of Object.entries(node.events ?? {})) {
      let stellen = 0
      for (const step of kette) {
        if (bindungenVon(step).some((b) => b.blockId === gelesenerBlockId)) stellen += 1
      }
      if (stellen > 0) raus.push({ blockId: node.id, eventKey, stellen })
    }
  }
  return raus
}
