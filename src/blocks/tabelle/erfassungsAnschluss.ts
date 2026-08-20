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

// Der Erfassungs-Anteil des Tabellen-Bausteins als EIN Stand: JE ZEILE ein
// Tipp-Zustand (ErfassungsLauf). Als eigene Naht, damit der Baustein unter
// seinem Zeilen-Deckel bleibt — er delegiert nur und entscheidet, wann neu
// gerendert wird.
//
// Bis 2026-08-20 hielt diese Klasse EINEN Lauf plus eine Liste toter
// Wertezeilen: was erfasst war, liess sich nicht mehr anfassen, und der
// einzige Ausweg (`leeren`) warf ALLE Zeilen weg. Jetzt behaelt jede Zeile
// ihren eigenen Lauf, also auch ihre gewaehlten Saetze — deshalb ist sie
// wieder betippbar, einzeln loeschbar und duplizierbar (S2.6/S2.7). Die
// LETZTE Zeile ist die leere, in der weitergetippt wird.
//
// Es gibt immer mindestens eine Zeile: eine Erfassung ohne Zeile waere eine
// Tabelle, in die man nichts eintippen kann.
export class ErfassungsAnschluss {
  private _laeufe: ErfassungsLauf[] = [new ErfassungsLauf()]

  // Welche Zeile der Bediener gerade bearbeitet. Sie traegt die Marke im
  // Zeilengriff, und die Zeilen-Werkzeuge (duplizieren, loeschen) meinen sie.
  private _aktiv = 0

  get anzahl(): number {
    return this._laeufe.length
  }

  get aktiv(): number {
    return this._aktiv
  }

  // Klemmt auf den gueltigen Bereich: ein Zeilen-Index aus einem alten
  // Rendern (Zeile inzwischen geloescht) darf keinen Absturz geben.
  lauf(zeile: number): ErfassungsLauf {
    const i = Math.min(Math.max(zeile, 0), this._laeufe.length - 1)
    return this._laeufe[i]
  }

  get aktiverLauf(): ErfassungsLauf {
    return this.lauf(this._aktiv)
  }

  waehle(zeile: number): boolean {
    const i = Math.min(Math.max(zeile, 0), this._laeufe.length - 1)
    if (i === this._aktiv) return false
    this._aktiv = i
    return true
  }

  werte(umfeld: ErfassungsUmfeld, zeile: number): string[] {
    const lauf = this.lauf(zeile)
    return umfeld.spalten.map((_, i) => lauf.wertVon(umfeld, i))
  }

  istLeer(umfeld: ErfassungsUmfeld, zeile: number): boolean {
    return this.werte(umfeld, zeile).every((w) => w === '')
  }

  // Je erfasster Zeile die Saetze je Quelle — der Laufzeit-Vertrag
  // ErfassungsTraegerElement (core/blocks/BlockDefinition.ts). Leere Zeilen
  // sind keine Positionen: die letzte Zeile ist fast immer die noch leere.
  //
  // Abgeleitet, nicht beim Erfassen eingefroren: die Zeile bleibt betippbar,
  // also muss ihr Satz IMMER den aktuellen Stand zeigen. Der Preis ist, dass
  // eine spaeter geaenderte Spaltenbindung auch die stehenden Zeilen
  // umdeutet — das ist richtig so, sie sind noch nicht geschrieben.
  saetze(umfeld: ErfassungsUmfeld): ErfassterSatz[] {
    const raus: ErfassterSatz[] = []
    for (let z = 0; z < this._laeufe.length; z++) {
      const werte = this.werte(umfeld, z)
      if (werte.every((w) => w === '')) continue
      raus.push(satzVon(umfeld, werte))
    }
    return raus
  }

  // Eine neue leere Zeile hinter `nach`. Gibt ihren Index zurueck; sie wird
  // die aktive, denn wer eine Zeile einfuegt, will in ihr tippen.
  fuegeEin(nach: number): number {
    const ziel = Math.min(Math.max(nach, -1), this._laeufe.length - 1) + 1
    this._laeufe.splice(ziel, 0, new ErfassungsLauf())
    this._aktiv = ziel
    return ziel
  }

  // Die Kopie traegt die gewaehlten Saetze mit, nicht nur die Zellwerte:
  // sonst waere die duplizierte Zeile eine Handvoll Text ohne Herkunft und
  // ihre Automatik liefe ins Leere.
  doppelt(zeile: number): number {
    const i = Math.min(Math.max(zeile, 0), this._laeufe.length - 1)
    const ziel = i + 1
    this._laeufe.splice(ziel, 0, this._laeufe[i].kopie())
    this._aktiv = ziel
    return ziel
  }

  // Die letzte Zeile wird nicht geloescht, sondern geleert: ohne Zeile gibt
  // es kein Feld mehr, in das der Bediener klicken koennte.
  loesche(zeile: number): boolean {
    const i = Math.min(Math.max(zeile, 0), this._laeufe.length - 1)
    if (this._laeufe.length === 1) {
      this._laeufe = [new ErfassungsLauf()]
      this._aktiv = 0
      return true
    }
    this._laeufe.splice(i, 1)
    this._aktiv = Math.min(i, this._laeufe.length - 1)
    return true
  }

  // Wohin die Weiter-Taste am Zeilenende geht: eine Zeile tiefer. Steht man
  // in der letzten, entsteht eine neue — aber nur, wenn die letzte auch etwas
  // enthaelt (sonst legte Enter-Halten leere Zeilen an).
  weiter(umfeld: ErfassungsUmfeld, zeile: number): number {
    const i = Math.min(Math.max(zeile, 0), this._laeufe.length - 1)
    if (i < this._laeufe.length - 1) {
      this._aktiv = i + 1
      return i + 1
    }
    if (this.istLeer(umfeld, i)) return i
    return this.fuegeEin(i)
  }

  // Nach dem Ketten-Lauf: die geschriebenen Zeilen sind weg, eine leere
  // bleibt stehen. Der Bediener tippt weiter, ohne irgendwo hinzuklicken.
  leeren(): boolean {
    if (this._laeufe.length === 1 && this._laeufe[0].istUnberuehrt) return false
    this._laeufe = [new ErfassungsLauf()]
    this._aktiv = 0
    return true
  }

  zuruecksetzen(): void {
    this._laeufe = [new ErfassungsLauf()]
    this._aktiv = 0
  }

  // Einmal je Darstellung: die Liste der AKTIVEN Zeile neu rechnen und einen
  // einzigen Treffer gleich nehmen. Nur die aktive Zeile tippt, also braucht
  // keine andere eine Liste. Nach dem Uebernehmen ist die Liste eine andere —
  // darum ein zweites Mal rechnen, sonst zeigte die Zelle noch den Treffer an,
  // den sie gerade verbraucht hat.
  haltVorschlaegeAktuell(umfeld: ErfassungsUmfeld): void {
    const lauf = this.aktiverLauf
    lauf.aktualisiereVorschlaege(umfeld)
    if (lauf.nimmEinzigenTreffer(umfeld)) lauf.aktualisiereVorschlaege(umfeld)
  }

  // Die Erfassungszeile leitet alles aus zwei vorhandenen Angaben ab: der
  // Bindung jeder Spalte und der Verknuepfung des Bausteins (Attribut am
  // Element) — sie braucht keine eigene Einstellung.
  umfeld(el: HTMLElement, spalten: readonly Spalte[], quelleId: string): ErfassungsUmfeld {
    return { spalten, quelleId, verknuepfungen: verknuepfungenVon(el) }
  }
}
