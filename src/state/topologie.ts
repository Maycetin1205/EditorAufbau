// topologie — halten die Verhaeltnisse im geladenen Baum noch?
//
// Warum es das gibt (A4): `sanitizeTree` baut den Baum von der Wurzel her neu
// auf und stellt dabei viel von selbst sicher — jeder Knoten haengt genau
// einmal, parentId zeigt auf den echten Eltern, Zyklen sind gekappt. Was es
// NICHT prueft, ist der Eltern-Kind-VERTRAG der Registry: eine Karte
// ausserhalb einer Kanban-Spalte, ein Popup in einem Kasten, ein Kind in
// einem Baustein, der gar keine aufnimmt. So etwas entsteht nicht im Editor
// (addBlock/verschiebeInContainer fragen `canContain`), wohl aber in einer von
// Hand bearbeiteten Datei — und danach ist es ein Knoten, den der Editor
// nicht zeichnet, der Export aber mit hinausschreibt. Unsichtbar im Editor,
// sichtbar in SoftEngine: genau die Sorte Fehler, die niemand findet.
//
// Geprueft wird der FERTIGE Baum, nach den Migrationen (Reihenfolge aus A3) —
// eine Migration darf Altbestand geradeziehen, bevor er bewertet wird.
//
// Diese Datei ENTSCHEIDET nichts: sie zaehlt Funde auf. Was daraus folgt,
// steht in ladeKette.pruefeBaumStand.

import { ROOT_ID, ROOT_TYPE, type BlockTree } from '../core/blocks/BlockData'
import { canContain, getBlockDefinition } from '../core/blocks/blockRegistry'
import { BEREICH_AUFBAU, type LadeProblem } from '../core/data/ladeProblem'

function istSeite(tree: BlockTree, id: string): boolean {
  const typ = tree[id]?.type
  return typ !== undefined && getBlockDefinition(typ)?.pageBlock === true
}

export function topologieProbleme(tree: BlockTree): LadeProblem[] {
  const raus: LadeProblem[] = []
  const fund = (stelle: string, grund: string): void => {
    raus.push({ bereich: BEREICH_AUFBAU, stelle, grund })
  }

  // 1. GENAU EINE synthetische Wurzel. Sie ist kein Baustein des Bedieners:
  // Typ und Eigenschaften baut der Editor selbst.
  const wurzel = tree[ROOT_ID]
  if (!wurzel) {
    fund(ROOT_ID, 'dem Masken-Aufbau fehlt seine Wurzel')
    return raus
  }
  if (wurzel.type !== ROOT_TYPE || wurzel.parentId !== null) {
    fund(ROOT_ID, 'die Wurzel des Masken-Aufbaus ist verbogen')
  }
  for (const knoten of Object.values(tree)) {
    if (knoten.id === ROOT_ID) continue
    if (knoten.parentId === null || knoten.type === ROOT_TYPE) {
      fund(knoten.id, 'dieser Baustein tritt als zweite Wurzel auf')
    }
  }

  // 2. Jede Beziehung gilt in BEIDE Richtungen, und der Eltern-Kind-Vertrag
  // der Registry haelt (canContain liest allowedChildTypes UND
  // allowedParentTypes — beide Richtungen an EINER Stelle, Regel 2).
  for (const knoten of Object.values(tree)) {
    if (knoten.id === ROOT_ID) continue
    const eltern = knoten.parentId === null ? undefined : tree[knoten.parentId]
    if (!eltern) {
      fund(knoten.id, 'dieser Baustein haengt an einem Eltern-Baustein, den es nicht gibt')
      continue
    }
    if (!eltern.childIds.includes(knoten.id)) {
      fund(knoten.id, 'der Eltern-Baustein kennt dieses Kind nicht')
    }
    if (!canContain(eltern.type, knoten.type)) {
      fund(knoten.id, `ein Baustein der Art „${knoten.type}" darf nicht in „${eltern.type}" liegen`)
    }
    // 3. Seiten (pageBlock, heute das Popup) liegen AUSSCHLIESSLICH direkt
    // unter der Wurzel — nie in einem Container und nie in einer anderen
    // Seite. Der Editor waehlt die aktive Seite ueber die Kinder der Wurzel;
    // eine tiefer liegende Seite waere nicht erreichbar.
    if (istSeite(tree, knoten.id) && knoten.parentId !== ROOT_ID) {
      fund(knoten.id, istSeite(tree, eltern.id)
        ? 'eine Seite liegt in einer anderen Seite'
        : 'eine Seite liegt nicht direkt unter der Wurzel')
    }
  }

  // 4. Jeder erreichbare Knoten GENAU EINMAL, und alles im Baum ist von der
  // Wurzel aus erreichbar. Ein doppelt eingehaengter Knoten wuerde zweimal
  // gezeichnet und zweimal exportiert; ein unerreichbarer waere ein Knoten,
  // an den der Bediener nicht mehr herankommt.
  const gesehen = new Set<string>()
  const lauf = (id: string): void => {
    if (gesehen.has(id)) {
      fund(id, 'dieser Baustein haengt mehrfach im Aufbau')
      return
    }
    gesehen.add(id)
    const knoten = tree[id]
    if (!knoten) return
    for (const kind of knoten.childIds) {
      if (!tree[kind]) {
        fund(id, 'die Kinderliste nennt einen Baustein, den es nicht gibt')
        continue
      }
      lauf(kind)
    }
  }
  lauf(ROOT_ID)
  for (const id of Object.keys(tree)) {
    if (!gesehen.has(id)) {
      fund(id, 'dieser Baustein ist von der Wurzel aus nicht erreichbar')
    }
  }

  return raus
}
