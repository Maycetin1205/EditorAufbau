// auswahlFolge — „Dieser Baustein folgt der Auswahl eines anderen."
//
// Der Fall des Nutzers (2026-08-05): Tabelle 1 zeigt Kunden, Tabelle 2 zeigt
// Belege. Klickt der Bediener in der laufenden Maske einen Kunden an, soll
// Tabelle 2 nur noch dessen Belege zeigen — erkannt an gemeinsamen Feldern
// (z. B. Adressnummer = Adressnummer). Ohne Auswahl zeigt sie ALLES; ein
// zweiter Klick auf dieselbe Zeile hebt die Auswahl wieder auf. Nichts
// passiert automatisch, nichts verschwindet ohne Bedienerhandlung.
//
// Reine DATEN (kein Bildschirm, kein SoftEngine, kein Baustein): wer folgen
// KANN, deklariert die Registry (kannAuswahlFolgen in BlockDefinition, Regel 2)
// — ob er es GERADE darf, wird hergeleitet (Faehigkeit + Quelle, deren Zeilen
// sich einengen liessen -> darfAuswahlFolgen in treeQuery). Wer Auswahl GIBT,
// ebenso (satzWahl + Datenquelle -> istAuswahlGeber). Die Schluesselregel ist
// DIESELBE wie bei den weiteren Datenquellen (SchluesselPaar aus sourceLinks) —
// eine Logik, zwei Nutzer.
//
// EINE Stufe je Beziehung: jede Folge nennt genau EINEN Geber-Baustein.
// Die Prop ist trotzdem eine LISTE — dieselbe Bauart wie weitereQuellen:
// eine leere Liste reist nicht als Export-Attribut (exportMask laesst leere
// Listen weg), bestehende Masken bleiben dadurch Byte fuer Byte identisch.
// Die Oberflaeche fuehrt genau einen Eintrag.

import {
  MAX_SCHLUESSELPAARE,
  vollstaendigePaare,
  type SchluesselPaar,
} from './sourceLinks'

export interface AuswahlFolge {
  // Baum-id des Geber-Bausteins (Technikwert, unsichtbar — der Bediener
  // sieht den Klarnamen). Im Export adressiert data-ff-id denselben Wert.
  geberId: string
  // Schluesselregel: fromField = Feld in der ERSTEN Quelle des GEBERS,
  // toField = Feld in der eigenen ersten Quelle. 1..MAX Paare, UND-verknuepft.
  keyPairs: SchluesselPaar[]
}

// Prop-Name am Baustein (Technikwert). EINE Quelle fuer Registry, Inspector,
// Export und Laufzeit — das Laufzeit-Attribut ist derselbe Name kleingeschrieben.
export const AUSWAHL_FOLGE_PROP = 'folgtAuswahl'

// Wird jedem Baustein mit `kannAuswahlFolgen` generisch untergemischt
// (BasicBlock.defineAndRegister) — dasselbe Muster wie QUELLEN_DEFAULTS.
export const AUSWAHL_FOLGE_DEFAULTS: Record<string, AuswahlFolge[]> = {
  [AUSWAHL_FOLGE_PROP]: [],
}

// Brauchbar = Geber genannt UND mindestens ein vollstaendiges Feldpaar.
// Halbfertiges darf existieren (der Bediener tippt gerade) — die Laufzeit
// ignoriert es. Angezeigt wird es nirgends: der Preflight kennt den Fall,
// blockt den Export aber seit 2026-08-10 nicht mehr, und nur seine Meldung
// 'Datenquelle fehlt' erreicht ueberhaupt noch die Steuerung.
export function folgeBrauchbar(f: AuswahlFolge): boolean {
  return f.geberId !== '' && vollstaendigePaare(f).length > 0
}

// Die Liste defensiv aus den Block-Props lesen — nie werfen, Kaputtes
// auslassen (Muster: weitereQuellenAus daneben). Fuer Editor und Preflight;
// die Laufzeit liest strenger aus dem Attribut (shared/auswahl).
export function auswahlFolgenAus(roh: unknown): AuswahlFolge[] {
  if (!Array.isArray(roh)) return []
  const acc: AuswahlFolge[] = []
  for (const entry of roh) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    if (typeof e.geberId !== 'string') continue
    const keyPairs: SchluesselPaar[] = []
    for (const p of Array.isArray(e.keyPairs) ? e.keyPairs : []) {
      if (!p || typeof p !== 'object') continue
      const pp = p as Record<string, unknown>
      if (typeof pp.fromField !== 'string' || typeof pp.toField !== 'string') continue
      keyPairs.push({ fromField: pp.fromField, toField: pp.toField })
    }
    acc.push({ geberId: e.geberId, keyPairs: keyPairs.slice(0, MAX_SCHLUESSELPAARE) })
  }
  return acc
}
