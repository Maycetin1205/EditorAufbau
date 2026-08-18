import { zerlegeBindung } from '../../core/blocks/BlockDefinition'
import type { SchluesselPaar } from '../../core/data/sourceLinks'
import { getField } from '../../softengine/data'
import { ART_TEXT } from './spaltenArten'
import type { Spalte } from './spalten'

// Was eine Zelle der Erfassungszeile tut, wird ABGELEITET — eingestellt wird
// daran nichts (Nutzer-Entscheidung 2026-08-18). Zwei Angaben, die es beide
// schon gibt, sagen alles: die Spalte ist am Kopf an ein Feld gebunden, und wo
// zwei Quellen zusammengehören, steht das in der Verknüpfung des Bausteins
// („Woran erkennt man die zusammengehörige Zeile?").
//
//   nichts gebunden                → frei tippen (die Menge)
//   Feld der Tabellen-Quelle       → tippen, Vorschläge aus ihr
//   Feld einer verknüpften Quelle  → nur die passenden Sätze
//
// Dass die Ableitung reicht, zeigt die DATENzeile: sie liest ein verknüpftes
// Feld längst von allein (seRuntime → macheFeldLeser in shared/fremdeQuellen).
// Nur die Erfassungszeile wusste davon nichts.
export type Zellenart = 'frei' | 'eigen' | 'verknuepft'

export interface Zellenziel {
  art: Zellenart

  // Die Quelle, aus der die Zelle ihren Wert nimmt. Leer bei „frei" — und
  // solange die Tabelle selbst keine Quelle hat.
  quelleId: string

  // Der reine Feldcode IN dieser Quelle.
  code: string
}

// Was die Zeile über ihre Umgebung wissen muss. Als Bündel, weil damit
// derselbe Lauf ohne Browser prüfbar ist: die Schlüsselpaare kommen im Produkt
// vom Baustein-Attribut, im Test aus einer Zeile Testdaten.
export interface ErfassungsUmfeld {
  spalten: readonly Spalte[]

  // Die EINE Quelle der Tabelle.
  quelleId: string

  // Die Schlüsselpaare zu einer verknüpften Quelle. Leer = keine Verknüpfung
  // eingestellt; dann wird nicht eingeschränkt.
  paareZu: (quelleId: string) => readonly SchluesselPaar[]
}

export function zellenzielVon(
  spalte: Spalte | undefined,
  tabellenQuelleId: string,
): Zellenziel {
  const feld = (spalte?.feld ?? '').trim()
  if (feld === '') return { art: 'frei', quelleId: '', code: '' }
  const { quelleId, code } = zerlegeBindung(feld)
  if (quelleId === '') return { art: 'eigen', quelleId: tabellenQuelleId, code }
  return { art: 'verknuepft', quelleId, code }
}

export function zielIn(umfeld: ErfassungsUmfeld, index: number): Zellenziel {
  return zellenzielVon(umfeld.spalten[index], umfeld.quelleId)
}

// Alle verknüpften Quellen dieser Zeile, jede einmal.
export function verknuepfteQuellenIn(umfeld: ErfassungsUmfeld): string[] {
  const raus: string[] = []
  for (const spalte of umfeld.spalten) {
    const ziel = zellenzielVon(spalte, umfeld.quelleId)
    if (ziel.art !== 'verknuepft' || ziel.quelleId === '') continue
    if (!raus.includes(ziel.quelleId)) raus.push(ziel.quelleId)
  }
  return raus
}

// Was die Vorschlagsliste als Anzeige zeigt und mitdurchsucht: die erste
// ANDERE Spalte DERSELBEN Quelle. Damit findet „bay" den Baytril, ohne dass
// jemand ein zweites Feld einstellt — in einer Belegerfassung ist das die
// Bezeichnung. Ohne solche Spalte bleibt es beim Wert selbst.
export function anzeigeSpalteIn(
  umfeld: ErfassungsUmfeld,
  index: number,
): { titel: string; code: string } | undefined {
  const ziel = zielIn(umfeld, index)
  if (ziel.quelleId === '' || ziel.code === '') return undefined
  for (let i = 0; i < umfeld.spalten.length; i++) {
    if (i === index) continue
    const spalte = umfeld.spalten[i]
    const anderes = zellenzielVon(spalte, umfeld.quelleId)
    if (anderes.quelleId !== ziel.quelleId) continue
    if (anderes.code === '' || anderes.code === ziel.code) continue
    return { titel: spalte.titel, code: anderes.code }
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
// stimmen (UND). Den Wert eines Schlüssels liefert der Aufrufer — am Satz der
// Tabellen-Quelle, oder (G3c) abgeleitet aus den schon gewählten verknüpften
// Sätzen, wenn es den Satz der Tabellen-Quelle beim Erfassen noch nicht gibt.
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
