import { zerlegeBindung } from '../blocks/BlockDefinition'
import type { DataSource } from './dataSources'

export interface SchluesselPaar {
  fromField: string
  toField: string
}

export const MAX_SCHLUESSELPAARE = 3

export function vollstaendigePaare(traeger: { keyPairs: readonly SchluesselPaar[] }): SchluesselPaar[] {
  return traeger.keyPairs.filter((p) => p.fromField.trim() !== '' && p.toField.trim() !== '')
}

export interface BausteinQuelle {
  quelleId: string

  keyPairs: SchluesselPaar[]
}

export const WEITERE_QUELLEN_PROP = 'weitereQuellen'

export const QUELLEN_DEFAULTS: Record<string, BausteinQuelle[]> = {
  [WEITERE_QUELLEN_PROP]: [],
}

export function quelleBrauchbar(q: BausteinQuelle): boolean {
  return q.quelleId !== '' && vollstaendigePaare(q).length > 0
}

export function weitereQuellenAus(roh: unknown): BausteinQuelle[] {
  if (!Array.isArray(roh)) return []
  const acc: BausteinQuelle[] = []
  for (const entry of roh) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    if (typeof e.quelleId !== 'string') continue
    const keyPairs: SchluesselPaar[] = []
    for (const p of Array.isArray(e.keyPairs) ? e.keyPairs : []) {
      if (!p || typeof p !== 'object') continue
      const pp = p as Record<string, unknown>
      if (typeof pp.fromField !== 'string' || typeof pp.toField !== 'string') continue
      keyPairs.push({ fromField: pp.fromField, toField: pp.toField })
    }
    acc.push({ quelleId: e.quelleId, keyPairs: keyPairs.slice(0, MAX_SCHLUESSELPAARE) })
  }
  return acc
}

export interface QuelleInReichweite {
  source: DataSource

  paare?: SchluesselPaar[]
}

export function quellenAufloesen(
  sourceId: unknown,
  weitereRoh: unknown,
  bibliothek: readonly DataSource[],
): QuelleInReichweite[] {
  const erste = typeof sourceId === 'string' && sourceId !== ''
    ? bibliothek.find((s) => s.id === sourceId)
    : undefined
  if (!erste) return []
  const acc: QuelleInReichweite[] = [{ source: erste }]
  const gesehen = new Set<string>([erste.id])
  for (const q of weitereQuellenAus(weitereRoh)) {
    if (gesehen.has(q.quelleId) || !quelleBrauchbar(q)) continue
    const source = bibliothek.find((s) => s.id === q.quelleId)
    if (!source) continue
    gesehen.add(source.id)
    acc.push({ source, paare: vollstaendigePaare(q) })
  }
  return acc
}

export function paarKlartext(
  paare: readonly SchluesselPaar[],
  erste: DataSource | undefined,
): string {
  return paare
    .map((p) => erste?.fields.find((f) => f.code === p.fromField)?.label ?? '')
    .filter((n) => n !== '')
    .join(' + ')
}

// Was eine Erfassungszelle tut, aus zwei Angaben am Spalten-Eintrag: der
// Feld-Bindung (WOHER der Wert kommt) und der Sucht-in-Wahl (WO die Zelle beim
// Erfassen sucht). Die Sucht-in-Wahl trifft der Nutzer am Spaltenkopf selbst —
// bis 2026-08-19 wurde sie aus den Schluesselpaaren ABGELEITET, was niemand
// vorhersagen konnte (Nutzer-Befund: „nichts wird abgeleitet oder verordnet").
//
// Liegt hier und nicht beim Tabellen-Baustein, damit generischer Editor-Code
// sie ohne Baustein-Import benutzen darf (Regel 2); die Erfassungszeile
// benutzt sie ueber blocks/tabelle/erfassungsZellen.
export type ErfassungsZielArt = 'frei' | 'eigen' | 'auswahl'

export interface ErfassungsZiel {
  // Woher der WERT der Zelle kommt:
  //   frei    — nichts gebunden, nur Getipptes
  //   eigen   — ein Feld der eigenen Quelle, getippt
  //   auswahl — aus dem gewaehlten Satz von `quelleId`, Feld `code`
  art: ErfassungsZielArt

  quelleId: string

  code: string

  // Wo die Zelle beim Erfassen SUCHT — leer heisst: keine Liste, frei tippen.
  // Getrennt von `quelleId`, weil beides auseinanderfallen kann: eine
  // Anzeige-Spalte (Bezeichnung aus dem Stamm) LIEST aus dem gewaehlten Satz,
  // ohne selbst zu suchen.
  suchQuelleId: string
}

export function erfassungsZielVon(
  feldBindung: string,
  suchtIn: string,
  tabellenQuelleId: string,
  verknuepfungen: readonly BausteinQuelle[],
): ErfassungsZiel {
  const feld = feldBindung.trim()
  // Gesucht wird nur in einer Quelle, die wirklich verknuepft ist: eine
  // geloeschte Verknuepfung darf keine Geisterliste hinterlassen.
  const gewuenscht = suchtIn.trim()
  const verknuepfung = gewuenscht === '' || gewuenscht === tabellenQuelleId
    ? undefined
    : verknuepfungen.find((v) => v.quelleId === gewuenscht && quelleBrauchbar(v))
  const sucht = verknuepfung?.quelleId ?? ''

  if (feld === '') return { art: 'frei', quelleId: '', code: '', suchQuelleId: sucht }
  const { quelleId, code } = zerlegeBindung(feld)

  // Ein Feld einer verknuepften Quelle liest immer aus deren gewaehltem Satz —
  // das ist die Bedeutung der Bindung, keine Einstellung.
  if (quelleId !== '' && quelleId !== tabellenQuelleId) {
    return { art: 'auswahl', quelleId, code, suchQuelleId: sucht }
  }

  // Ein eigenes Feld bekommt seinen Wert aus der Such-Quelle, wenn ein
  // Schluesselpaar sagt, welches Feld dort dasselbe bedeutet: der gewaehlte
  // Artikel LIEFERT die Artikelnummer der werdenden Position.
  if (verknuepfung) {
    for (const paar of vollstaendigePaare(verknuepfung)) {
      if (paar.fromField === code) {
        return { art: 'auswahl', quelleId: sucht, code: paar.toField, suchQuelleId: sucht }
      }
    }
  }
  return { art: 'eigen', quelleId: '', code, suchQuelleId: sucht }
}
