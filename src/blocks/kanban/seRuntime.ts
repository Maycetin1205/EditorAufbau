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
import {
  RELATION_VERBS,
  relIdFromIdbId,
  resolveParams,
  splitFieldCode,
  type RelationTemplate,
  type RelationVerb,
} from '../../core/data/relations'
import { CardBlock } from '../card/CardBlock'
import { KanbanSpalteBlock } from './KanbanSpalteBlock'

// ---------- Pure Helfer (Node-testbar, kein DOM) ----------

type UnknownRecord = Record<string, unknown>

function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === 'object' && v !== null
}

// Quellen-Definition in der EXPORTIERTEN Maske (Kap. 5.4): die Vorlagen
// sind benutzerdefiniert und leben im Editor-localStorage — exportMask
// bettet die benutzten Definitionen deshalb als `var FF_DATA_SOURCES = […]`
// in die Maske ein (nur was die Runtime braucht; Feld-Bindungen reisen
// weiter als Attribute). Hier wird ausschließlich darüber aufgelöst.
export interface RuntimeDataSource {
  id: string
  name: string
  tableId: string
  indexField: string
}

// Eintrag zur source-id aus einer FF_DATA_SOURCES-Liste (pur, testbar).
// Kaputte/fremde Einträge werden ignoriert — nie raten.
export function findRuntimeDataSource(list: unknown, id: string): RuntimeDataSource | undefined {
  if (!Array.isArray(list) || id === '') return undefined
  for (const entry of list) {
    if (!isRecord(entry) || entry.id !== id) continue
    if (typeof entry.name !== 'string' || typeof entry.tableId !== 'string') continue
    return {
      id,
      name: entry.name,
      tableId: entry.tableId,
      indexField: typeof entry.indexField === 'string' ? entry.indexField : '',
    }
  }
  return undefined
}

// Relation-Vorlage in der EXPORTIERTEN Maske (Kap. 5.5): die Vorlagen sind
// benutzerdefiniert und leben im Editor-localStorage — exportMask bettet die
// benutzten Vorlagen als `var FF_RELATIONS = […]` ein (Muster
// FF_DATA_SOURCES). Der Anzeigename reist nicht mit (Laufzeit braucht nur
// Technikwerte). Kaputte/fremde Einträge werden ignoriert — nie raten.
export type RuntimeRelation = Pick<RelationTemplate, 'id' | 'verb' | 'nr' | 'params'>

export function findRuntimeRelation(list: unknown, id: string): RuntimeRelation | undefined {
  if (!Array.isArray(list) || id === '') return undefined
  for (const entry of list) {
    if (!isRecord(entry) || entry.id !== id) continue
    if (typeof entry.verb !== 'string' || !RELATION_VERBS.includes(entry.verb as RelationVerb)) continue
    if (typeof entry.nr !== 'string' || entry.nr === '') continue
    if (!Array.isArray(entry.params) || entry.params.some((p) => typeof p !== 'string')) continue
    return { id, verb: entry.verb as RelationVerb, nr: entry.nr, params: entry.params as string[] }
  }
  return undefined
}

// Deutsches Datum fuer den Platzhalter {NOW_DATE} ('08.07.2026' — dieselbe
// Form wie die Datums-Felder der Referenzmaske). Pur: der Aufrufer stellt
// das Datum (sendPut nimmt das echte, Tests ein festes).
export function formatNowDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
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

// Wert eines Feldcodes in eine Zeile ZURÜCKschreiben (Schreibweg 5.3b):
// eine direkte Property wird gesetzt; ein 'pos_len'-Code patcht zusätzlich
// den SATZ-Rohstring (derselbe Schlüssel, den getField liest), damit jede
// Neu-Hydrierung den neuen Wert sieht. Feld wird exakt auf Feldlänge
// gebracht (auffüllen/kürzen), zu kurze Rohstrings bis zur Position
// verlängert — deterministisch. Rückgabe: wurde etwas geschrieben?
export function setField(row: unknown, code: string, value: string): boolean {
  if (!isRecord(row) || code === '') return false
  let written = false
  if (Object.prototype.hasOwnProperty.call(row, code)) {
    row[code] = value
    written = true
  }
  const m = /^(\d+)_(\d+)$/.exec(code)
  if (m) {
    const keys = ['SATZNEU', 'SATZ', 'satzneu', 'satz', 'RAW', 'raw'] as const
    const key = keys.find((k) => typeof row[k] === 'string')
    if (key) {
      const raw = row[key] as string
      const pos = Number(m[1])
      const len = Number(m[2])
      if (len > 0) {
        const field = value.length > len ? value.slice(0, len) : value.padEnd(len, ' ')
        const padded = raw.length < pos ? raw.padEnd(pos, ' ') : raw
        row[key] = padded.slice(0, pos) + field + padded.slice(pos + len)
        written = true
      }
    }
  }
  return written
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
// Musterkarte je Board: VOR dem ersten Befuellen geklont, damit jede
// Neu-Hydrierung (ReloadData) wieder von der gestalteten Karte ausgeht.
// Quelle = die ERSTE Karte des Boards in Dokumentreihenfolge (P1.1,
// templateChild in der Registry — dieselbe Definition wie die dezente
// "Muster"-Markierung des Editors).
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
  const source = findRuntimeDataSource(seGlobal().FF_DATA_SOURCES, sourceId)
  if (!source) return

  const columns = columnsOf(board)
  if (columns.length === 0) return

  // Musterkarte einmalig sichern. Seit 2026-07-10 reist sie als inertes
  // <template data-ff-template> mit (der Browser rendert sie NIE — kein
  // Demo-Blitzen beim SE-Start). Fallback für ALTE Masken: die erste
  // sichtbare Karte in Dokumentreihenfolge (deckt auch den einstigen
  // Vorlagen-Kasten ab — dessen Karte stand ebenfalls vorn).
  let template = templates.get(board)
  if (!template) {
    const tpl = board.querySelector('template[data-ff-template]') as HTMLTemplateElement | null
    const source = tpl?.content.firstElementChild ?? board.querySelector(CARD_TAG)
    if (source) {
      template = source.cloneNode(true) as HTMLElement
      templates.set(board, template)
    }
  }
  if (!template) return // keine Musterkarte, nirgends: nichts tun

  const rows = rowsFor(seGlobal().SEDATA, source.name, source.tableId)
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
    // Schreibweg (5.3b): nur Karten mit Satznummer sind ziehbar. Ohne
    // indexField der Quelle bleibt das Board reines Lesen (wie 5.3a).
    const pindex = getField(row, source.indexField)
    if (pindex !== '') {
      cardData.set(card, { row, pindex })
      card.draggable = true
    }
  }
}

// ---------- Karten-Drag im Export (Schreibweg 5.3b) ----------
//
// HTML5-Drag auf Daten-Karten, Drop auf eine Spalte -> Wert der Zielspalte
// (statusValue) über die mitgelieferte Relation-Vorlage ins Spalten-Feld
// schreiben, Zeile im Speicher aktualisieren, neu hydrieren (Muster alter
// Editor, CLAUDE.md 5.3b (b)). Läuft NUR im Export: verdrahtet wird in
// connectBoard, und Editor-Boards (data-ff-editor) melden sich dort nie an —
// die Canvas-Drag-Logik des Editors bleibt unberührt.

// Zeile + Satznummer je Daten-Karte (WeakMap: lebt und stirbt mit der Karte).
const cardData = new WeakMap<HTMLElement, { row: unknown; pindex: string }>()
// Die gerade gezogene Karte — ein Drag zur Zeit (Browser-Modell).
let dragged: { card: HTMLElement; board: HTMLElement } | null = null
const wiredBoards = new WeakSet<HTMLElement>()

function columnOfEvent(board: HTMLElement, e: Event): HTMLElement | null {
  for (const el of e.composedPath()) {
    if (el instanceof HTMLElement && el.tagName.toLowerCase() === SPALTE_TAG && board.contains(el)) {
      return el
    }
  }
  return null
}

// Der Schreibweg des Boards (Kap. 5.5): die am Board GEWÄHLTE Vorlage +
// die Datenquelle, beide aufgelöst über die eingebetteten FF_*-Daten.
// Kein `putrelation` (leer/unbekannt) ODER keine Quelle -> undefined =
// das Board schreibt nicht (read-only). Der Schreibweg kennt kein Protokoll
// mehr, nur die Vorlage.
function writePathFor(board: HTMLElement): { template: RuntimeRelation; relId: string } | undefined {
  const g = seGlobal()
  const template = findRuntimeRelation(g.FF_RELATIONS, board.getAttribute('putrelation') ?? '')
  const source = findRuntimeDataSource(g.FF_DATA_SOURCES, board.getAttribute('source') ?? '')
  if (!template || !source) return undefined
  return { template, relId: relIdFromIdbId(source.tableId) }
}

// PUT über die aufgelöste Vorlage. Bridge-Wächter: außerhalb von SoftEngine
// (Vorschau, Tests ohne Stub) wird nichts gesendet — der lokale Zug ist dann
// die Vorschau. PUT ist fire-and-forget (Spec (c)).
function sendPut(
  path: { template: RuntimeRelation; relId: string },
  fieldCode: string,
  pindex: string,
  value: string,
): void {
  const g = seGlobal()
  if (typeof g.basisHTML_SND_MSG !== 'function') return
  const field = splitFieldCode(fieldCode)
  if (!field) return
  g.basisHTML_SND_MSG(path.template.verb, {
    NR: path.template.nr,
    PARAMS: resolveParams(path.template, {
      FELD_POS: field.pos,
      FELD_LEN: field.len,
      PINDEX: pindex,
      // Beim Kanban-Drop ist die gezogene Karte der betroffene Satz —
      // {DROP_PINDEX} und {PINDEX} sind hier derselbe Wert. {SELKEY}
      // (Auswahl) füllt erst Kap. 8.
      DROP_PINDEX: pindex,
      RELID: path.relId,
      VALUE: value,
      NOW_DATE: formatNowDate(new Date()),
    }),
  })
}

// Drop einer Daten-Karte auf eine Spalte. Spalte ohne Datenwert ist kein
// Schreibziel; gleicher Wert = kein Zug (derselbe Vergleich wie beim
// Verteilen: getrimmt, Groß/klein egal). Ohne konfigurierten Schreibweg
// (keine Vorlage gewählt) bewegt sich NICHTS — ein rein lokaler Zug wäre
// eine Täuschung (er verschwände beim nächsten ReloadData). WYSIWYG.
function handleDrop(board: HTMLElement, column: HTMLElement): void {
  if (!dragged || dragged.board !== board) return
  const data = cardData.get(dragged.card)
  if (!data) return
  const statusField = board.getAttribute('statusfield') ?? ''
  const targetValue = column.getAttribute('statusvalue') ?? ''
  if (statusField === '' || targetValue.trim() === '') return
  const current = getField(data.row, statusField)
  if (current.trim().toLowerCase() === targetValue.trim().toLowerCase()) return
  const path = writePathFor(board)
  if (!path) return
  sendPut(path, statusField, data.pindex, targetValue)
  setField(data.row, statusField, targetValue)
  hydrate(board)
}

function wireDrag(board: HTMLElement): void {
  if (wiredBoards.has(board)) return
  wiredBoards.add(board)
  board.addEventListener('dragstart', (e) => {
    const card = (e.composedPath().find(
      (el) => el instanceof HTMLElement && cardData.has(el),
    ) ?? null) as HTMLElement | null
    if (!card) return
    dragged = { card, board }
    e.dataTransfer?.setData('text/plain', cardData.get(card)?.pindex ?? '')
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
  })
  board.addEventListener('dragend', () => { dragged = null })
  board.addEventListener('dragover', (e) => {
    if (dragged?.board === board && columnOfEvent(board, e)) {
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    }
  })
  board.addEventListener('drop', (e) => {
    const column = columnOfEvent(board, e)
    if (!column) return
    e.preventDefault()
    handleDrop(board, column)
    dragged = null
  })
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
  wireDrag(board)
  boot()
  if (hasSeData()) hydrate(board)
}

export function disconnectBoard(board: HTMLElement): void {
  boards.delete(board)
}
