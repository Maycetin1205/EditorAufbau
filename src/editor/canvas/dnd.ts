// dnd
// Gemeinsame Drag-and-Drop-Konstanten für Canvas + Palette.
// Neue Blöcke aus der Bibliothek reisen als DataTransfer-Eintrag mit diesem
// MIME-Typ (Wert = Block-Typ). Vorteil: Palette und Canvas brauchen keinen
// geteilten State — der Browser trägt die Information.

export const NEW_BLOCK_MIME = 'application/x-ff-new-block'

// Während `dragover` dürfen Daten NICHT gelesen werden (Browser-Schutz),
// die Typenliste schon. Damit die Drag-Vorschau erlaubte Kind-Typen prüfen
// kann (Kap. 4K.4), reist der Block-Typ zusätzlich IM MIME-Namen mit.
// (Browser normalisieren MIME-Namen zu Kleinbuchstaben — Block-Typen sind
// per Konvention bereits klein.)
const TYPED_PREFIX = `${NEW_BLOCK_MIME}--`

export function setNewBlockDrag(dt: DataTransfer, type: string): void {
  dt.setData(NEW_BLOCK_MIME, type)
  dt.setData(`${TYPED_PREFIX}${type}`, type)
}

export function isNewBlockDrag(dt: DataTransfer): boolean {
  return Array.from(dt.types).includes(NEW_BLOCK_MIME)
}

export function newBlockDragType(dt: DataTransfer): string | null {
  for (const t of Array.from(dt.types)) {
    if (t.startsWith(TYPED_PREFIX)) return t.slice(TYPED_PREFIX.length)
  }
  return null
}
