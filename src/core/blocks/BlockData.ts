// BlockNode
// Serialisierbarer Block-Baum im Editor-Store.
// Kein DOM, keine Lit-Instanzen — pures JSON-fähiges Objekt.
//
// Modell 2 (Container/Flow): Die Lage eines Blocks ergibt sich aus
// VERSCHACHTELUNG + REIHENFOLGE (parentId + geordnete childIds), NICHT aus
// absoluten Koordinaten. Das spiegelt das HTML, das SoftEngine konsumiert
// (Container + Flow), und ist die Grundlage für den Export (Baum -> HTML).
//
// Speicherung als flache Map (craft.js-Stil): gut für Auswahl per id,
// Reparent und Reorder. Die Wurzel ist ein impliziter Container.

export interface BlockNode {
  id: string
  type: string
  props: Record<string, unknown>
  parentId: string | null // null nur für die Wurzel
  childIds: string[] // geordnete Kinder = Flow-Reihenfolge
}

export type BlockTree = Record<string, BlockNode>

export const ROOT_ID = 'root'
export const ROOT_TYPE = 'root'
