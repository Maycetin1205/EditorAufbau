// blockFactory
// Erzeugt eine serialisierbare BlockData-Instanz aus Typ-Name + Defaults aus Registry.
// Editor.addBlock(type) ruft das auf, schiebt das Ergebnis in den State.

import type { BlockData } from './BlockData'
import { getBlockDefinition } from './blockRegistry'

const FALLBACK_LAYOUT = { width: 120, height: 40 }

export function createBlockData(type: string, id?: string): BlockData {
  const def = getBlockDefinition(type)
  if (!def) {
    throw new Error(`Unbekannter Block-Typ: "${type}". Vorher mit registerBlockType registrieren.`)
  }
  return {
    id: id ?? crypto.randomUUID(),
    type,
    layout: {
      x: 0,
      y: 0,
      width: def.defaultLayout?.width ?? FALLBACK_LAYOUT.width,
      height: def.defaultLayout?.height ?? FALLBACK_LAYOUT.height,
    },
    props: { ...def.defaultProps },
  }
}
