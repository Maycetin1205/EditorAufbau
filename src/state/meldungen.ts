// meldungen — DIE eine Meldungsspur des EDITORS.
//
// Bis U2 (2026-08-12) meldete der Editor mit `window.alert`: an sieben
// Stellen (Toolbar 3x, loescheBaustein, persistence, notfallkopie 2x). Ein
// Alert HAELT DIE ARBEIT AN — er verlangt einen Klick, bevor irgendetwas
// weitergeht — und er sieht aus wie das Betriebssystem, nicht wie der Editor.
// Fuer eine Auskunft („die Musterkarte kann nicht geloescht werden") ist das
// zu viel; fuer eine Verlustmeldung ist es zu fluechtig, denn nach dem Klick
// ist der Text weg.
//
// Diese Stelle loest beides: eine Karte legt sich unten rechts ueber den
// Editor, die Arbeit laeuft weiter, und die Karte bleibt liegen, bis der
// Bediener sie schliesst. Nichts blendet sich von selbst aus — die Meldungen
// hier melden Verluste („Beim Laden entfernt: …", „konnte nicht gespeichert
// werden"), und ein Verlust, der nach acht Sekunden verschwindet, ist wieder
// ein stiller Verlust.
//
// BEWUSST NICHT dasselbe wie `softengine/meldung.ts`: das ist der Fehlerbalken
// der fertigen MASKE — eine Zeile, blendet sich aus, baut sich imperativ ins
// DOM und reist im Runtime-Buendel mit. Editor-Bedienung hat dort nichts zu
// suchen (und umgekehrt), auch wenn beide „melde" heissen.
//
// Modul-Singleton, weil die Meldenden zum Teil KEINE Komponenten sind
// (persistence, notfallkopie, loescheBaustein) und weil die erste Meldung noch
// vor dem ersten Bild fallen kann: `new Editor()` laedt den Speicherstand,
// bevor die Shell rendert. Darum haelt diese Stelle eine LISTE und ist kein
// blosser Ereignis-Kanal — was frueh gemeldet wurde, steht beim ersten Rendern
// schon da.

import { Subject } from './Subject'

export interface Meldung {
  // Laufende Nummer, nur zum Wiederfinden beim Schliessen. Kein Technikwert,
  // der irgendwo gespeichert wird.
  id: number
  text: string
}

// Bewusst nur EINE Sorte Karte (kein „Erfolg"/„Warnung"/„Fehler"): alle
// heutigen Meldungen sind Stoerungen oder Verluste, und Erfolgsmeldungen sind
// im Wellen-Kopf U ausdruecklich ausgeschlossen („KEINE Erfolgs-Toasts auf
// Verdacht"). Wer eine zweite Sorte braucht, hat dann einen echten zweiten
// Fall (Regel 10).
class Meldungsstelle extends Subject<Meldungsstelle> {
  private _liste: Meldung[] = []
  private _version = 0
  private naechsteId = 1

  get liste(): readonly Meldung[] { return this._liste }
  get version(): number { return this._version }

  // Gleiches Muster wie Editor/VorlagenStore: die Version ist der Stand, den
  // useSyncExternalStore vergleicht.
  override notify(data: Meldungsstelle): void {
    this._version++
    super.notify(data)
  }

  melde(text: string): void {
    this._liste = [...this._liste, { id: this.naechsteId++, text }]
    this.notify(this)
  }

  schliesse(id: number): void {
    const rest = this._liste.filter((m) => m.id !== id)
    if (rest.length === this._liste.length) return
    this._liste = rest
    this.notify(this)
  }

  // Alles wegraeumen. In der App ruft das niemand — der Bediener schliesst
  // jede Karte selbst. Gebraucht wird es von den Tests, damit jeder Fall bei
  // null anfaengt (das Modul-Singleton ueberlebt den einzelnen Test).
  leere(): void {
    if (this._liste.length === 0) return
    this._liste = []
    this.notify(this)
  }
}

export const meldungen = new Meldungsstelle()
