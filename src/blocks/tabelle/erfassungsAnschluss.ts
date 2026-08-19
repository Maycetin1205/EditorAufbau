import type { ErfassterSatz } from '../../core/blocks/BlockDefinition'
import { zerlegeBindung } from '../../core/blocks/BlockDefinition'
import { verknuepfungenVon } from '../shared/fremdeQuellen'
import { ErfassungsLauf } from './erfassungsLauf'
import type { ErfassungsUmfeld } from './erfassungsZellen'
import type { Spalte } from './spalten'

// Die erfasste Zeile nach QUELLEN sortiert: jede Spalte ist ein Feld einer
// Quelle (ohne Quelle davor: der Tabellen-Quelle), also gehört ihr Zellwert
// genau in dieses Feld. Das ist alles, was eine Kette braucht, um mit
// „Datenquelle → Feld" an die Zeile zu kommen — Spalten-Indizes fallen weg
// (Etappe B, Nutzer 2026-08-19).
// Quelle und Feldcode EINER Spalte: ohne Quelle vor dem Feld ist es die
// Tabellen-Quelle. Leer, wenn die Spalte nichts bindet.
function zielVon(
  umfeld: ErfassungsUmfeld,
  spalte: Spalte,
): { quelleId: string; code: string } | null {
  const feld = spalte.feld.trim()
  if (feld === '') return null
  const { quelleId, code } = zerlegeBindung(feld)
  const ziel = quelleId === '' ? umfeld.quelleId : quelleId
  return ziel === '' || code === '' ? null : { quelleId: ziel, code }
}

function satzVon(umfeld: ErfassungsUmfeld, werte: readonly string[]): ErfassterSatz {
  const raus: Record<string, Record<string, string>> = {}
  umfeld.spalten.forEach((spalte, i) => {
    const ziel = zielVon(umfeld, spalte)
    if (ziel === null) return
    const satz = raus[ziel.quelleId] ?? (raus[ziel.quelleId] = {})
    satz[ziel.code] = werte[i] ?? ''
  })
  return raus
}

// Welche Quellen eine erfasste Zeile hier fuellen kann — aus den Spalten, nicht
// aus dem, was schon erfasst ist. Daran erkennt eine Kette ihren Takt-Geber,
// auch wenn noch keine Zeile steht (s. ErfassungsTraegerElement).
export function erfassbareQuellen(umfeld: ErfassungsUmfeld): string[] {
  const raus: string[] = []
  for (const spalte of umfeld.spalten) {
    const ziel = zielVon(umfeld, spalte)
    if (ziel !== null && !raus.includes(ziel.quelleId)) raus.push(ziel.quelleId)
  }
  return raus
}

// Der Erfassungs-Anteil des Tabellen-Bausteins als EIN Stand: der laufende
// Tipp-Zustand (ErfassungsLauf) und die erfassten, noch nicht geschriebenen
// Zeilen. Als eigene Naht, damit der Baustein unter seinem Zeilen-Deckel
// bleibt — er delegiert nur und entscheidet, wann neu gerendert wird.
export class ErfassungsAnschluss {
  readonly lauf = new ErfassungsLauf()

  // Zwei Sichten auf dieselbe erfasste Zeile: die Werte in Spalten-Reihenfolge
  // zeichnet die Tabelle, die Saetze je Quelle liest die Kette. Beide entstehen
  // im selben Augenblick — spaeter waeren die Spalten vielleicht schon andere.
  private _zeilen: { werte: string[]; satz: ErfassterSatz }[] = []

  get zeilen(): readonly (readonly string[])[] {
    return this._zeilen.map((z) => z.werte)
  }

  // Je erfasster Zeile die Saetze je Quelle — der Laufzeit-Vertrag
  // ErfassungsTraegerElement (core/blocks/BlockDefinition.ts).
  get saetze(): readonly ErfassterSatz[] {
    return this._zeilen.map((z) => z.satz)
  }

  // Die Erfassungszeile leitet alles aus zwei vorhandenen Angaben ab: der
  // Bindung jeder Spalte und der Verknuepfung des Bausteins (Attribut am
  // Element) — sie braucht keine eigene Einstellung.
  umfeld(el: HTMLElement, spalten: readonly Spalte[], quelleId: string): ErfassungsUmfeld {
    return { spalten, quelleId, verknuepfungen: verknuepfungenVon(el) }
  }

  // Enter am Zeilenende: die Zeile bleibt stehen, die Erfassung beginnt leer
  // von vorn (G4). Eine ganz leere Zeile wird nicht erfasst.
  erfasse(umfeld: ErfassungsUmfeld): boolean {
    const werte = umfeld.spalten.map((_, i) => this.lauf.wertVon(umfeld, i))
    if (werte.every((w) => w === '')) return false
    this._zeilen = [...this._zeilen, { werte, satz: satzVon(umfeld, werte) }]
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
