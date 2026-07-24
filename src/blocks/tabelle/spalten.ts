// Spalten-Modell der Tabelle
// Aus TabelleBlock herausgeloest am 2026-07-24, weil die Baustein-Datei ueber
// den 500-Zeilen-Deckel gewachsen war (check:regeln). Der Schnitt ist der
// natuerliche: hier das DATENMODELL einer Spalte (Titel + Feldcode) samt der
// defensiven Wandlung alter Staende — drueben die Darstellung.
//
// Eine Spalte hat einen Titel (Klarname, sichtbar) und ein Feld (Feldcode der
// Datenquelle, Technikwert, unsichtbar — Regel 3). Das Feld sagt, WELCHEN Wert
// die Spalte je Datenzeile zeigt.

export interface Spalte {
  titel: string
  feld: string
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

export function standardSpalten(): Spalte[] {
  return [0, 1, 2].map((i) => ({ titel: standardTitelFuer(i), feld: '' }))
}

// Eine unbekannte Struktur defensiv auf eine Spalte abbilden (nie werfen).
function alsSpalte(x: unknown, index: number): Spalte {
  if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>
    return {
      titel: typeof o.titel === 'string' ? o.titel : standardTitelFuer(index),
      feld: typeof o.feld === 'string' ? o.feld : '',
    }
  }
  // Alte Erstfassung: reine Titel-Strings.
  if (typeof x === 'string') return { titel: x, feld: '' }
  return { titel: standardTitelFuer(index), feld: '' }
}

// Robust gegen alte Staende (Titel-Strings, Spalten-ZAHL) und kaputte Werte;
// immer 1..MAX Spalten mit {titel,feld}.
export function coerceSpalten(v: unknown): Spalte[] {
  let arr: Spalte[]
  if (Array.isArray(v)) {
    arr = v.map((x, i) => alsSpalte(x, i))
  } else if ((typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && /^\d+$/.test(v))) {
    const n = Math.max(1, Math.floor(Number(v)))
    arr = [...Array(n).keys()].map((i) => ({ titel: standardTitelFuer(i), feld: '' }))
  } else {
    arr = standardSpalten()
  }
  if (arr.length > SPALTEN_MAX) arr = arr.slice(0, SPALTEN_MAX)
  if (arr.length < SPALTEN_MIN) arr = [{ titel: standardTitelFuer(0), feld: '' }]
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
