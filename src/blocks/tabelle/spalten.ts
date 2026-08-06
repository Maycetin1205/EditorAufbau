// Spalten-Modell der Tabelle
// Aus TabelleBlock herausgeloest am 2026-07-24, weil die Baustein-Datei ueber
// den 500-Zeilen-Deckel gewachsen war (check:regeln). Der Schnitt ist der
// natuerliche: hier das DATENMODELL einer Spalte (Titel + Feldcode) samt der
// defensiven Wandlung alter Staende — drueben die Darstellung.
//
// Eine Spalte hat einen Titel (Klarname, sichtbar) und ein Feld (Feldcode der
// Datenquelle, Technikwert, unsichtbar — Regel 3). Das Feld sagt, WELCHEN Wert
// die Spalte je Datenzeile zeigt.
//
// Dazu die ART (2026-08-06): WIE die Spalte ihre Werte zeigt — Text, Zahl,
// Datum oder Status. Auch das ein Technikwert; was er bedeutet und wie breit
// die Spalte damit wird, steht in ./spaltenArten, nicht hier.

import { ART_TEXT } from './spaltenArten'

export interface Spalte {
  titel: string
  feld: string
  art: string
}

export const SPALTEN_MIN = 1
export const SPALTEN_MAX = 8

// Titel einer noch unbenannten Spalte. Die Vorlage steht auch im
// Registry-Eintrag `listenBindung` — daran erkennt der Editor, dass der
// Bediener den Titel NICHT selbst getippt hat und ihn beim Feld-Binden
// durch den Klarnamen ersetzen darf. Eine Stelle, zwei Leser.
export const STANDARD_TITEL = 'Spalte {n}'

export function standardTitelFuer(index: number): string {
  return STANDARD_TITEL.replace('{n}', String(index + 1))
}

// Eine frische, noch unbenannte Spalte. EINE Stelle fuer den Neubau, damit
// eine spaeter hinzukommende Eigenschaft nicht an drei Orten nachgetragen
// werden muss (genau daran fehlte 2026-08-06 die Art).
export function neueSpalte(index: number): Spalte {
  return { titel: standardTitelFuer(index), feld: '', art: ART_TEXT }
}

export function standardSpalten(): Spalte[] {
  return [0, 1, 2].map((i) => neueSpalte(i))
}

// Eine unbekannte Struktur defensiv auf eine Spalte abbilden (nie werfen).
// Eine fehlende Art heisst Text — so verhielten sich ALLE Spalten bis
// 2026-08-06, gespeicherte Staende von davor bleiben damit unveraendert.
function alsSpalte(x: unknown, index: number): Spalte {
  if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>
    return {
      titel: typeof o.titel === 'string' ? o.titel : standardTitelFuer(index),
      feld: typeof o.feld === 'string' ? o.feld : '',
      art: typeof o.art === 'string' ? o.art : ART_TEXT,
    }
  }
  // Alte Erstfassung: reine Titel-Strings.
  if (typeof x === 'string') return { ...neueSpalte(index), titel: x }
  return neueSpalte(index)
}

// Robust gegen alte Staende (Titel-Strings, Spalten-ZAHL) und kaputte Werte;
// immer 1..MAX Spalten mit {titel,feld}.
export function coerceSpalten(v: unknown): Spalte[] {
  let arr: Spalte[]
  if (Array.isArray(v)) {
    arr = v.map((x, i) => alsSpalte(x, i))
  } else if ((typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && /^\d+$/.test(v))) {
    const n = Math.max(1, Math.floor(Number(v)))
    arr = [...Array(n).keys()].map((i) => neueSpalte(i))
  } else {
    arr = standardSpalten()
  }
  if (arr.length > SPALTEN_MAX) arr = arr.slice(0, SPALTEN_MAX)
  if (arr.length < SPALTEN_MIN) arr = [neueSpalte(0)]
  return arr
}

// Nur fuer den Attribut-Wandler (haelt fromAttribute knapp + faengt JSON-Fehler).
export function tryCoerceSpalten(v: string): Spalte[] {
  try {
    return coerceSpalten(JSON.parse(v))
  } catch {
    return standardSpalten()
  }
}
