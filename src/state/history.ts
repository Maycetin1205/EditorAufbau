// history — Verlauf (Undo/Redo) + Gesten-Transaktionen des Editor-Stores.
// Verhaltensgleich herausgezogen aus Editor.ts:
// exakt die frühere pushHistory/beginTransaction/endTransaction/undo/redo-
// Logik, nur als eigenes Fach gekapselt. Snapshots kommen als Fabrik-
// Funktion herein (lazy) — genau wie früher wird bei laufender Geste
// NICHT geklont.

import type { BlockTree } from '../core/blocks/BlockData'

export interface EditorSnapshot {
  tree: BlockTree
  selectedId: string | null
}

const HISTORY_LIMIT = 50

export class Historie {
  private _past: EditorSnapshot[] = []
  private _future: EditorSnapshot[] = []
  // Tiefe einer laufenden Geste (z.B. Ziehen). > 0 = History-Snapshots werden
  // unterdrückt, damit eine durchgehende Geste EIN Undo-Schritt bleibt.
  private _txDepth = 0

  get canUndo(): boolean { return this._past.length > 0 }
  get canRedo(): boolean { return this._future.length > 0 }

  // Innerhalb einer Transaktion (= laufende Geste, z. B. Breite ziehen)
  // KEINE weiteren Snapshots — begin hat schon einen gelegt.
  record(makeSnapshot: () => EditorSnapshot): void {
    if (this._txDepth > 0) return
    this._past.push(makeSnapshot())
    if (this._past.length > HISTORY_LIMIT) this._past.shift()
    this._future = []
  }

  // Klammert eine durchgehende Geste: genau EIN Snapshot am Anfang, alle
  // Änderungen dazwischen ohne weitere Snapshots, end schließt ab.
  begin(makeSnapshot: () => EditorSnapshot): void {
    if (this._txDepth === 0) this.record(makeSnapshot)
    this._txDepth++
  }

  end(): void {
    if (this._txDepth > 0) this._txDepth--
  }

  undo(makeCurrent: () => EditorSnapshot): EditorSnapshot | null {
    const prev = this._past.pop()
    if (!prev) return null
    this._future.push(makeCurrent())
    return prev
  }

  redo(makeCurrent: () => EditorSnapshot): EditorSnapshot | null {
    const next = this._future.pop()
    if (!next) return null
    this._past.push(makeCurrent())
    return next
  }
}
