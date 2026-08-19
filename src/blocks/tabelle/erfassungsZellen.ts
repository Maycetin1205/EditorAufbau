import { zerlegeBindung } from '../../core/blocks/BlockDefinition'
import {
  vollstaendigePaare,
  type BausteinQuelle,
  type SchluesselPaar,
} from '../../core/data/sourceLinks'
import { getField } from '../../softengine/data'
import { ART_TEXT } from './spaltenArten'
import type { Spalte } from './spalten'

// Was eine Zelle der Erfassungszeile tut, wird ABGELEITET — eingestellt wird
// daran nichts (Nutzer-Entscheidung 2026-08-18, geschärft 2026-08-19: die
// Spalte IST das Feld der werdenden Zeile). Zwei Angaben, die es beide schon
// gibt, sagen alles: die Spalte ist am Kopf an ein Feld gebunden, und wo zwei
// Quellen zusammengehören, steht das in der Verknüpfung des Bausteins
// („Woran erkennt man die zusammengehörige Zeile?").
//
//   nichts gebunden                     → frei tippen
//   eigenes Feld ohne Schlüsselpaar     → frei tippen (die Menge — die
//                                         Datenzeile zeigt dasselbe Feld)
//   eigenes Feld in einem Schlüsselpaar → Auswahl aus der gekoppelten Quelle:
//                                         die Artikelnummer der Position
//                                         wählt im Artikelstamm
//   Feld einer verknüpften Quelle       → Auswahl aus ihr, nur passende Sätze
//
// Dass die Ableitung reicht, zeigt die DATENzeile: sie liest ein verknüpftes
// Feld längst von allein (seRuntime → macheFeldLeser in shared/fremdeQuellen).
export type Zellenart = 'frei' | 'eigen' | 'auswahl'

export interface Zellenziel {
  art: Zellenart

  // Die Quelle, in der die Zelle WÄHLT. Nur bei „auswahl" gefüllt.
  quelleId: string

  // Bei „auswahl" der Feldcode IN dieser Quelle; bei „eigen" das eigene Feld
  // der werdenden Zeile; leer bei „frei".
  code: string
}

// Was die Zeile über ihre Umgebung wissen muss. Als Bündel, weil damit
// derselbe Lauf ohne Browser prüfbar ist: die Verknüpfungen kommen im Produkt
// vom Baustein-Attribut, im Test aus einer Zeile Testdaten.
export interface ErfassungsUmfeld {
  spalten: readonly Spalte[]

  // Die EINE Quelle der Tabelle.
  quelleId: string

  // Die Verknüpfungen des Bausteins (weitereQuellen): je Partner-Quelle die
  // Schlüsselpaare. Leer = keine Verknüpfung eingestellt.
  verknuepfungen: readonly BausteinQuelle[]
}

export function paareZu(umfeld: ErfassungsUmfeld, quelleId: string): readonly SchluesselPaar[] {
  return umfeld.verknuepfungen.find((v) => v.quelleId === quelleId)?.keyPairs ?? []
}

export function zellenzielVon(
  spalte: Spalte | undefined,
  tabellenQuelleId: string,
  verknuepfungen: readonly BausteinQuelle[],
): Zellenziel {
  const feld = (spalte?.feld ?? '').trim()
  if (feld === '') return { art: 'frei', quelleId: '', code: '' }
  const { quelleId, code } = zerlegeBindung(feld)
  if (quelleId !== '' && quelleId !== tabellenQuelleId) {
    return { art: 'auswahl', quelleId, code }
  }
  // Ein eigenes Feld, das in einem Schlüsselpaar steht, wählt in der
  // gekoppelten Quelle: sein Wert IST deren Partner-Feld. Koppeln mehrere
  // Verknüpfungen dasselbe Feld, zählt die zuerst eingestellte.
  for (const v of verknuepfungen) {
    if (v.quelleId === '' || v.quelleId === tabellenQuelleId) continue
    for (const paar of vollstaendigePaare(v)) {
      if (paar.fromField === code) {
        return { art: 'auswahl', quelleId: v.quelleId, code: paar.toField }
      }
    }
  }
  return { art: 'eigen', quelleId: '', code }
}

export function zielIn(umfeld: ErfassungsUmfeld, index: number): Zellenziel {
  return zellenzielVon(umfeld.spalten[index], umfeld.quelleId, umfeld.verknuepfungen)
}

// Alle Quellen, in denen diese Zeile wählt, jede einmal.
export function auswahlQuellenIn(umfeld: ErfassungsUmfeld): string[] {
  const raus: string[] = []
  for (let i = 0; i < umfeld.spalten.length; i++) {
    const ziel = zielIn(umfeld, i)
    if (ziel.art !== 'auswahl' || ziel.quelleId === '') continue
    if (!raus.includes(ziel.quelleId)) raus.push(ziel.quelleId)
  }
  return raus
}

// Was die Vorschlagsliste als Anzeige zeigt und mitdurchsucht: die erste
// ANDERE Spalte, die in DERSELBEN Quelle wählt. Damit findet „bay" den
// Baytril, ohne dass jemand ein zweites Feld einstellt — in einer
// Belegerfassung ist das die Bezeichnung. Ohne solche Spalte bleibt es beim
// Wert selbst.
export function anzeigeSpalteIn(
  umfeld: ErfassungsUmfeld,
  index: number,
): { titel: string; code: string } | undefined {
  const ziel = zielIn(umfeld, index)
  if (ziel.art !== 'auswahl' || ziel.code === '') return undefined
  for (let i = 0; i < umfeld.spalten.length; i++) {
    if (i === index) continue
    const anderes = zielIn(umfeld, i)
    if (anderes.art !== 'auswahl' || anderes.quelleId !== ziel.quelleId) continue
    if (anderes.code === '' || anderes.code === ziel.code) continue
    return { titel: umfeld.spalten[i].titel, code: anderes.code }
  }
  return undefined
}

// Die Spalten des großen Fensters: Anzeige und Wert — genau das, was die
// Vorschlagsliste daneben zeigt. Ohne eigene Anzeige-Spalte bleibt es bei der
// Automatik des Fensters (eine Spalte).
export function fensterSpaltenIn(umfeld: ErfassungsUmfeld, index: number): Spalte[] {
  const spalte = umfeld.spalten[index]
  const anzeige = anzeigeSpalteIn(umfeld, index)
  if (spalte === undefined || anzeige === undefined) return []
  return [
    { titel: anzeige.titel, feld: anzeige.code, art: ART_TEXT },
    { titel: spalte.titel, feld: zielIn(umfeld, index).code, art: ART_TEXT },
  ]
}

// Eingeschränkt wird nach demselben Muster wie die Auswahl-Folge
// (zeilenNachAuswahl in blocks/shared/auswahl.ts): alle Schlüsselpaare müssen
// stimmen (UND). Den Wert eines Schlüssels liefert der Aufrufer — abgeleitet
// aus den schon gewählten Sätzen der werdenden Zeile (G3c).
// `undefined` heißt UNBEKANNT: ein unbekannter Schlüssel schränkt nicht ein,
// der Bediener darf die Spalten in beliebiger Reihenfolge füllen. Ein leerer
// String dagegen ist BEKANNT-LEER und trifft nichts — kein Partner heißt
// leere Zelle, nie eine verschwundene Zeile (feste Zusage in CLAUDE.md).
export function passendeSaetze(
  paare: readonly SchluesselPaar[],
  schluesselWert: (feld: string) => string | undefined,
  kandidaten: readonly unknown[],
): unknown[] {
  const bekannte = paare
    .map((p) => ({ toField: p.toField, soll: schluesselWert(p.fromField) }))
    .filter((b): b is { toField: string; soll: string } => b.soll !== undefined)
  if (bekannte.length === 0) return [...kandidaten]
  return kandidaten.filter((satz) => bekannte.every(
    (b) => b.soll !== '' && b.soll === getField(satz, b.toField),
  ))
}
