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

  // An WELCHER Quelle diese Verknuepfung haengt. Leer = die eigene Quelle des
  // Bausteins; das war bis 2026-08-20 die einzige Moeglichkeit und bleibt die
  // Vorgabe. Gesetzt = die Id einer ANDEREN Verknuepfung desselben Bausteins —
  // dann sind die `fromField` Felder JENER Quelle, nicht der eigenen.
  //
  // Anlass (Nutzer-Fall 2026-08-20): die Tierart haengt am ARTIKELSTAMM, nicht
  // an den Belegpositionen — der gemeinsame Schluessel steht nur im Stamm. Mit
  // nur einer Stufe liess sich das gar nicht ausdruecken, die Quelle fiel
  // durch `quelleBrauchbar` und tauchte nirgends auf. Damit ist die Zusage
  // „nur EINE Stufe" vom 2026-07-25 aufgehoben.
  vonQuelleId?: string

  keyPairs: SchluesselPaar[]
}

export const WEITERE_QUELLEN_PROP = 'weitereQuellen'

export const QUELLEN_DEFAULTS: Record<string, BausteinQuelle[]> = {
  [WEITERE_QUELLEN_PROP]: [],
}

// Eine Verknuepfung zaehlt, sobald eine Quelle gewaehlt ist. Feldpaare sind
// NICHT noetig: eine Quelle, in der man nur SUCHT (Hilfstabelle ohne
// zusammengehoerige Zeile), hat keinen gemeinsamen Schluessel und soll
// trotzdem in Reichweite sein (Nutzer-Befund 2026-08-20: „wenn Datenquelle 2
// keine Verknuepfung braucht, muss ich auch nichts eingeben"). Ohne Paare
// bleibt die Partner-Suche einfach ergebnislos — die Anzeige ist dann leer,
// die Zeile verschwindet nie (feste Zusage in CLAUDE.md).
export function quelleBrauchbar(q: BausteinQuelle): boolean {
  return q.quelleId !== ''
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
    // Leer wird NICHT geschrieben: eine Maske ohne zweite Stufe sieht aus wie
    // vorher (Export-Referenzabzug bleibt gruen).
    const von = typeof e.vonQuelleId === 'string' ? e.vonQuelleId.trim() : ''
    acc.push({
      quelleId: e.quelleId,
      ...(von !== '' && von !== e.quelleId ? { vonQuelleId: von } : {}),
      keyPairs: keyPairs.slice(0, MAX_SCHLUESSELPAARE),
    })
  }
  return acc
}

// An welcher Quelle eine Verknuepfung haengt — die eigene Quelle des
// Bausteins, wenn nichts gesetzt ist. EINE Stelle, weil Editor, Erfassung,
// Export und Laufzeit dieselbe Antwort brauchen.
export function elternQuelleVon(q: BausteinQuelle, eigeneQuelleId: string): string {
  const von = q.vonQuelleId ?? ''
  return von === '' ? eigeneQuelleId : von
}

export interface QuelleInReichweite {
  source: DataSource

  paare?: SchluesselPaar[]

  // Die Quelle, an der sie haengt (leer bei der eigenen Quelle selbst). Die
  // `fromField` ihrer Paare sind Felder DIESER Quelle.
  vonQuelleId?: string
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

  const nimm = (q: BausteinQuelle, von: string): void => {
    const source = bibliothek.find((s) => s.id === q.quelleId)
    if (!source || gesehen.has(source.id)) return
    gesehen.add(source.id)
    acc.push({
      source,
      paare: vollstaendigePaare(q),
      ...(von !== '' ? { vonQuelleId: von } : {}),
    })
  }

  // Reihum, bis sich nichts mehr bewegt: eine Verknuepfung kommt in
  // Reichweite, sobald die Quelle, an der sie haengt, in Reichweite ist. Das
  // traegt beliebig viele Stufen (Belegpositionen → Artikelstamm → Tierart).
  let offen = weitereQuellenAus(weitereRoh).filter(
    (q) => !gesehen.has(q.quelleId) && quelleBrauchbar(q),
  )
  let bewegt = true
  while (bewegt && offen.length > 0) {
    bewegt = false
    const rest: BausteinQuelle[] = []
    for (const q of offen) {
      const von = q.vonQuelleId ?? ''
      if (von !== '' && !gesehen.has(von)) {
        rest.push(q)
        continue
      }
      bewegt = true
      nimm(q, von)
    }
    offen = rest
  }

  // Was uebrig bleibt, haengt an einer Quelle, die nie ankommt — geloescht,
  // umbenannt, oder im Ring. Es faellt NICHT weg: es haengt dann an der
  // eigenen Quelle des Bausteins, wie eine Verknuepfung ohne Angabe.
  // Lautlos verschwinden waere das Schlimmste, was der Editor tun kann
  // (Nutzer-Befund 2026-08-20: nach einer Fehleingabe bei „Haengt an" stand
  // im Feld-Waehler nur noch die eigene Quelle, ohne jeden Hinweis).
  for (const q of offen) nimm(q, '')

  return acc
}

// `eltern` ist die Quelle, an der die Verknuepfung haengt — dort stehen die
// `fromField`. Nicht zwangslaeufig die eigene Quelle des Bausteins (s.
// vonQuelleId).
export function paarKlartext(
  paare: readonly SchluesselPaar[],
  eltern: DataSource | undefined,
): string {
  return paare
    .map((p) => eltern?.fields.find((f) => f.code === p.fromField)?.label ?? '')
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
  // Gesucht wird in der Quelle, die am Spaltenkopf steht — OHNE Bedingung.
  // Bis 2026-08-20 musste dieselbe Quelle zusaetzlich als Verknuepfung am
  // Baustein haengen, sonst blieb `sucht` leer und die Spalte zeigte gar
  // keine Liste: der Nutzer sah eine eingestellte Hilfstabelle und trotzdem
  // keine Artikel. Eine Hilfstabelle ist aber nur eine Nachschlage-Liste,
  // keine Verknuepfung — die beantwortet eine andere Frage (welches Feld des
  // gewaehlten Satzes in die Zelle faellt) und bleibt darum unten optional.
  const gewuenscht = suchtIn.trim()
  const sucht = gewuenscht === tabellenQuelleId ? '' : gewuenscht
  const verknuepfung = sucht === ''
    ? undefined
    : verknuepfungen.find((v) => v.quelleId === sucht && quelleBrauchbar(v))

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
  // Nur bei einer Verknuepfung an der EIGENEN Quelle — haengt sie an einer
  // anderen (Tierart am Artikelstamm), sind ihre `fromField` Felder JENER
  // Quelle und sagen ueber die werdende Zeile nichts aus.
  if (verknuepfung && elternQuelleVon(verknuepfung, tabellenQuelleId) === tabellenQuelleId) {
    for (const paar of vollstaendigePaare(verknuepfung)) {
      if (paar.fromField === code) {
        return { art: 'auswahl', quelleId: sucht, code: paar.toField, suchQuelleId: sucht }
      }
    }
  }
  return { art: 'eigen', quelleId: '', code, suchQuelleId: sucht }
}
