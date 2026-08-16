// sevariablen — die zweite Haelfte des Exports: die Bestellung an SoftEngine.
//
// Wortgleich aus exportMask herausgezogen (2026-08-16, 500-Zeilen-Deckel);
// kein Verhalten geaendert, keine Byte anders. Der Schnitt liegt am
// Gegenstand und war ueberfaellig: exportMask baut das MARKUP, hier entsteht
// die JSON-Datei daneben. Nebenan steht mit `benutzteQuellen` schon die
// Vorarbeit dazu (welche Quellen, welche Felder) — die beiden gehoeren
// zusammen.
//
// Export-Grundsatz (a) bleibt unberuehrt: HTML und SEvariablen entstehen aus
// DEMSELBEN Baum. Diese Datei bekommt genau das Ergebnis dieses einen
// Durchlaufs gereicht und rechnet nichts zweites nach.

import {
  felderFor,
  kopfsatzFor,
  ladeRelationFor,
  loopReihenfolge,
  tableIdFor,
  varAusKopfsaetzen,
  type DataSource,
} from '../core/data/dataSources'
import { escapeNonAsciiJs } from './serializer'

// SEvariablen: aus DEMSELBEN Baum erzeugt wie das HTML (Grundsatz a).
// SEFILELOOP-Einträge nach Vorbild der echten behandlung-umbau-Masken:
// INDEX_NR 0, ALIAS = Anzeigename, ID je Quellen-ART (Stammtabellen feste ID,
// IDB die eingegebene). WAS eine Quelle bestellt, entscheidet felderFor —
// die eine Stelle, die die FELDER-Form je Art kennt (seit S5.1 speist sie
// die benutzten Felder ein, statt bei IDB immer '*' zu schreiben).
// Nicht-ASCII wird \uXXXX-escaped (gültiges JSON, ASCII-Regel wie beim HTML).
//
// KOPFSATZ_INDEX steht nur, wo die Quelle einen hat (kopfsatzFor): er sagt
// SoftEngine, an welchem Satz die Zeilen hängen (Belegpositionen am offenen
// Beleg, 'BEL_0_11').
//
// Die REIHENFOLGE der Einträge ist ein SE-Kontrakt (loopReihenfolge, belegt
// im A/B-Echttest 2026-08-11): ein Kopfsatz-Loop an erster Stelle lässt die
// ganze Liste scheitern, also stehen solche Quellen zuletzt. Sie formt NUR
// die SEvariablen; FF_DATA_SOURCES bleibt in Baum-Reihenfolge, weil die
// Laufzeit dort ausschließlich per id nachschlägt — das HTML bleibt dadurch
// Byte für Byte, wie es war.
// Eine HOLENDE Quelle (Welle R) bestellt bei SoftEngine nichts: kein
// SEFILELOOP-Eintrag, kein Kopfsatz, kein VAR — ihre Zeilen holt die Maske
// zur Laufzeit selbst (die Hol-Relation reist in FF_DATA_SOURCES).
// Der Schiebe-Weg ist für diesen Fall standalone nachweislich tot, und ein
// liegengebliebener POS-Loop ließe die GANZE Liste scheitern
// (Reihenfolge-Kontrakt oben).
export function baueSevariablen(
  used: readonly DataSource[],
  // Welche FELDER die Maske aus jeder Quelle liest (benutzteFelderJeQuelle).
  benutzteFelder: ReadonlyMap<string, ReadonlySet<string>>,
  // Was eine GEBER-Quelle zusaetzlich liefern muss, damit die Hol-Relation
  // einer holenden Quelle ihren Schluessel voll bekommt (holSchluesselJeGeber).
  holSchluessel: ReadonlyMap<string, string[]>,
): string {
  const geordnet = loopReihenfolge(used.filter((s) => ladeRelationFor(s) === null))
  const sefileloop = geordnet.map((s) => {
    const kopfsatz = kopfsatzFor(s)
    return {
      INDEX_NR: 0,
      ALIAS: s.name,
      ID: tableIdFor(s),
      ...(kopfsatz !== '' ? { KOPFSATZ_INDEX: kopfsatz } : {}),
      FELDER: felderFor(s, benutzteFelder.get(s.id), holSchluessel.get(s.id) ?? []),
    }
  })
  // VAR steht VOR der SEFILELOOP — wie in den ausgelieferten Rahmen; die
  // Kopfsätze der SEFILELOOP zeigen dorthin. Ohne Kopfsätze fehlt der
  // Schlüssel ganz (Masken ohne Belegpositionen bleiben Byte für Byte, wie
  // sie waren).
  // Aus DERSELBEN geordneten Liste wie die SEFILELOOP: eine Datei, eine
  // Reihenfolge. Für die VAR-Bytes ändert das nichts (nur Kopfsatz-Träger
  // liefern hier etwas, und die stehen untereinander unverändert) — es hält nur
  // die Aussage wahr, dass die SEvariablen in dieser einen Reihenfolge entstehen.
  const varAbschnitt = varAusKopfsaetzen(geordnet)
  return escapeNonAsciiJs(
    JSON.stringify({
      ...(varAbschnitt.length > 0 ? { VAR: varAbschnitt } : {}),
      SEFILELOOP: sefileloop,
      ERPAPICALL: [],
    }, null, 2),
  ) + '\n'
}
