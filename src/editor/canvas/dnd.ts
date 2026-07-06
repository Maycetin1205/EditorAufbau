// dnd
// Gemeinsame Drag-and-Drop-Konstanten für Canvas + Palette.
// Neue Blöcke aus der Bibliothek reisen als DataTransfer-Eintrag mit diesem
// MIME-Typ (Wert = Block-Typ). Vorteil: Palette und Canvas brauchen keinen
// geteilten State — der Browser trägt die Information.

export const NEW_BLOCK_MIME = 'application/x-ff-new-block'

export function isNewBlockDrag(dt: DataTransfer): boolean {
  return Array.from(dt.types).includes(NEW_BLOCK_MIME)
}
