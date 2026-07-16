// migrations (U4)
// Umzüge alter Speicherstände in die heutige Form. Jede Migration kennt
// GENAU EINE alte Gestalt — hier (und nur hier) sind konkrete Typnamen
// erlaubt, weil alte Daten nun einmal alte Namen tragen (Ausnahme zu
// Regel 2, dokumentiert).

import { ROOT_ID, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { createEmptyTree, normalizeProps } from './treeOps'

// Migration alter Stände (P1.1): der Vorlagen-Kasten (kanban-vorlage) ist
// abgeschafft — seine Karten wandern an den ANFANG der ersten Spalte des
// Boards (die erste Karte des Boards ist jetzt die Musterkarte), der Kasten
// selbst verschwindet. Ohne den Umzug würde sanitizeTree den unbekannten
// Typ SAMT der gestalteten Musterkarte verwerfen. Board ohne Spalte
// (degeneriert): die Karten entfallen mit dem Kasten.
export function migrateKanbanVorlage(
  src: Record<string, { type?: unknown; childIds?: unknown }>,
): void {
  for (const [id, node] of Object.entries(src)) {
    if (!node || typeof node !== 'object' || node.type !== 'kanban-vorlage') continue
    const parent = Object.values(src).find(
      (p) => p && typeof p === 'object' && Array.isArray(p.childIds) && p.childIds.includes(id),
    )
    if (!parent || !Array.isArray(parent.childIds)) continue
    const spalte = parent.childIds
      .map((cid) => (typeof cid === 'string' ? src[cid] : undefined))
      .find((n) => n && typeof n === 'object' && n.type === 'kanban-spalte')
    const cards = Array.isArray(node.childIds) ? node.childIds : []
    if (spalte) {
      spalte.childIds = [...cards, ...(Array.isArray(spalte.childIds) ? spalte.childIds : [])]
    }
    parent.childIds = parent.childIds.filter((cid) => cid !== id)
  }
}

// Altes Format (Liste mit absolutem layout) -> Baum: alle Blöcke als Kinder der
// Wurzel, layout wird verworfen.
export function migrateFlatBlocks(blocks: unknown[]): BlockTree {
  const tree = createEmptyTree()
  for (const raw of blocks) {
    if (!raw || typeof raw !== 'object') continue
    const b = raw as { id?: unknown; type?: unknown; props?: unknown }
    if (typeof b.id !== 'string' || typeof b.type !== 'string') continue
    if (!getBlockDefinition(b.type)) continue
    tree[b.id] = {
      id: b.id,
      type: b.type,
      props: normalizeProps(b.type, b.props && typeof b.props === 'object' ? b.props as Record<string, unknown> : {}),
      parentId: ROOT_ID,
      childIds: [],
    }
    tree[ROOT_ID].childIds.push(b.id)
  }
  return tree
}

// Schema 2: Root-Kanbans sind Vollbild-Hauptflächen. Alte Pixelmaße kamen
// aus der früheren frei ziehbaren Canvas und ließen den SoftEngine-Bereich
// überragen. Nur beim EINMALIGEN Wechsel von Schema 1 werden Root-Boards auf
// volle Breite + verbleibende Höhe gesetzt. Danach bleiben bewusst gesetzte
// Pixelhöhen erhalten.
export function migrateRootKanbanToViewportFill(tree: BlockTree): boolean {
  let migrated = false
  for (const id of tree[ROOT_ID]?.childIds ?? []) {
    const node = tree[id]
    if (node?.type !== 'kanban') continue
    if (node.props.width === 'fill' && node.props.height === 'fill') continue
    tree[id] = { ...node, props: { ...node.props, width: 'fill', height: 'fill' } }
    migrated = true
  }
  return migrated
}
