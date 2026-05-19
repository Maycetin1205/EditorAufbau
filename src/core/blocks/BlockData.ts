// BlockData
// Serialisierbarer Block-State im Editor-Store.
// Kein DOM, keine Lit-Instanzen — pures JSON-faehiges Objekt.
// localStorage-Persistenz, Undo/Redo, Import/Export arbeiten ausschliesslich darauf.

export interface BlockLayout {
  x: number
  y: number
  width: number
  height: number
}

export interface BlockData {
  id: string
  type: string
  layout: BlockLayout
  props: Record<string, unknown>
}
