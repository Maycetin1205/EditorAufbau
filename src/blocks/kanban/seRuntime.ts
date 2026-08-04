// seRuntime — das KANBAN-Datenverhalten in der exportierten Maske
//
// Hier liegt NUR Kanban: Zeilen werden Karten (Vorlage = die Musterkarte
// des Boards), der Wert des Spalten-Felds bestimmt die Spalte (exakter
// Vergleich mit dem TITEL, Titel = Wert). Alles Allgemeine — SE-Anmeldung/
// Daten-Push (bridge), Feld lesen und Zeilen (data) — wohnt in
// src/softengine/ und wird hier nur benutzt.
//
// KEIN eingebauter Schreibweg: ein Drop ist nur ein Auslöser — was
// passiert, bestimmt allein die sichtbare Aktionskette „Karte verschoben".
// „Einsortieren nach" (statusField) ist OPTIONAL: ohne Feld landen alle
// Zeilen in der Auffang- bzw. einer Auto-Spalte. (Entscheidungs-Historie:
// docs/decisions/2026-07-15-kanban-schreibweg-und-schicht.md)
//
// Läuft NUR im Export: der BlockHost markiert Editor-Elemente mit
// data-ff-editor, solche Boards melden sich hier nie an. Ohne Datenquelle
// bleibt die exportierte Maske statisch (WYSIWYG wie bisher) — nichts bricht.

import { bindingAttr } from '../../core/blocks/BlockDefinition'
import { getAllBlockDefinitions } from '../../core/blocks/blockRegistry'
import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, getField, rowsFor } from '../../softengine/data'
import { auswahlMerkmal, klareAuswahl, merkmalVon, waehleAuswahl } from '../shared/auswahl'
import { macheDatenAnschluss } from '../shared/datenAnschluss'
import { macheFeldLeser } from '../shared/fremdeQuellen'
import { gewaehlterTag } from '../shared/gewaehlterTag'
import { zeilenAmTag } from '../shared/tagFilter'
import { runEvent } from '../shared/seAktionen'
import { CardBlock } from '../card/CardBlock'
import { KanbanSpalteBlock } from './KanbanSpalteBlock'

// ---------- Pure Helfer (Node-testbar, kein DOM) ----------

// Ziel-Spalte einer Zeile: erster exakter Treffer gegen die Spaltentitel.
// Leere Titel und unbekannte Werte liefern -1; hydrate nimmt dann die
// gewählte Auffangspalte, sonst die erste Spalte.
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

// Musterkarte je Board: VOR dem ersten Befüllen geklont, damit jede
// Neu-Hydrierung (ReloadData) wieder von der gestalteten Karte ausgeht.
// Quelle = die ERSTE Karte des Boards in Dokumentreihenfolge (
// templateChild in der Registry — dieselbe Definition wie die dezente
// "Muster"-Markierung des Editors).
const templates = new WeakMap<HTMLElement, HTMLElement>()

// Tag-Namen aus den Block-Klassen (dieselbe Quelle wie die Registry —
// keine duplizierten String-Literale).
const SPALTE_TAG = KanbanSpalteBlock.tagName
const CARD_TAG = CardBlock.tagName
// Bis 2026-07-27 baute die Laufzeit hier eine eigene Spalte „Nicht
// zugeordnet", wenn eine Zeile in keine Spalte passte und keine
// Auffangspalte gewählt war. Ersatzlos gestrichen (Nutzer-Entscheidung):
// der Baukasten erfindet keine Spalte, die der Bediener nie hingestellt
// hat — solche Zeilen landen jetzt in der ERSTEN Spalte.

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

// Bindbare Stellen des Karten-Typs aus der Registry (über den Tag-Namen,
// kein `if type===`): dieselbe Quelle, die Editor + Export benutzen.
function spotsForTag(tagName: string) {
  const def = getAllBlockDefinitions().find((d) => d.tagName === tagName.toLowerCase())
  return def?.bindableSpots ?? []
}

function hydrate(board: HTMLElement): void {
  const sourceId = board.getAttribute('source') ?? ''
  // „Einsortieren nach" ist optional (Nutzer-Entscheidung 2026-07-15):
  // ohne Feld gehen alle Zeilen in die Auffang- bzw. eine Auto-Spalte.
  const statusField = board.getAttribute('statusfield') ?? ''
  if (sourceId === '') return // statisch bleiben
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

  // Tagesfilter (shared/tagFilter): ohne eingestelltes Datumsfeld bzw. ohne
  // gewaehlten Tag bleibt die Liste unveraendert — Boards ohne Tageswaehler
  // verhalten sich exakt wie vorher.
  const rows = zeilenAmTag(
    rowsFor(seGlobal().SEDATA, source.name, source.tableId),
    board.getAttribute('tagfield') ?? '',
    gewaehlterTag(),
  )
  // Titel = Datenwert (2026-07-14): heading reist als Export-Attribut mit.
  // Fehlendes Attribut = STANDARDTITEL, nicht leer: seit der Export
  // Standardwerte weglaesst (2026-08-06), traegt eine nie umbenannte Spalte
  // kein heading — sie soll dann den Wert vergleichen, den sie ANZEIGT
  // (Lit-Standard = derselbe defaultProps-Wert), nicht den leeren String.
  const columnValues = columns.map(
    (c) => c.getAttribute('heading') ?? KanbanSpalteBlock.defaultProps.heading,
  )
  const spots = spotsForTag(template.tagName)
  const catchIdx = catchColumnIndex(columns.map((c) => c.getAttribute('auffang')))
  // Weitere Quellen haengen am BOARD (es traegt die Datenquelle), nicht an
  // der Karte — der Leser wird deshalb einmal je Board gebaut und von allen
  // Karten benutzt.
  const lies = macheFeldLeser(board)

  // Gestaltete Beispiel-Karten raus, Daten-Karten rein (idempotent).
  for (const col of columns) cardsOf(col).forEach((card) => card.remove())
  for (const row of rows) {
    const card = template.cloneNode(true) as HTMLElement
    const idx = statusField === ''
      ? -1
      : columnIndexFor(getField(row, statusField), columnValues)
    // Kein Treffer: gewählte Auffangspalte, sonst die erste Spalte.
    const target = idx >= 0
      ? columns[idx]
      : catchIdx >= 0 ? columns[catchIdx] : columns[0]
    target.appendChild(card)
    // Gebundene Stellen mit den Zeilenwerten füllen — ungebundene behalten
    // den statischen Text der Vorlage. Property-Zuweisung NACH dem Einhängen
    // (Element ist dann sicher upgegradet, Lit übernimmt das Rendern).
    for (const spot of spots) {
      // Attribut-Form der Bindungs-Konvention (bindingAttr = die eine Stelle).
      const wert = card.getAttribute(bindingAttr(spot.prop)) ?? ''
      if (wert !== '') {
        (card as unknown as Record<string, unknown>)[spot.prop] = lies(row, wert)
      }
    }
    // Jede Daten-Karte ist ziehbar. Der Drop ist nur ein Auslöser für die
    // Kette „Karte verschoben" — {PINDEX} reist mit, wenn die Zeile eine
    // Datensatz-Nummer trägt, sonst leer (die Kette entscheidet selbst,
    // was sie braucht).
    const pindex = source.indexField === '' ? '' : getField(row, source.indexField)
    cardData.set(card, { row, pindex })
    card.draggable = true
  }

  // Auswahl-Markierung (2026-08-05): das Board ist ein Auswahl-GEBER. Die
  // Karten sind nach jeder Hydrierung NEUE Elemente — die gemerkte Auswahl
  // (shared/auswahl, Identitaet = JSON-Abdruck der Zeile) wird deshalb hier
  // wieder angeheftet. Ist die gewaehlte Zeile verschwunden (anderer Tag,
  // geloescht), wird die Auswahl AUFGEHOBEN — sonst filterten Folger nach
  // einer Karte, die niemand mehr sieht (Regel 4).
  const geberId = board.getAttribute('data-ff-id') ?? ''
  if (geberId !== '') {
    const merkmal = auswahlMerkmal(geberId)
    if (merkmal !== '') {
      let gefunden = false
      for (const col of columns) {
        for (const card of cardsOf(col)) {
          const data = cardData.get(card)
          if (data && merkmalVon(data.row) === merkmal) {
            card.setAttribute('data-ff-auswahl', '')
            gefunden = true
          }
        }
      }
      if (!gefunden) klareAuswahl(geberId)
    }
  }
}

// ---------- Karten-Drag im Export ----------
//
// HTML5-Drag auf Daten-Karten, Drop auf eine Spalte -> AUSSCHLIESSLICH die
// Aktionskette „Karte verschoben" läuft ({PINDEX} = Nummer der gezogenen
// Karte, {VALUE} = Titel der Zielspalte). Kein eingebautes Zurückschreiben,
// kein lokales Umhängen — was die Daten ändert, ist allein die Kette; der
// nächste Daten-Push hydriert neu (Nutzer-Entscheidung 2026-07-15).
// Läuft NUR im Export: verdrahtet wird in connectBoard, und Editor-Boards
// (data-ff-editor) melden sich dort nie an — die Canvas-Drag-Logik des
// Editors bleibt unberührt.

// Zeile + Datensatz-Nummer je Daten-Karte (WeakMap: lebt und stirbt mit der Karte).
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

// Drop einer Daten-Karte auf eine Spalte: NUR die Aktionskette läuft.
// Die Karte bleibt liegen — ein rein lokaler Zug wäre eine Täuschung
// (er verschwände beim nächsten Daten-Push). WYSIWYG: was sich bewegt,
// haben die Daten bestätigt.
function handleDrop(board: HTMLElement, column: HTMLElement): void {
  if (!dragged || dragged.board !== board) return
  const data = cardData.get(dragged.card)
  if (!data) return
  const targetValue = column.getAttribute('heading') ?? ''
  void runEvent(board, 'onCardDrop', { PINDEX: data.pindex, VALUE: targetValue })
}

function wireDrag(board: HTMLElement): void {
  if (wiredBoards.has(board)) return
  wiredBoards.add(board)
  // Z2: Aktionskette „Karte angeklickt" — nur echte Datenkarten mit
  // Datensatz-Nummer lösen aus (dieselbe Regel wie das Ziehen: cardData).
  // Seit 2026-08-05 setzt DERSELBE Klick auch die Auswahl (Toggle) — beides
  // gehört zusammen: anklicken heißt „mit dieser Karte arbeiten".
  board.addEventListener('click', (e) => {
    const card = (e.composedPath().find(
      (el) => el instanceof HTMLElement && cardData.has(el),
    ) ?? null) as HTMLElement | null
    if (!card) return
    const data = cardData.get(card)
    if (data) waehleAuswahl(board.getAttribute('data-ff-id') ?? '', data.row)
    void runEvent(board, 'onCardClick', { PINDEX: data?.pindex ?? '' })
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
    if (dragged?.board === board && column) {
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

// Anmeldung/Abo/Bruecke: die geteilte Mechanik (shared/datenAnschluss).
const anschluss = macheDatenAnschluss<HTMLElement>({ hydriere: hydrate, verdrahte: wireDrag })

// Vom KanbanBlock bei connectedCallback gerufen. Editor-Boards melden sich
// nie an — das prueft der geteilte Anschluss.
export const connectBoard = anschluss.connect
export const disconnectBoard = anschluss.disconnect
