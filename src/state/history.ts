// history (U4)
// Undo/Redo-Historie des Editors: Schnappschüsse vor jeder Änderung,
// begrenzte Tiefe, Gesten-Klammer (Transaktion). Kennt nur Schnappschüsse —
// nicht den Store.

import type { BlockTree } from '../core/blocks/BlockData'

export interface EditorSnapshot {
  tree: BlockTree
  selectedId: string | null
}

export class History {
  private _past: EditorSnapshot[] = []
  private _future: EditorSnapshot[] = []
  // Tiefe einer laufenden Geste (z.B. Ziehen). > 0 = weitere Snapshots werden
  // unterdrückt, damit eine durchgehende Geste EIN Undo-Schritt bleibt.
  private _txDepth = 0

  private readonly limit: number

  constructor(limit: number) {
    this.limit = limit
  }

  get canUndo(): boolean { return this._past.length > 0 }
  get canRedo(): boolean { return this._future.length > 0 }

  // Vor einer Änderung: aktuellen Stand sichern, Redo-Zweig verfällt.
  // Innerhalb einer Transaktion (= laufende Geste, z. B. Breite ziehen)
  // KEINE weiteren Snapshots — beginTransaction hat schon einen gelegt.
  record(current: EditorSnapshot): void {
    if (this._txDepth > 0) return
    this._past.push(current)
    if (this._past.length > this.limit) this._past.shift()
    this._future = []
  }

  // Klammert eine durchgehende Geste: genau EIN Snapshot am Anfang, alle
  // Änderungen dazwischen ohne weitere Snapshots, endTransaction schließt ab.
  beginTransaction(current: () => EditorSnapshot): void {
    if (this._txDepth === 0) this.record(current())
    this._txDepth++
  }

  endTransaction(): void {
    if (this._txDepth > 0) this._txDepth--
  }

  // Liefert den vorigen Stand (oder undefined); `current` wird nur bei
  // Erfolg ausgewertet und wandert auf den Redo-Stapel.
  undo(current: () => EditorSnapshot): EditorSnapshot | undefined {
    const prev = this._past.pop()
    if (!prev) return undefined
    this._future.push(current())
    return prev
  }

  redo(current: () => EditorSnapshot): EditorSnapshot | undefined {
    const next = this._future.pop()
    if (!next) return undefined
    this._past.push(current())
    return next
  }
}
