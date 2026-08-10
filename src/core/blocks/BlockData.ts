// BlockNode
// Serialisierbarer Block-Baum im Editor-Store.
// Kein DOM, keine Lit-Instanzen — pures JSON-fähiges Objekt.
//
// Die Lage eines Blocks ergibt sich aus VERSCHACHTELUNG + REIHENFOLGE
// (parentId + geordnete childIds). Das spiegelt das HTML, das SoftEngine
// konsumiert (Container + Flow), und ist die Grundlage für den Export
// (Baum -> HTML).
//
// EINE Ausnahme, und sie ist echt (Stand 2026-08-10): die Kinder der Wurzel
// liegen auf einer Rasterfläche und tragen zusätzlich rasterX/Y/W/H in props
// (s. rasterLayout). Das sind Zellen, keine Pixel — aber es sind Koordinaten.
// Der ursprüngliche Satz „NICHT aus absoluten Koordinaten" galt vor dem
// Raster und beschrieb den Baum seither zur Hälfte falsch. Überall SONST
// (Popup-Inhalt, Zeile, Gruppe, Karte, Kanban) gilt er unverändert.
//
// Speicherung als flache Map (craft.js-Stil): gut für Auswahl per id,
// Reparent und Reorder. Die Wurzel ist ein impliziter Container.

import type { BlockEventsMap } from '../data/aktionen'

export interface BlockNode {
  id: string
  type: string
  props: Record<string, unknown>
  // Aktionsketten am Baustein je Ereignis (Vorgriff): Schlüssel =
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
