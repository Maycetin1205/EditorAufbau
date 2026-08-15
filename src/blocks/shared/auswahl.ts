// auswahl — der EINE Auswahl-Zustand der laufenden Maske.
//
// „Zeile anklicken → andere Bausteine filtern danach" braucht einen Ort, an
// dem die Auswahl WOHNT: die Karten/Zeilen selbst werden bei jedem
// SoftEngine-Push neu gebaut, an ihnen kann der Zustand nicht haengen.
// Dieses Modul haelt ihn je GEBER-Baustein (Schluessel = data-ff-id aus dem
// Export) und meldet jede Aenderung — die Datenanschluesse hydrieren dann
// alle Bausteine neu, genau wie beim Tageswechsel (Muster: gewaehlterTag).
//
// Toggle-Regel (Nutzer 2026-08-05, „rausklicken"): dieselbe Zeile noch
// einmal waehlen hebt die Auswahl auf. Ohne Auswahl filtert nichts.
//
// Identitaet einer Zeile = ihr JSON-Abdruck: die Zeilenobjekte sind nach
// jedem Push NEUE Objekte mit gleichem Inhalt — Referenzvergleich waere
// nach dem ersten Push immer falsch. Bleibt der Abdruck nach einer
// Neu-Hydrierung aus, ist die Zeile weg (anderer Tag, geloescht) und die
// Auswahl wird AUFGEHOBEN statt unsichtbar weiterzufiltern: sonst saehe der
// Bediener gefilterte Folge-Tabellen ohne markierte Zeile und koennte nie
// wieder rausklicken (Regel 4, nichts scheitert still).
//
// Kennt keinen Baustein (Regel 2): nur Zeilen, Abdruecke und Hoerer — und
// seit 2026-08-06 auch die EINE Regel, wie eine Auswahl auf Zeilen wirkt
// (zeilenNachAuswahl / ersteZeileNachAuswahl, ganz unten).

import { AUSWAHL_FOLGE_PROP, type AuswahlFolge } from '../../core/data/auswahlFolge'
import { getField } from '../../softengine/data'

// JSON-Abdruck als Zeilen-Identitaet. Kaputte/zyklische Objekte liefern ''
// — eine Zeile ohne Abdruck ist nie „dieselbe" und nie waehlbar.
export function merkmalVon(zeile: unknown): string {
  if (zeile == null) return ''
  try {
    return JSON.stringify(zeile) ?? ''
  } catch {
    return ''
  }
}

const zustand = new Map<string, { zeile: unknown; merkmal: string }>()
const hoerer = new Set<() => void>()

// Waehrend einer Meldung kann ein Hydrier-Lauf die Auswahl erneut aendern
// (klareAuswahl, wenn die Zeile verschwunden ist). Statt verschachtelt neu
// zu melden, laeuft die Runde danach noch einmal — idempotent, endet sicher:
// die zweite Runde findet nichts mehr zu bereinigen.
let meldungLaeuft = false
let nachmeldung = false

function melde(): void {
  if (meldungLaeuft) {
    nachmeldung = true
    return
  }
  meldungLaeuft = true
  try {
    do {
      nachmeldung = false
      hoerer.forEach((cb) => cb())
    } while (nachmeldung)
  } finally {
    meldungLaeuft = false
  }
}

export function aufAuswahlHoeren(cb: () => void): void {
  hoerer.add(cb)
}

// Die gewaehlte Zeile eines Gebers — undefined = keine Auswahl.
export function auswahlFuer(geberId: string): unknown | undefined {
  return zustand.get(geberId)?.zeile
}

// Der Abdruck der gewaehlten Zeile ('' = keine Auswahl) — damit ein Geber
// seine Auswahl nach der Neu-Hydrierung in den NEUEN Zeilen wiederfindet.
export function auswahlMerkmal(geberId: string): string {
  return zustand.get(geberId)?.merkmal ?? ''
}

// Die Geber-Kennung eines Bausteins: das data-ff-id, das der Export setzt.
// '' = der Baustein ist kein Auswahl-Geber.
export function geberIdVon(el: Element): string {
  return el.getAttribute('data-ff-id') ?? ''
}

// Eine gemerkte Auswahl nach der Neu-Hydrierung wiederfinden.
//
// Zeilen und Karten sind nach jedem Daten-Push NEUE Objekte — die Auswahl
// muss darum jedes Mal neu zugeordnet werden (Identitaet = JSON-Abdruck).
// Liefert die PLAETZE aller passenden Kandidaten; leer heisst „kein Geber,
// keine Auswahl oder nichts gefunden".
//
// Ist die gewaehlte Zeile verschwunden (anderer Tag, geloescht), wird die
// Auswahl AUFGEHOBEN — sonst filterten Folger nach etwas, das niemand mehr
// sieht, und der Bediener koennte nie wieder rausklicken (Regel 4).
export function auswahlWiederfinden<T>(
  geberId: string,
  kandidaten: readonly T[],
  zeileVon: (kandidat: T) => unknown,
): number[] {
  if (geberId === '') return []
  const merkmal = auswahlMerkmal(geberId)
  if (merkmal === '') return []
  const treffer: number[] = []
  kandidaten.forEach((kandidat, i) => {
    if (merkmalVon(zeileVon(kandidat)) === merkmal) treffer.push(i)
  })
  if (treffer.length === 0) klareAuswahl(geberId)
  return treffer
}

// Zeile waehlen — dieselbe Zeile noch einmal = abwaehlen (Toggle). Das ist die
// ANKLICK-Geste (Tabellenzeile, Kanban-Karte): dort ist der zweite Klick auf
// dasselbe Ding erkennbar ein „doch nicht".
export function waehleAuswahl(geberId: string, zeile: unknown): void {
  if (geberId === '') return
  const merkmal = merkmalVon(zeile)
  if (merkmal === '') return
  const alt = zustand.get(geberId)
  if (alt && alt.merkmal === merkmal) zustand.delete(geberId)
  else zustand.set(geberId, { zeile, merkmal })
  melde()
}

// Zeile SETZEN, ohne Toggle — die UEBERNEHMEN-Geste (Satz im Nachschlage-
// Fenster). Der Bediener hat die Lupe gedrueckt, gesucht und bestaetigt;
// denselben Kunden ein zweites Mal zu bestaetigen heisst „ja, den" und darf
// die Auswahl nicht aufheben. Derselbe Zustand, andere Geste — deshalb zwei
// benannte Wege statt eines Schalters am Aufrufer.
export function setzeAuswahl(geberId: string, zeile: unknown): void {
  if (geberId === '') return
  const merkmal = merkmalVon(zeile)
  if (merkmal === '') return
  if (zustand.get(geberId)?.merkmal === merkmal) return // schon gesetzt, keine Meldung
  zustand.set(geberId, { zeile, merkmal })
  melde()
}

export function klareAuswahl(geberId: string): void {
  if (!zustand.has(geberId)) return
  zustand.delete(geberId)
  melde()
}

// Nur fuer gezielte Laufzeit-Tests: definierter Ausgangszustand.
export function setzeAuswahlZurueck(): void {
  zustand.clear()
}

// ---------------------------------------------------------------------------
// Laufzeit-Leser des Export-Attributs (HTML normalisiert Attribute klein).
// Streng wie weitereAusAttribut in fremdeQuellen: nur Eintraege mit Geber und
// mindestens einem VOLLSTAENDIGEN Feldpaar zaehlen. Halbfertiges reist mit in
// die Maske (der Export blockt seit 2026-08-10 nicht) — diese Strenge hier ist
// also die einzige Stelle, die es noch abfaengt.
const AUSWAHL_FOLGE_ATTR = AUSWAHL_FOLGE_PROP.toLowerCase()

export function folgenAusAttribut(el: HTMLElement): AuswahlFolge[] {
  const roh = el.getAttribute(AUSWAHL_FOLGE_ATTR) ?? ''
  if (roh === '') return []
  try {
    const parsed: unknown = JSON.parse(roh)
    if (!Array.isArray(parsed)) return []
    const acc: AuswahlFolge[] = []
    for (const e of parsed) {
      if (!e || typeof e !== 'object') continue
      const ee = e as Record<string, unknown>
      if (typeof ee.geberId !== 'string' || ee.geberId === '') continue
      const keyPairs: AuswahlFolge['keyPairs'] = []
      for (const p of Array.isArray(ee.keyPairs) ? ee.keyPairs : []) {
        if (!p || typeof p !== 'object') continue
        const pp = p as Record<string, unknown>
        if (typeof pp.fromField !== 'string' || typeof pp.toField !== 'string') continue
        if (pp.fromField.trim() === '' || pp.toField.trim() === '') continue
        keyPairs.push({ fromField: pp.fromField, toField: pp.toField })
      }
      if (keyPairs.length === 0) continue
      acc.push({ geberId: ee.geberId, keyPairs })
    }
    return acc
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Die Auswahl auf ZEILEN anwenden — die EINE Filterregel aller Folger.
//
// Bis 2026-08-06 stand sie in tabelle/seRuntime, weil die Tabelle der einzige
// Folger war. Mit dem zweiten Folger (Einzelwert-Bausteine, s. unten) waere
// eine Abschrift die schlimmste Loesung gewesen: Tabelle und Formularfeld
// beantworteten dieselbe Frage dann getrennt — der Bediener saehe in der
// Tabelle die Zeilen des gewaehlten Kunden und im Feld daneben die eines
// anderen. Eine Regel, alle Folger.
//
// Ohne aktive Auswahl bleibt die Liste unveraendert — nichts passiert
// automatisch (Nutzer 2026-08-05). Mit Auswahl bleiben nur Zeilen, deren
// Schluesselfelder zur gewaehlten Zeile passen (alle Paare, UND). Ein LEERER
// Schluesselwert beim Geber trifft NICHTS — dieselbe Regel wie schluesselAus
// in fremdeQuellen: ein halber Schluessel traefe sonst jede Zeile mit
// derselben Luecke.
//
// „Geber und Folger haengen an derselben Quelle" braucht hier keinen eigenen
// Zweig: dann zeigen fromField und toField eben auf dasselbe Feld, und die
// Regel trifft genau die gewaehlte Zeile wieder (Regel 2, kein Sonderfall).
export function zeilenNachAuswahl(
  el: HTMLElement,
  rows: unknown[],
): { rows: unknown[]; gefiltert: boolean } {
  let raus = rows
  let gefiltert = false
  for (const folge of folgenAusAttribut(el)) {
    const auswahl = auswahlFuer(folge.geberId)
    if (auswahl === undefined) continue
    gefiltert = true
    raus = raus.filter((row) =>
      folge.keyPairs.every((p) => {
        const soll = getField(auswahl, p.fromField)
        return soll !== '' && soll === getField(row, p.toField)
      }),
    )
  }
  return { rows: raus, gefiltert }
}

// Die EINE Zeile, die ein EINZELWERT-Baustein (Formularfeld …) anzeigt.
//
// OHNE Folge: die ERSTE Zeile der Quelle — die feste Zusage „gelesen wird
// automatisch aus der ersten Zeile" gilt unveraendert, bestehende Masken
// aendern sich nicht.
//
// MIT Folge: NUR, was die Auswahl liefert. Nichts gewaehlt (oder wieder
// rausgeklickt) -> nichts. Gewaehlt, aber kein Partner in der eigenen Quelle
// -> ebenfalls nichts. Eine Regel, kein Sonderfall — und nie ein falscher
// Satz auf dem Schirm.
//
// Nutzer-Entscheidung 2026-08-06 (aus dem SE-Echttest): „die erste Zeile" ist
// beim Einzelwert kein neutraler Grundzustand, sondern ein konkreter Datensatz
// — und der Bediener haelt ihn fuer den ausgewaehlten.
//
// Halbfertige Folgen zaehlen nicht (folgenAusAttribut ist streng): waehrend
// der Bediener das Feldpaar noch einstellt, bleibt es beim Grundzustand,
// statt dass das Feld zwischendurch leer blinkt.
export function ersteZeileNachAuswahl(el: HTMLElement, rows: unknown[]): unknown {
  if (folgenAusAttribut(el).length === 0) return rows[0]
  const { rows: passende, gefiltert } = zeilenNachAuswahl(el, rows)
  return gefiltert ? passende[0] : undefined
}
