// dataSources
// Datenquellen sind eigenständige, benannte VORLAGEN
// einmal definiert, in jeder Maske wiederverwendbar. Aus ihnen wird
// die SEvariablen-JSON des Exports erzeugt (SEFILELOOP) — nie von Hand.
//
// VERBINDLICHE QUELLE (korrigiert 2026-07-07): die FELD-Map der echten,
// live getesteten Behandlung-Maske — Repo `behandlung-umbau`,
// `behandlung/index.basis.source.html` (Block "SE-ADAPTER", `var FELD`) +
// `behandlung/SE-INVENTAR.md` §6/§11: "Die FELDER-Strings (pos_len) sind
// echte SE-Datenkontrakte". Die früheren Codes/IDB-IDs stammten aus den
// Dashboard-Prototypen dieses Repos und waren teilweise FALSCH
// (Terminplaner ist IDBID0001, nicht 0005; Kundenhaustiere IDBID0004,
// nicht 0009). TODO_-Platzhalter der Vorlagen werden nie übernommen.
//
// Regel Technikwert ≠ Anzeigename: `id`, `idbId`, `code` und `indexField`
// sind Technikwerte und erscheinen NIE sichtbar in der Maske; der Bediener
// sieht ausschließlich `name` und `label`. Erzwungen wird das beim EINGEBEN
// (DataSourceForm: „Klarname darf kein Feldcode sein", Klarname darf nicht
// leer sein) und beim LADEN (sanitizeDataSources wirft Felder ohne label
// weg). Bis 2026-07-30 prüfte dataSources.test.ts zusätzlich den
// mitgelieferten Startbestand — den gibt es nicht mehr, die Prüfung ist mit
// ihm entfallen.

// Quellen-ARTEN (Nutzer-Klarstellung 2026-07-07): nicht nur
// IDB-Tabellen — auch Adressstamm, Artikelstamm, Belege. Die Art bestimmt
// die SEvariablen-Form; sie und ihre Eigenschaften wohnen seit 2026-07-30
// als TABELLE in `quellenArten.ts` (vorher als `kind === 'idb'`-Weichen
// ueber sechs Stellen verstreut). Beleg fuer die Formen: behandlung-umbau
// empfang/index.basis.SEvariablen.json ({ ID: 'ADR', FELDER: '2_8,…' } /
// { ID: 'BEL', FELDER: '1_1,…' } / { ID: 'IDBID0001', FELDER: '*' }; ART
// analog in behandlung/).

import { QUELLEN_TRENNER } from '../blocks/BlockDefinition'
import {
  artFuer,
  DATA_SOURCE_KINDS,
  QUELLEN_ARTEN,
  type DataSourceKind,
} from './quellenArten'

// Weitergereicht, damit die Quellen-Welt EINE Anlaufstelle bleibt: wer mit
// Datenquellen arbeitet, importiert aus dataSources — die Arten-Tabelle
// selbst muss er nicht kennen.
export { artFuer, DATA_SOURCE_KINDS, QUELLEN_ARTEN, type DataSourceKind }

// Eine FELD-ART (Text/Zahl/Datum/Uhrzeit) gab es hier am 2026-07-27 einen
// halben Tag lang: sie sollte „Tag filtern nach" auf Datumsfelder verengen.
// Wieder entfernt am selben Tag (Nutzer-Entscheidung) — der Bediener kennt
// seine Felder und waehlt selbst; die Art zwang ihn nur, jedes Bestandsfeld
// nachzupflegen, bevor die Auswahl ueberhaupt etwas anbot. Bindbare Stellen
// zeigen darum ausnahmslos ALLE Felder der Quelle.
export interface DataSourceField {
  // Technikwert: direkter Property-Name im Datensatz ODER 'pos_len'
  // (Position_Länge im SATZ, z. B. '193_30').
  code: string
  // Klarname für den Bediener (z. B. 'Vorname'). Er ist zugleich die
  // Vorschau des Editors: eine gebundene Stelle zeigt den Klarnamen —
  // erfundene Beispielwerte gibt es NICHT (Nutzer-Entscheidung 2026-07-10,
  // ersetzt das sample-Feld aus).
  label: string
}

export interface DataSource {
  // Stabiler Technikwert — Blöcke referenzieren ihn in ihrer source-Prop.
  id: string
  // Anzeigename der Vorlage; wird im Export zum SEFILELOOP-ALIAS.
  name: string
  // Art der Quelle (bestimmt Tabellen-ID + FELDER-Form, s. o.).
  kind: DataSourceKind
  // SoftEngine-Tabellen-ID, z. B. 'IDBID0001' — NUR bei kind 'idb'
  // (Stammtabellen haben feste IDs, siehe tableIdFor).
  idbId?: string
  // Feldcode der Datensatz-Nummer (pindex) — braucht der Schreibweg:
  // PUT_RELATION adressiert den Satz über diese Nummer. Kein Anzeige-Feld.
  indexField?: string
  // Feld-Wörterbuch der Tabelle, in SATZ-Reihenfolge (deterministisch).
  fields: readonly DataSourceField[]
}

// SoftEngine-Tabellen-ID einer Quelle: die feste ID der Art — und wo die
// Art keine hat (eigene Tabellen), die eingegebene IDB-ID.
export function tableIdFor(source: DataSource): string {
  const feste = artFuer(source.kind).tabellenId
  return feste === '' ? (source.idbId ?? '') : feste
}

// FELDER-Eintrag der SEFILELOOP: explizite pos_len-Liste (Reihenfolge =
// Feld-Wörterbuch), wo die Art einzeln bestellt — sonst '*'.
export function felderFor(source: DataSource): string {
  return artFuer(source.kind).felderEinzeln
    ? source.fields.map((f) => f.code).join(',')
    : '*'
}

// KEIN mitgelieferter Startbestand mehr (Nutzer-Entscheidung 2026-07-30:
// „Raus, leer starten").
//
// Hier standen zwei fertige Quellen — Terminplaner IDBID0001 und
// Kundenhaustiere IDBID0004 mit 21 Feldcodes. Das war die Wahrheit EINER
// Installation, festgeschrieben im Code, und damit genau das, was Regel 5
// verbietet: Feldpositionen und Tabellen-Kennungen sind installations-
// individuelle DATEN. In einer zweiten Installation waren sie schlicht
// falsch — und sahen trotzdem richtig aus.
//
// Ersatz gibt es KEINEN: der Bediener legt seine Quellen selbst an und
// trägt die Felder Zeile für Zeile ein. Eine Abkürzung („Liste einfügen":
// den FELDER-Text einer laufenden Maske hineinkippen) stand am selben Tag
// eine Stunde da und ist auf Nutzer-Ansage restlos entfernt — nicht ohne
// neue Entscheidung wieder einbauen.
//
// Der Store startet darum leer; bestehende Bibliotheken bleiben unberührt
// (localStorage + Maskendatei tragen sie).

// ---------- Pure Helfer für das Eingabe-Formular ----------
// Regel Technikwert ≠ Anzeigename: der Bediener gibt Klarname + Position +
// Länge bzw. die IDB-ID im SoftEngine-Format ('ID0004') ein — die
// Technikwerte ('pos_len', 'IDBIDnnnn') entstehen daraus unsichtbar.
// Ungültige Eingaben ergeben '' (das Formular zeigt dann einen Fehler,
// es wird nie geraten).

// Position + Länge -> Feldcode: ('193', '30') -> '193_30'. Position darf 0
// sein (Datensatz-Nummer '0_10'), Länge muss mindestens 1 sein.
export function fieldCode(pos: string, len: string): string {
  const p = pos.trim()
  const l = len.trim()
  if (!/^\d+$/.test(p) || !/^\d+$/.test(l) || Number(l) < 1) return ''
  return `${p}_${l}`
}

// IDB-ID-Eingabe -> Technikwert: 'ID0004' (auch 'IDBID0004' oder klein
// geschrieben, Ziffern werden auf 4 Stellen aufgefüllt) -> 'IDBID0004'.
export function idbIdFromInput(raw: string): string {
  const m = /^(?:IDB)?ID(\d{1,4})$/i.exec(raw.trim())
  return m ? `IDBID${m[1].padStart(4, '0')}` : ''
}

// Rückweg fürs Bearbeiten/Anzeigen: 'IDBID0004' -> 'ID0004'; sonst ''.
export function idbIdAnzeige(idbId: string | undefined): string {
  const m = /^IDB(ID\d{4})$/.exec(idbId ?? '')
  return m ? m[1] : ''
}

// Baut aus rohen (evtl. kaputten) localStorage-Daten eine saubere
// Vorlagen-Liste (Muster: sanitizeTree in Editor.ts — strukturell prüfen,
// Unbrauchbares verwerfen, nie raten). Inhaltliche Regeln (Klarname kein
// Feldcode usw.) erzwingt das Eingabe-Formular, nicht der Lader — gespeicherte
// Nutzerdaten werden hier nicht umgeschrieben.
export function sanitizeDataSources(raw: unknown): DataSource[] {
  if (!Array.isArray(raw)) return []
  const acc: DataSource[] = []
  const seen = new Set<string>()
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    if (typeof e.id !== 'string' || e.id === '' || seen.has(e.id)) continue
    // Der Trenner der qualifizierten Bindung (QUELLEN_TRENNER, s.
    // BlockDefinition) darf in einer Quellen-id nicht vorkommen — sonst waere
    // 'a::b::128_350' mehrdeutig. Beim Anlegen kann das nicht passieren
    // (crypto.randomUUID), wohl aber in einer von Hand bearbeiteten Datei.
    // Eindeutigkeit wird hier an der Quelle garantiert, statt beim Lesen
    // erraten zu werden.
    if (e.id.includes(QUELLEN_TRENNER)) continue
    if (typeof e.name !== 'string' || e.name.trim() === '') continue
    if (typeof e.kind !== 'string' || !DATA_SOURCE_KINDS.includes(e.kind as DataSourceKind)) continue
    const fields: DataSourceField[] = []
    for (const f of Array.isArray(e.fields) ? e.fields : []) {
      if (!f || typeof f !== 'object') continue
      const ff = f as Record<string, unknown>
      if (typeof ff.code !== 'string' || ff.code === '') continue
      // Gleicher Grund wie bei der id: ein Feldcode mit Trenner machte die
      // qualifizierte Bindung mehrdeutig, und sie faellt dann still auf
      // „nicht gebunden" zurueck. Echte SE-Feldcodes ('193_30') koennen ihn
      // nicht enthalten.
      if (ff.code.includes(QUELLEN_TRENNER)) continue
      if (typeof ff.label !== 'string' || ff.label === '') continue
      // Nur code + label — ein `sample` aus Altbeständen (bis 2026-07-10)
      // oder ein `art` aus dem halben Tag Feld-Art (2026-07-27) wird
      // bewusst verworfen: beides gibt es nicht mehr.
      fields.push({ code: ff.code, label: ff.label })
    }
    seen.add(e.id)
    acc.push({
      id: e.id,
      name: e.name,
      kind: e.kind as DataSourceKind,
      ...(typeof e.idbId === 'string' && e.idbId !== '' ? { idbId: e.idbId } : {}),
      ...(typeof e.indexField === 'string' && e.indexField !== '' ? { indexField: e.indexField } : {}),
      fields,
    })
  }
  return acc
}
