import {
  elternQuelleVon,
  erfassungsZielVon,
  type BausteinQuelle,
  type ErfassungsZiel,
  type ErfassungsZielArt,
  type SchluesselPaar,
} from '../../core/data/sourceLinks'
import { getField } from '../../softengine/data'
import { ART_TEXT } from './spaltenArten'
import type { Spalte, SuchFeld } from './spalten'

// Was eine Zelle der Erfassungszeile tut, steht in zwei Angaben ihrer Spalte —
// beide am Spaltenkopf gewählt, keine abgeleitet (Nutzer 2026-08-19):
//
//   Feld    → woher der Wert kommt (die Spalte IST ein Feld der werdenden
//             Zeile; ein Feld einer verknüpften Quelle zeigt nur an)
//   Sucht in → wo die Zelle beim Erfassen sucht („frei" = keine Liste)
//
//   nichts gebunden               → frei tippen
//   eigenes Feld, „frei"          → frei tippen (die Menge)
//   eigenes Feld, sucht in X      → Liste aus X; der gewählte Satz liefert den
//                                   Wert über das Schlüsselpaar der
//                                   Verknüpfung (Artikelnummer aus dem Stamm)
//   Feld von X, „frei"            → zeigt, was der in X gewählte Satz liefert
//   Feld von X, sucht in X        → dasselbe, und sucht selbst
//
// Die Ableitung selbst (`erfassungsZielVon`) liegt in core/data/sourceLinks:
// generischer Editor-Code darf keinen Baustein importieren (Regel 2).
export type Zellenart = ErfassungsZielArt

export type Zellenziel = ErfassungsZiel

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

// An welcher Quelle die Verknuepfung dieser Quelle haengt — dort stehen ihre
// `fromField`. Ohne Angabe: die Quelle der Tabelle (der alte, einzige Fall).
export function elternZu(umfeld: ErfassungsUmfeld, quelleId: string): string {
  const v = umfeld.verknuepfungen.find((x) => x.quelleId === quelleId)
  return v === undefined ? umfeld.quelleId : elternQuelleVon(v, umfeld.quelleId)
}

export function zellenzielVon(
  spalte: Spalte | undefined,
  tabellenQuelleId: string,
  verknuepfungen: readonly BausteinQuelle[],
): Zellenziel {
  return erfassungsZielVon(
    spalte?.feld ?? '',
    spalte?.suchtIn ?? '',
    tabellenQuelleId,
    verknuepfungen,
  )
}

export function zielIn(umfeld: ErfassungsUmfeld, index: number): Zellenziel {
  return zellenzielVon(umfeld.spalten[index], umfeld.quelleId, umfeld.verknuepfungen)
}

// Alle Quellen, aus denen diese Zeile einen Satz halten kann, jede einmal:
// die, aus denen eine Zelle ihren Wert LIEST, und die, in denen eine Zelle
// SUCHT. Beides kann auseinanderfallen (eine Anzeige-Spalte liest ohne zu
// suchen, eine Zelle ohne Schlüsselpaar sucht ohne zu lesen), und die
// Schlüssel-Auflösung braucht beide.
export function auswahlQuellenIn(umfeld: ErfassungsUmfeld): string[] {
  const raus: string[] = []
  const merke = (id: string): void => {
    if (id !== '' && !raus.includes(id)) raus.push(id)
  }
  for (let i = 0; i < umfeld.spalten.length; i++) {
    const ziel = zielIn(umfeld, i)
    if (ziel.art === 'auswahl') merke(ziel.quelleId)
    merke(ziel.suchQuelleId)
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
  if (ziel.suchQuelleId === '') return undefined
  // Hat der Nutzer Felder gewaehlt, ist das ERSTE die Anzeige der
  // Vorschlagsliste — seine Wahl schlaegt die Automatik.
  const erstes = gewaehlteSuchFelder(umfeld, index)[0]
  if (erstes !== undefined) return { titel: erstes.titel, code: erstes.feld }
  const eigenerCode = ziel.quelleId === ziel.suchQuelleId ? ziel.code : ''
  for (let i = 0; i < umfeld.spalten.length; i++) {
    if (i === index) continue
    const anderes = zielIn(umfeld, i)
    if (anderes.art !== 'auswahl' || anderes.quelleId !== ziel.suchQuelleId) continue
    if (anderes.code === '' || anderes.code === eigenerCode) continue
    return { titel: umfeld.spalten[i].titel, code: anderes.code }
  }
  return undefined
}

// Die vom Nutzer gewaehlten Felder der Such-Quelle („Zeigt beim Suchen").
// Leer = er hat nichts gewaehlt, dann gilt die Automatik darunter.
function gewaehlteSuchFelder(umfeld: ErfassungsUmfeld, index: number): readonly SuchFeld[] {
  return umfeld.spalten[index]?.suchFelder ?? []
}

// Die Spalten des großen Fensters: Anzeige und Wert — genau das, was die
// Vorschlagsliste daneben zeigt. Hat der Nutzer Felder gewaehlt, sind es
// GENAU die; sonst bleibt es bei der Automatik (Anzeige-Spalte + Wert).
export function fensterSpaltenIn(umfeld: ErfassungsUmfeld, index: number): Spalte[] {
  const spalte = umfeld.spalten[index]
  if (spalte === undefined) return []

  const gewaehlt = gewaehlteSuchFelder(umfeld, index)
  if (gewaehlt.length > 0) {
    return gewaehlt.map((f) => ({ titel: f.titel, feld: f.feld, art: ART_TEXT }))
  }

  const anzeige = anzeigeSpalteIn(umfeld, index)
  const ziel = zielIn(umfeld, index)
  if (anzeige === undefined) return []
  // Ohne eigenen Wert (kein Schlüsselpaar) bleibt es bei der Anzeige-Spalte:
  // eine leere zweite Spalte wäre nur eine Strichspalte.
  const wertCode = ziel.quelleId === ziel.suchQuelleId ? ziel.code : ''
  const anzeigeSpalte = { titel: anzeige.titel, feld: anzeige.code, art: ART_TEXT }
  return wertCode === ''
    ? [anzeigeSpalte]
    : [anzeigeSpalte, { titel: spalte.titel, feld: wertCode, art: ART_TEXT }]
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

// Welches Feld der Such-Quelle in die ZELLE kommt, wenn dort ein Satz gewählt
// wird und die Spalte selbst kein Feld dieser Quelle liest (kein
// Schlüsselpaar). Das ist genau das, was der Nutzer unter „Zeigt beim Suchen"
// ZUERST gewählt hat — hat er dort ein Feld bestimmt, will er dessen Wert in
// der Zelle stehen sehen (Nutzer-Befund 2026-08-20: „ich wähle Datenquelle B
// und das Feld dazu und drücke Enter, aber das wird nicht übernommen").
//
// OHNE eigene Wahl bleibt das Getippte stehen: dann sucht die Zelle nur, um
// den Satz für die ZEILE zu bestimmen, und die Nachbarspalte zeigt ihn. Eine
// Menge, die in den Gaben sucht, darf nicht plötzlich „Injektion" heißen.
export function uebernahmeFeldIn(umfeld: ErfassungsUmfeld, index: number): string {
  const ziel = zielIn(umfeld, index)
  if (ziel.art !== 'eigen' || ziel.suchQuelleId === '') return ''
  return gewaehlteSuchFelder(umfeld, index)[0]?.feld ?? ''
}
