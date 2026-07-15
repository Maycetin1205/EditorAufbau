// seRuntime (Kap. 5.3) — das KANBAN-Datenverhalten in der exportierten Maske
//
// Seit dem Schicht-Umzug 2026-07-15 liegt hier NUR noch Kanban: Zeilen
// werden Karten (Vorlage = die Musterkarte des Boards), der Wert des
// Spalten-Felds bestimmt die Spalte (exakter Vergleich mit dem TITEL,
// Titel = Wert), Karten ziehen schreibt zurück. Alles Allgemeine —
// SE-Anmeldung/Daten-Push (bridge), Feld lesen/schreiben und Zeilen
// (data), Vorlagen-Auflösung + PUT (relations) — wohnt in src/softengine/
// und wird hier nur benutzt.
//
// Läuft NUR im Export: der BlockHost markiert Editor-Elemente mit
// data-ff-editor, solche Boards melden sich hier nie an. Ohne Datenquelle
// oder ohne Spalten-Feld bleibt die exportierte Maske statisch (WYSIWYG
// wie bisher) — nichts bricht.

import { getAllBlockDefinitions } from '../../core/blocks/blockRegistry'
import { relIdFromIdbId } from '../../core/data/relations'
import { bootSe, hasSeData, onSeDaten, seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, getField, rowsFor, setField } from '../../softengine/data'
import { findRuntimeRelation, sendPut, type RuntimeRelation } from '../../softengine/relations'
import { runEvent } from '../shared/seAktionen'
import { CardBlock } from '../card/CardBlock'
import { KanbanSpalteBlock } from './KanbanSpalteBlock'

// ---------- Pure Helfer (Node-testbar, kein DOM) ----------

// Ziel-Spalte einer Zeile: erster exakter Treffer gegen die Spaltentitel.
// Leere Titel und unbekannte Werte liefern -1; hydrate entscheidet danach
// zwischen gewählter Auffangspalte und Nicht zugeordnet.
export function columnIndexFor(value: string, columnValues: readonly string[]): number {
  const v = value.trim().toLowerCase()
  if (v !== '') {
    for (let i = 0; i < columnValues.length; i++) {
      const cv = columnValues[i].trim().toLowerCase()
      if (cv !== '' && cv === v) return i
    }
  }
  return -1
}

export function catchColumnIndex(flags: readonly (string | null | undefined)[]): number {
  return flags.findIndex((flag) => (flag ?? '').trim() === 'ja')
}

// ---------- Board-Verwaltung + Hydrierung ----------

const boards = new Set<HTMLElement>()
// Musterkarte je Board: VOR dem ersten Befüllen geklont, damit jede
// Neu-Hydrierung (ReloadData) wieder von der gestalteten Karte ausgeht.
// Quelle = die ERSTE Karte des Boards in Dokumentreihenfolge (P1.1,
// templateChild in der Registry — dieselbe Definition wie die dezente
// "Muster"-Markierung des Editors).
const templates = new WeakMap<HTMLElement, HTMLElement>()

// Tag-Namen aus den Block-Klassen (dieselbe Quelle wie die Registry —
// keine duplizierten String-Literale).
const SPALTE_TAG = KanbanSpalteBlock.tagName
const CARD_TAG = CardBlock.tagName
const AUTO_COLUMN_ATTR = 'data-ff-nicht-zugeordnet'
const AUTO_COLUMN_TITLE = 'Nicht zugeordnet'

function columnsOf(board: HTMLElement): HTMLElement[] {
  return Array.from(board.children).filter(
    (el): el is HTMLElement =>
      el.tagName.toLowerCase() === SPALTE_TAG && !el.hasAttribute(AUTO_COLUMN_ATTR),
  )
}

function cardsOf(column: HTMLElement): HTMLElement[] {
  return Array.from(column.children).filter(
    (el): el is HTMLElement => el.tagName.toLowerCase() === CARD_TAG,
  )
}

// Bindbare Stellen des Karten-Typs aus der Registry (über den Tag-Namen,
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
  // Titel = Datenwert (2026-07-14): heading reist als Export-Attribut mit.
  const columnValues = columns.map((c) => c.getAttribute('heading') ?? '')
  const spots = spotsForTag(template.tagName)
  const catchIdx = catchColumnIndex(columns.map((c) => c.getAttribute('auffang')))

  // Gestaltete Beispiel-Karten raus, Daten-Karten rein (idempotent).
  board.querySelectorAll('[' + AUTO_COLUMN_ATTR + ']').forEach((el) => el.remove())
  let autoColumn: HTMLElement | null = null
  const ensureAutoColumn = (): HTMLElement => {
    if (!autoColumn) {
      autoColumn = document.createElement(SPALTE_TAG)
      autoColumn.setAttribute('heading', AUTO_COLUMN_TITLE)
      autoColumn.setAttribute(AUTO_COLUMN_ATTR, '')
      autoColumn.setAttribute(
        'style',
        columns[0].getAttribute('style') ?? 'flex-grow:1;flex-basis:0;min-width:0',
      )
      board.appendChild(autoColumn)
    }
    return autoColumn
  }

  for (const col of columns) cardsOf(col).forEach((card) => card.remove())
  for (const row of rows) {
    const card = template.cloneNode(true) as HTMLElement
    const idx = columnIndexFor(getField(row, statusField), columnValues)
    const target = idx >= 0
      ? columns[idx]
      : catchIdx >= 0 ? columns[catchIdx] : ensureAutoColumn()
    target.appendChild(card)
    // Gebundene Stellen mit den Zeilenwerten füllen — ungebundene behalten
    // den statischen Text der Vorlage. Property-Zuweisung NACH dem Einhängen
    // (Element ist dann sicher upgegradet, Lit übernimmt das Rendern).
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
// HTML5-Drag auf Daten-Karten, Drop auf eine Spalte -> TITEL der Zielspalte
// (heading = Datenwert) über die mitgelieferte Relation-Vorlage ins Spalten-
// Feld schreiben, Zeile im Speicher aktualisieren, neu hydrieren (Muster alter
// Editor, 5.3b (b)). Läuft NUR im Export: verdrahtet wird in
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

// Drop einer Daten-Karte auf eine Spalte. Geschrieben wird der Spalten-TITEL
// (Titel = Datenwert, 2026-07-14); Spalte ohne Titel ist kein Schreibziel;
// gleicher Wert = kein Zug (derselbe Vergleich wie beim Verteilen: getrimmt,
// Groß/klein egal). Ohne konfigurierten Schreibweg (keine Vorlage gewählt)
// bewegt sich NICHTS — ein rein lokaler Zug wäre eine Täuschung (er
// verschwände beim nächsten ReloadData). WYSIWYG.
function handleDrop(board: HTMLElement, column: HTMLElement): void {
  if (!dragged || dragged.board !== board) return
  const data = cardData.get(dragged.card)
  if (!data) return
  const statusField = board.getAttribute('statusfield') ?? ''
  const targetValue = column.getAttribute('heading') ?? ''
  if (statusField === '' || targetValue.trim() === '') return
  const current = getField(data.row, statusField)
  if (current.trim().toLowerCase() === targetValue.trim().toLowerCase()) return
  const path = writePathFor(board)
  if (!path) return
  sendPut(path.template, path.relId, statusField, data.pindex, targetValue)
  setField(data.row, statusField, targetValue)
  hydrate(board)
  // Z2: Aktionskette „Karte verschoben" NACH dem erfolgreichen
  // Zurückschreiben — {PINDEX} = Satznummer der gezogenen Karte,
  // {VALUE} = der neue Spaltenwert.
  void runEvent(board, 'onCardDrop', { PINDEX: data.pindex, VALUE: targetValue })
}

function wireDrag(board: HTMLElement): void {
  if (wiredBoards.has(board)) return
  wiredBoards.add(board)
  // Z2: Aktionskette „Karte angeklickt" — nur echte Datenkarten mit
  // Satznummer lösen aus (dieselbe Regel wie das Ziehen: cardData).
  board.addEventListener('click', (e) => {
    const card = (e.composedPath().find(
      (el) => el instanceof HTMLElement && cardData.has(el),
    ) ?? null) as HTMLElement | null
    if (!card) return
    void runEvent(board, 'onCardClick', { PINDEX: cardData.get(card)?.pindex ?? '' })
  })
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
    const column = columnOfEvent(board, e)
    if (dragged?.board === board && column && !column.hasAttribute(AUTO_COLUMN_ATTR)) {
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    }
  })
  board.addEventListener('drop', (e) => {
    const column = columnOfEvent(board, e)
    if (!column || column.hasAttribute(AUTO_COLUMN_ATTR)) return
    e.preventDefault()
    handleDrop(board, column)
    dragged = null
  })
}

function hydrateAll(): void {
  if (!hasSeData()) return
  boards.forEach(hydrate)
}

// Die Boards hören auf die Klingel der Brücke (Abo-Punkt) — einmal je
// Maske angemeldet. Im Editor passiert das nie (connectBoard bricht ab).
let subscribed = false

// Vom KanbanBlock bei connectedCallback gerufen. Editor-Boards (BlockHost
// setzt data-ff-editor VOR dem Einhängen) melden sich nie an — die gesamte
// Daten-Mechanik existiert im Editor schlicht nicht.
export function connectBoard(board: HTMLElement): void {
  if (board.hasAttribute('data-ff-editor')) return
  boards.add(board)
  wireDrag(board)
  if (!subscribed) {
    subscribed = true
    onSeDaten(hydrateAll)
  }
  bootSe()
  if (hasSeData()) hydrate(board)
}

export function disconnectBoard(board: HTMLElement): void {
  boards.delete(board)
}
