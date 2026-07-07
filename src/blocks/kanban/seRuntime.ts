// seRuntime (Kap. 5.3)
// Datenverhalten des Kanban-Boards in der EXPORTIERTEN SoftEngine-Maske:
// jede Zeile der Datenquelle wird eine Karte (Aussehen = die ERSTE gestaltete
// Karte des Boards als Vorlage, gebundene Stellen aus Kap. 5.2 zeigen die
// Zeilenwerte), und der Wert des Spalten-Felds (statusField am Board)
// bestimmt die Spalte: exakter Vergleich (getrimmt, Gross/klein egal) mit dem
// Datenwert der Spalte (statusValue); kein Treffer -> erste Spalte (Auffang,
// wie die Referenzmaske dashboard/praxis-kanban.html).
//
// Laeuft NUR im Export: der BlockHost markiert Editor-Elemente mit
// data-ff-editor, solche Boards melden sich hier nie an. Ohne Datenquelle
// oder ohne Spalten-Feld bleibt die exportierte Maske statisch (WYSIWYG wie
// bisher) — nichts bricht.
//
// SoftEngine-Mechanik (Funktionsliste nach der Repo-Referenzmaske
// dashboard/praxis-kanban.html, neu in TypeScript umgesetzt):
//  - SEDATA.Daten.SEFileLoop liefert Zeilen je ALIAS (Array oder Objekt,
//    Zeilen unter Zeilen/Saetze/Rows/Daten); Fallback SEDATA.Daten.Tabellen.
//  - Feldcodes sind direkte Property-Namen ODER 'pos_len' (Position_Laenge
//    im SATZ-Rohstring).
//  - Beim Start Schnittstelle initialisieren, auf SEDATA warten (Poll),
//    Erstellen/initData/ReloadData als Einstiegspunkte anbieten.

import { getAllBlockDefinitions } from '../../core/blocks/blockRegistry'
import { getDataSource } from '../../core/data/dataSources'
import { CardBlock } from '../card/CardBlock'
import { KanbanSpalteBlock } from './KanbanSpalteBlock'

// ---------- Pure Helfer (Node-testbar, kein DOM) ----------

type UnknownRecord = Record<string, unknown>

function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === 'object' && v !== null
}

function asTrimmedString(v: unknown): string {
  return v == null ? '' : String(v).trim()
}

// Wert eines Feldcodes aus einer Zeile: direkter Property-Name, sonst
// 'pos_len'-Ausschnitt aus dem SATZ-Rohstring (SATZNEU vor SATZ vor RAW).
export function getField(row: unknown, code: string): string {
  if (!isRecord(row) || code === '') return ''
  const direct = asTrimmedString(row[code])
  if (direct !== '') return direct
  const m = /^(\d+)_(\d+)$/.exec(code)
  if (!m) return ''
  const raw = asTrimmedString(
    row.SATZNEU ?? row.SATZ ?? row.satzneu ?? row.satz ?? row.RAW ?? row.raw,
  )
  if (raw === '') return ''
  const pos = Number(m[1])
  const len = Number(m[2])
  if (len <= 0) return ''
  return raw.substring(pos, pos + len).trim()
}

// Zeilen-Liste aus einem SEFileLoop-/Tabellen-Eintrag ziehen (SoftEngine
// benennt sie je nach Version unterschiedlich).
function rowsOfEntry(entry: unknown): unknown[] {
  if (!isRecord(entry)) return Array.isArray(entry) ? entry : []
  const candidates = [
    entry.Zeilen, entry.zeilen, entry.Saetze, entry.saetze,
    entry.Rows, entry.rows, entry.Daten, entry.daten,
  ]
  for (const c of candidates) {
    if (Array.isArray(c)) return c
    if (typeof c === 'string') {
      try {
        const parsed: unknown = JSON.parse(c)
        if (Array.isArray(parsed)) return parsed
      } catch { /* kein JSON -> naechster Kandidat */ }
    }
  }
  return []
}

function sameAlias(a: unknown, alias: string): boolean {
  return asTrimmedString(a).toLowerCase() === alias.trim().toLowerCase()
}

// Zeilen einer Datenquelle aus SEDATA: erst SEFileLoop (Array oder Objekt),
// dann Tabellen (ALIAS- und IDB-ID-Schluessel). Nichts gefunden -> [].
export function rowsFor(seData: unknown, alias: string, idbId: string): unknown[] {
  if (!isRecord(seData) || !isRecord(seData.Daten)) return []
  const daten = seData.Daten

  const sfl = daten.SEFileLoop
  if (Array.isArray(sfl)) {
    for (const entry of sfl) {
      if (isRecord(entry) && (sameAlias(entry.ALIAS, alias) || sameAlias(entry.alias, alias))) {
        const rows = rowsOfEntry(entry)
        if (rows.length > 0) return rows
      }
    }
  } else if (isRecord(sfl)) {
    for (const key of Object.keys(sfl)) {
      const entry = sfl[key]
      if (sameAlias(key, alias)
        || (isRecord(entry) && (sameAlias(entry.ALIAS, alias) || sameAlias(entry.alias, alias)))) {
        const rows = rowsOfEntry(entry)
        if (rows.length > 0) return rows
      }
    }
  }

  const tab = daten.Tabellen
  if (isRecord(tab)) {
    const keys = [alias, alias.toUpperCase(), alias.toLowerCase(), idbId]
    for (const key of keys) {
      if (key !== '' && key in tab) {
        const rows = rowsOfEntry(tab[key])
        if (rows.length > 0) return rows
      }
    }
    for (const key of Object.keys(tab)) {
      if (sameAlias(key, alias)) {
        const rows = rowsOfEntry(tab[key])
        if (rows.length > 0) return rows
      }
    }
  }
  return []
}

// Ziel-Spalte einer Zeile: erster exakter Treffer (getrimmt, Gross/klein
// egal); leere Spalten-Datenwerte treffen nie; kein Treffer -> Spalte 0
// (Auffang, wie SPALTEN[0] der Referenzmaske).
export function columnIndexFor(value: string, columnValues: readonly string[]): number {
  const v = value.trim().toLowerCase()
  if (v !== '') {
    for (let i = 0; i < columnValues.length; i++) {
      const cv = columnValues[i].trim().toLowerCase()
      if (cv !== '' && cv === v) return i
    }
  }
  return 0
}

// ---------- SoftEngine-Anbindung (nur im Export aktiv) ----------

/* eslint-disable @typescript-eslint/no-explicit-any -- SEDATA/selib sind
   fremde, untypisierte SoftEngine-Globals (Formen siehe Referenzmaske). */
function seGlobal(): any {
  return globalThis as any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function hasSeData(): boolean {
  const g = seGlobal()
  return isRecord(g.SEDATA) && isRecord(g.SEDATA.Daten)
}

// Schnittstelle initialisieren — exakt die Aufrufe der Referenzmaske; alle
// optional, weil sie nur in SoftEngine existieren.
function tryInitSe(): void {
  const g = seGlobal()
  try { g.selib?.Json?.InitializeERPConnection?.() } catch { /* nicht in SE */ }
  try { if (typeof g.InitialisiereSchnittstelle === 'function') g.InitialisiereSchnittstelle() } catch { /* s.o. */ }
}

function refreshDataBasis(): void {
  const g = seGlobal()
  try { if (typeof g.ResetDataBasis === 'function') g.ResetDataBasis() } catch { /* nicht in SE */ }
  try { if (typeof g.InitialisiereDatenBasis === 'function') g.InitialisiereDatenBasis() } catch { /* s.o. */ }
}

// ---------- Board-Verwaltung + Hydrierung ----------

const boards = new Set<HTMLElement>()
// Vorlagen-Karte je Board: VOR dem ersten Befuellen geklont, damit jede
// Neu-Hydrierung (ReloadData) wieder von der gestalteten Karte ausgeht.
const templates = new WeakMap<HTMLElement, HTMLElement>()
let booted = false

// Tag-Namen aus den Block-Klassen (dieselbe Quelle wie die Registry —
// keine duplizierten String-Literale).
const SPALTE_TAG = KanbanSpalteBlock.tagName
const CARD_TAG = CardBlock.tagName

function columnsOf(board: HTMLElement): HTMLElement[] {
  return Array.from(board.children).filter(
    (el): el is HTMLElement => el.tagName.toLowerCase() === SPALTE_TAG,
  )
}

function cardsOf(column: HTMLElement): HTMLElement[] {
  return Array.from(column.children).filter(
    (el): el is HTMLElement => el.tagName.toLowerCase() === CARD_TAG,
  )
}

// Bindbare Stellen des Karten-Typs aus der Registry (ueber den Tag-Namen,
// kein `if type===`): dieselbe Quelle, die Editor + Export benutzen.
function spotsForTag(tagName: string) {
  const def = getAllBlockDefinitions().find((d) => d.tagName === tagName.toLowerCase())
  return def?.bindableSpots ?? []
}

function hydrate(board: HTMLElement): void {
  const sourceId = board.getAttribute('source') ?? ''
  const statusField = board.getAttribute('statusfield') ?? ''
  if (sourceId === '' || statusField === '') return // statisch bleiben
  const source = getDataSource(sourceId)
  if (!source) return

  const columns = columnsOf(board)
  if (columns.length === 0) return

  // Vorlage einmalig sichern (erste gestaltete Karte in Board-Reihenfolge).
  let template = templates.get(board)
  if (!template) {
    for (const col of columns) {
      const first = cardsOf(col)[0]
      if (first) {
        template = first.cloneNode(true) as HTMLElement
        templates.set(board, template)
        break
      }
    }
  }
  if (!template) return // Board ohne einzige Karte: keine Vorlage, nichts tun

  const rows = rowsFor(seGlobal().SEDATA, source.name, source.idbId)
  const columnValues = columns.map((c) => c.getAttribute('statusvalue') ?? '')
  const spots = spotsForTag(template.tagName)

  // Gestaltete Beispiel-Karten raus, Daten-Karten rein (idempotent).
  for (const col of columns) cardsOf(col).forEach((card) => card.remove())
  for (const row of rows) {
    const card = template.cloneNode(true) as HTMLElement
    columns[columnIndexFor(getField(row, statusField), columnValues)].appendChild(card)
    // Gebundene Stellen mit den Zeilenwerten fuellen — ungebundene behalten
    // den statischen Text der Vorlage. Property-Zuweisung NACH dem Einhaengen
    // (Element ist dann sicher upgegradet, Lit uebernimmt das Rendern).
    for (const spot of spots) {
      const code = card.getAttribute(`${spot.prop.toLowerCase()}field`) ?? ''
      if (code !== '') {
        (card as unknown as Record<string, unknown>)[spot.prop] = getField(row, code)
      }
    }
  }
}

function hydrateAll(): void {
  if (!hasSeData()) return
  boards.forEach(hydrate)
}

// Einmal pro Maske: Schnittstelle starten, Einstiegspunkte anbieten, auf
// SEDATA warten (Poll wie in der Referenzmaske: 300ms, max. 100 Versuche).
function boot(): void {
  if (booted) return
  booted = true
  tryInitSe()
  const g = seGlobal()
  g.Erstellen = () => { refreshDataBasis(); hydrateAll() }
  g.initData = g.Erstellen
  g.ReloadData = () => hydrateAll()
  let tries = 0
  const poll = setInterval(() => {
    tries += 1
    if (hasSeData()) {
      clearInterval(poll)
      refreshDataBasis()
      hydrateAll()
    } else if (tries > 100) {
      clearInterval(poll)
    }
  }, 300)
}

// Vom KanbanBlock bei connectedCallback gerufen. Editor-Boards (BlockHost
// setzt data-ff-editor VOR dem Einhaengen) melden sich nie an — die gesamte
// Daten-Mechanik existiert im Editor schlicht nicht.
export function connectBoard(board: HTMLElement): void {
  if (board.hasAttribute('data-ff-editor')) return
  boards.add(board)
  boot()
  if (hasSeData()) hydrate(board)
}

export function disconnectBoard(board: HTMLElement): void {
  boards.delete(board)
}
