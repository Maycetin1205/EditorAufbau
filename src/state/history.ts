import type { BlockTree } from '../core/blocks/BlockData'

export interface EditorSnapshot {
  tree: BlockTree
  selectedId: string | null
}

const HISTORY_LIMIT = 50

export class Historie {
  private _past: EditorSnapshot[] = []
  private _future: EditorSnapshot[] = []

  private _txDepth = 0

  // Der Stand von VOR der laufenden Klammer: vorgemerkt, aber noch nicht
  // abgelegt. Er wandert erst in die Historie, wenn in der Klammer wirklich
  // etwas geschrieben wird.
  private _vorgemerkt: (() => EditorSnapshot) | null = null

  get canUndo(): boolean { return this._past.length > 0 }
  get canRedo(): boolean { return this._future.length > 0 }

  private ablegen(stand: EditorSnapshot): void {
    this._past.push(stand)
    if (this._past.length > HISTORY_LIMIT) this._past.shift()
    this._future = []
  }

  record(makeSnapshot: () => EditorSnapshot): void {
    if (this._txDepth > 0) {
      // Die erste echte Schreibung in der Klammer. Alle Schreiber melden sich
      // VOR dem Schreiben, also ist der vorgemerkte Stand noch unberuehrt und
      // damit genau der Stand vor der Geste.
      const vorgemerkt = this._vorgemerkt
      if (vorgemerkt) {
        this._vorgemerkt = null
        this.ablegen(vorgemerkt())
      }
      return
    }
    this.ablegen(makeSnapshot())
  }

  // Oeffnet eine Klammer: alles darin wird EIN Rueckgaengig-Schritt.
  //
  // Der Stand wird nur VORGEMERKT. Vorher legte begin() ihn unbedingt ab —
  // Anfassen ohne Aendern (in ein Zahlenfeld klicken und wieder heraus, einen
  // Anfasser antippen) erzeugte damit einen leeren Rueckgaengig-Schritt, und
  // ein paar davon schoben echte Schritte aus der Historie heraus.
  begin(makeSnapshot: () => EditorSnapshot): void {
    if (this._txDepth === 0) this._vorgemerkt = makeSnapshot
    this._txDepth++
  }

  end(): void {
    if (this._txDepth > 0) this._txDepth--
    if (this._txDepth === 0) this._vorgemerkt = null
  }

  transaktion<T>(makeSnapshot: () => EditorSnapshot, tun: () => T): T {
    this.begin(makeSnapshot)
    try {
      return tun()
    } finally {
      this.end()
    }
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

  leeren(): void {
    this._past = []
    this._future = []
    this._txDepth = 0
    this._vorgemerkt = null
  }
}

export interface GestenKlammer {
  oeffne(): void
  schliesse(): void
}

export function gestenKlammer(oeffnen: () => void, schliessen: () => void): GestenKlammer {
  let offen = false
  let fertig = false
  return {
    oeffne: () => {
      if (fertig || offen) return
      offen = true
      oeffnen()
    },
    schliesse: () => {
      if (fertig) return
      fertig = true
      if (offen) schliessen()
    },
  }
}
