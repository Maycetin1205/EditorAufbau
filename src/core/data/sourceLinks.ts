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

// Was eine Erfassungszelle mit dieser Feld-Bindung tut, ABGELEITET aus zwei
// vorhandenen Angaben: der Bindung selbst und den Verknüpfungen des
// Bausteins (Nutzer-Modell 2026-08-19: die Spalte IST das Feld der werdenden
// Zeile). Liegt hier und nicht beim Tabellen-Baustein, damit Inspector und
// Feld-Wähler dieselbe Ableitung ZEIGEN können, ohne einen Baustein zu
// importieren (Regel 2); die Erfassungszeile benutzt sie über
// blocks/tabelle/erfassungsZellen.
export type ErfassungsZielArt = 'frei' | 'eigen' | 'auswahl'

export interface ErfassungsZiel {
  art: ErfassungsZielArt

  // Die Quelle, in der die Zelle WÄHLT. Nur bei „auswahl" gefüllt.
  quelleId: string

  // Bei „auswahl" der Feldcode IN dieser Quelle; bei „eigen" das eigene Feld
  // der werdenden Zeile; leer bei „frei".
  code: string
}

export function erfassungsZielVon(
  feldBindung: string,
  tabellenQuelleId: string,
  verknuepfungen: readonly BausteinQuelle[],
): ErfassungsZiel {
  const feld = feldBindung.trim()
  if (feld === '') return { art: 'frei', quelleId: '', code: '' }
  const { quelleId, code } = zerlegeBindung(feld)
  if (quelleId !== '' && quelleId !== tabellenQuelleId) {
    return { art: 'auswahl', quelleId, code }
  }
  // Ein eigenes Feld, das in einem Schlüsselpaar steht, wählt in der
  // gekoppelten Quelle: sein Wert IST deren Partner-Feld. Koppeln mehrere
  // Verknüpfungen dasselbe Feld, zählt die zuerst eingestellte.
  for (const v of verknuepfungen) {
    if (v.quelleId === '' || v.quelleId === tabellenQuelleId) continue
    for (const paar of vollstaendigePaare(v)) {
      if (paar.fromField === code) {
        return { art: 'auswahl', quelleId: v.quelleId, code: paar.toField }
      }
    }
  }
  return { art: 'eigen', quelleId: '', code }
}
