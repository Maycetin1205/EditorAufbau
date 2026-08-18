import { verknuepfungenVon } from '../shared/fremdeQuellen'
import { ErfassungsLauf } from './erfassungsLauf'
import type { ErfassungsUmfeld } from './erfassungsZellen'
import type { Spalte } from './spalten'

// Der Erfassungs-Anteil des Tabellen-Bausteins als EIN Stand: der laufende
// Tipp-Zustand (ErfassungsLauf) und die erfassten, noch nicht geschriebenen
// Zeilen. Als eigene Naht, damit der Baustein unter seinem Zeilen-Deckel
// bleibt — er delegiert nur und entscheidet, wann neu gerendert wird.
export class ErfassungsAnschluss {
  readonly lauf = new ErfassungsLauf()

  private _zeilen: string[][] = []

  // Werte je Spalte, in Spalten-Reihenfolge — das liest die Kette am Knopf
  // (ErfassungsTraegerElement in core/blocks/BlockDefinition.ts).
  get zeilen(): readonly (readonly string[])[] {
    return this._zeilen
  }

  // Die Erfassungszeile leitet alles aus zwei vorhandenen Angaben ab: der
  // Bindung jeder Spalte und der Verknuepfung des Bausteins (Attribut am
  // Element) — sie braucht keine eigene Einstellung.
  umfeld(el: HTMLElement, spalten: readonly Spalte[], quelleId: string): ErfassungsUmfeld {
    const verknuepfungen = verknuepfungenVon(el)
    return {
      spalten,
      quelleId,
      paareZu: (id) => verknuepfungen.find((v) => v.quelleId === id)?.keyPairs ?? [],
    }
  }

  // Enter am Zeilenende: die Zeile bleibt stehen, die Erfassung beginnt leer
  // von vorn (G4). Eine ganz leere Zeile wird nicht erfasst.
  erfasse(umfeld: ErfassungsUmfeld): boolean {
    const werte = umfeld.spalten.map((_, i) => this.lauf.wertVon(umfeld, i))
    if (werte.every((w) => w === '')) return false
    this._zeilen = [...this._zeilen, werte]
    this.lauf.zuruecksetzen()
    return true
  }

  leeren(): boolean {
    if (this._zeilen.length === 0) return false
    this._zeilen = []
    return true
  }

  zuruecksetzen(): void {
    this._zeilen = []
    this.lauf.zuruecksetzen()
  }
}
