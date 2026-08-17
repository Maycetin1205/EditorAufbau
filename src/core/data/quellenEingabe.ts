// quellenEingabe — Eingabe des Bedieners -> Technikwert, und der Rückweg.
//
// Regel Technikwert ≠ Anzeigename: der Bediener gibt Klarname + Position +
// Länge bzw. die IDB-ID im SoftEngine-Format ('ID0004') ein — die
// Technikwerte ('pos_len', 'IDBIDnnnn') entstehen daraus unsichtbar.
// Ungültige Eingaben ergeben '' (das Formular zeigt dann einen Fehler,
// es wird nie geraten).
//
// Eigene Datei statt dataSources (2026-08-12, reine Verschiebung): die stand
// mit 496 Zeilen kurz vor dem 500er-Deckel. dataSources reicht diese Helfer
// weiter (eine Anlaufstelle für die Quellen-Welt) — kein Aufrufer hat sich
// geändert. Importiert wird hier NUR aus quellenArten: dataSources liest diese
// Datei, ein Import zurück wäre ein Kreis; darum nimmt quellenKennung
// strukturell `{ kind, idbId }` statt DataSource (dasselbe Muster wie
// ladeRelation.ts).

import { artFuer, type DataSourceKind } from './quellenArten'

// Position + Länge -> Feldcode: ('193', '30') -> '193_30'. Position darf 0
// sein (Datensatz-Nummer '0_10'), Länge muss mindestens 1 sein.
//
// `vorsatz` (2026-08-17) steht davor, wo die Art einen führt: bei einer
// ERP-Abfrage heißen die Zeilen-Schlüssel 'LFA_2_8' statt '2_8'
// (quellenArten.feldVorsatzMoeglich). Er gehört zur ABFRAGE, nicht zum
// einzelnen Feld — deshalb kommt er von außen und wird hier nur davorgesetzt.
// Ungültige Position/Länge bleiben ungültig, auch mit Vorsatz.
export function fieldCode(pos: string, len: string, vorsatz = ''): string {
  const p = pos.trim()
  const l = len.trim()
  if (!/^\d+$/.test(p) || !/^\d+$/.test(l) || Number(l) < 1) return ''
  return `${feldVorsatzFromInput(vorsatz)}${p}_${l}`
}

// Eingegebener Feld-Vorsatz -> Technikwert. Erlaubt sind Buchstaben, Ziffern
// und Unterstriche ('LFA_'); alles andere ergibt '' — dann baut fieldCode den
// Code ohne Vorsatz, statt einen kaputten zu erzeugen. Ein FEHLENDER Vorsatz
// ist gültig: nur die ERP-Abfrage führt bisher einen.
const VORSATZ_FORM = /^[A-Za-z0-9_]+$/

export function feldVorsatzFromInput(raw: string): string {
  const t = raw.trim()
  return t !== '' && VORSATZ_FORM.test(t) ? t : ''
}

// Eingegebene Kennung -> Technikwert, für jede Art, die keine feste hat.
//
// Zwei Formen, und die zweite fehlte bis 2026-07-30:
//   1. Die IDB-Kurzform, die der Bediener in der SoftEngine-GUI sieht:
//      'ID0004' (auch klein, auch schon mit IDB davor) -> 'IDBID0004',
//      Ziffern auf vier Stellen aufgefüllt.
//   2. Jede andere Kennung WÖRTLICH: 'IDBSE0880', 'POS', 'SERPOS',
//      'JSDDWZE05'. Vorher fielen genau diese durch — die Prüfung kannte nur
//      Form 1 und meldete „IDB-ID fehlt", obwohl es die Tabelle wirklich
//      gibt (belegt in den 129 ausgelieferten SEvariablen-Dateien des
//      Herstellers). Solche Tabellen waren im Editor nicht anlegbar.
//
// Ungültige Eingaben ergeben '' (das Formular zeigt dann einen Fehler); ein
// Feldcode wie '2_8' ist keine Kennung und fällt durch, weil eine Kennung
// mit einem Buchstaben beginnt.
//
// Der PUNKT ist seit 2026-08-17 erlaubt: die Kennung einer ERP-Abfrage heißt
// 'LIEFERADRESSE.GET' (belegt in beiden Chef-Masken). Ohne ihn ließ sich so
// eine Quelle gar nicht erst anlegen — die Prüfung meldete „Kennung fehlt"
// für einen Wert, den SoftEngine nachweislich kennt.
const KENNUNG_IDB_KURZ = /^(?:IDB)?ID(\d{1,4})$/i
const KENNUNG_FREI = /^[A-Za-z][A-Za-z0-9.]*$/

export function kennungFromInput(raw: string): string {
  const t = raw.trim()
  const kurz = KENNUNG_IDB_KURZ.exec(t)
  if (kurz) return `IDBID${kurz[1].padStart(4, '0')}`
  return KENNUNG_FREI.test(t) ? t : ''
}

// Eingegebener Kopfsatz -> Technikwert. Die Form ist die der ausgelieferten
// Belegerfassung: Kürzel, Position, Länge ('BEL_0_11'). Alles andere ergibt ''
// (das Formular zeigt dann einen Fehler) — ein Tippfehler hier wäre sonst eine
// Maske, die klaglos die Positionen ALLER Belege zieht.
const KOPFSATZ_FORM = /^[A-Za-z][A-Za-z0-9]*_\d+_\d+$/

export function kopfsatzFromInput(raw: string): string {
  const t = raw.trim()
  return KOPFSATZ_FORM.test(t) ? t : ''
}

// Rückweg fürs Bearbeiten/Anzeigen: 'IDBID0004' -> 'ID0004' (die Kurzform,
// die der Bediener kennt); alles andere bleibt, wie es ist.
export function kennungAnzeige(kennung: string | undefined): string {
  const m = /^IDB(ID\d{4})$/.exec(kennung ?? '')
  return m ? m[1] : (kennung ?? '')
}

// Die SoftEngine-Kennung einer Quelle in BEDIENER-Form — fuer die dezente
// Technik-Marke neben dem Klarnamen (Nutzer-Wunsch 2026-08-06: „nicht nur
// der Alias, auch die ID0001"): die feste Tabellen-ID der Art (ADR/ART/BEL)
// oder die eingegebene Kennung in Kurzform (ID0001, POS, …). EINE Stelle —
// vorher stand dieselbe Ableitung lokal im DatenquellenBereich.
export function quellenKennung(source: { kind: DataSourceKind; idbId?: string }): string {
  const feste = artFuer(source.kind).tabellenId
  return feste !== '' ? feste : kennungAnzeige(source.idbId)
}
