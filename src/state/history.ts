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

  // Mehrere Schreibvorgaenge als EIN Undo-Schritt — mit garantiertem Abschluss.
  //
  // Warum das try/finally hier wohnt und nicht bei jedem Aufrufer (A7.2,
  // 2026-08-11): bleibt `end()` nach einem Fehler aus, steht `_txDepth`
  // dauerhaft ueber null — und dann schweigt `record()` fuer den REST der
  // Sitzung. Ab da entsteht kein einziger Undo-Punkt mehr, ohne dass der
  // Bediener etwas merkt: Strg+Z springt immer weiter auf denselben alten
  // Stand. Die Aufrufer schrieben begin/end bis dahin blank hintereinander
  // (Inspector-Dropdowns, Popup-Seite anlegen); ein Wurf dazwischen war nicht
  // reparierbar, nur durch Neuladen.
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

  // Verlauf verwerfen. Gebraucht beim Laden einer Maskendatei (2026-07-28):
  // ein Snapshot enthaelt NUR Baum und Auswahl — die Bibliotheken
  // (Datenquellen, Relationen) haben gar kein Undo. Bliebe
  // der Verlauf stehen, ergaebe Strg+Z nach dem Laden den ALTEN Baum mit den
  // NEUEN Bibliotheken: Bindungen zeigen ins Leere, und der Bediener glaubt,
  // er sei zurueck. Ein halb wiederhergestellter Stand ist schlimmer als gar
  // keiner — darum ist Laden wie das Oeffnen eines neuen Dokuments.
  leeren(): void {
    this._past = []
    this._future = []
    this._txDepth = 0
  }
}

// Klammer fuer eine Geste ueber MEHRERE Ereignisse — Groesse ziehen, ziehen und
// ablegen, eine Tipp-Sitzung. Die kann `transaktion(fn)` nicht klammern: sie
// beginnt in einem Ereignis und endet in einem anderen, oft in gar keinem
// (Fenster verlassen, Feld verschwindet).
//
// Der Token loest genau die zwei Fragen, die zieheGroesse und eingabeSitzung
// bis 2026-08-11 jeder fuer sich mit eigenen Merkern beantworteten:
//
//   oeffne()   — erst der ERSTE echte Schritt oeffnet. Wer einen Anfasser nur
//                antippt oder ins Feld klickt und wieder rausgeht, erzeugt
//                keinen Leer-Schritt im Verlauf (und verliert damit auch nicht
//                sein Redo, denn `begin` leert den Redo-Stapel).
//   schliesse()— GENAU EINMAL, egal wie viele Wege ihn rufen (pointerup UND
//                pointercancel UND blur UND Unmount kommen vor). Danach oeffnet
//                ein Nachzuegler-Ereignis KEINE neue Klammer mehr — die liefe
//                sonst bis zum Sitzungsende offen.
//
// Was nie geoeffnet wurde, schliesst auch nichts: ein `end()` auf Verdacht
// beendete sonst die Klammer eines FREMDEN Vorgangs.
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
