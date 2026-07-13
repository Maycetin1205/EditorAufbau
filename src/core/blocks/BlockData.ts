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

import type { BlockEventsMap } from '../data/aktionen'

export interface BlockNode {
  id: string
  type: string
  props: Record<string, unknown>
  // Aktionsketten am Baustein je Ereignis (Z2, Vorgriff Kap. 8): Schlüssel =
  // Ereignis-Key aus der Registry (blockEvents), Wert = Schrittkette.
  // undefined = keine Ketten. Bewusst NICHT in props: props speisen
  // Export-Attribute + Lit-Properties — Ketten reisen als eigenes Feld
  // (wie block.events im alten Editor) und im Export als data-ff-aktionen.
  events?: BlockEventsMap
  parentId: string | null // null nur für die Wurzel
  childIds: string[] // geordnete Kinder = Flow-Reihenfolge
}

export type BlockTree = Record<string, BlockNode>

export const ROOT_ID = 'root'
export const ROOT_TYPE = 'root'
