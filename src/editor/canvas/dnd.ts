// dnd
// Gemeinsame Drag-and-Drop-Konstanten für Canvas + Palette.
// Neue Blöcke aus der Bibliothek reisen als DataTransfer-Eintrag mit diesem
// MIME-Typ (Wert = Block-Typ). Vorteil: Palette und Canvas brauchen keinen
// geteilten State — der Browser trägt die Information.
//
// Zusätzlich reist der Block-Typ als eigener MIME-Marker im Typ-NAMEN mit
// (Kap. 4K.4): während `dragover` sperrt der Browser getData(), die
// Typ-LISTE (dataTransfer.types) ist aber lesbar. Nur so kann der Canvas
// schon beim Überfahren prüfen, ob der Ziel-Container den Typ erlaubt
// (canContain), statt erst beim Drop.

export const NEW_BLOCK_MIME = 'application/x-ff-new-block'
const NEW_BLOCK_TYPE_PREFIX = 'application/x-ff-new-block-type--'

export function setNewBlockDragData(dt: DataTransfer, blockType: string): void {
  dt.setData(NEW_BLOCK_MIME, blockType)
  // Block-Typen sind klein geschrieben — der Marker übersteht das
  // Lowercasing der MIME-Typen durch den Browser unverändert.
  dt.setData(NEW_BLOCK_TYPE_PREFIX + blockType, blockType)
}

export function isNewBlockDrag(dt: DataTransfer): boolean {
  return Array.from(dt.types).includes(NEW_BLOCK_MIME)
}

// Block-Typ eines Palette-Drags — auch während dragover lesbar (aus der
// Typ-Liste, nicht aus den gesperrten Daten). null = kein Palette-Drag.
export function newBlockDragType(dt: DataTransfer): string | null {
  for (const t of dt.types) {
    if (t.startsWith(NEW_BLOCK_TYPE_PREFIX)) return t.slice(NEW_BLOCK_TYPE_PREFIX.length)
  }
  return null
}
