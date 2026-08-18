import { bindingAttr } from '../../core/blocks/BlockDefinition'
import { getAllBlockDefinitions } from '../../core/blocks/blockRegistry'
import { getField, satzIndexVon } from '../../softengine/data'
import { auswahlWiederfinden, geberIdVon, waehleAuswahl } from '../shared/auswahl'
import { macheDatenAnschluss } from '../shared/datenAnschluss'
import { holeDatenVorspann } from '../shared/datenVorspann'
import { LEER_TEXT_STANDARD } from '../shared/leerZustand'
import { meldeKettenFehler, runEvent } from '../shared/seAktionen'
import { CardBlock } from '../card/CardBlock'
import { KanbanSpalteBlock } from './KanbanSpalteBlock'
import { KanbanZimmerBlock, ZIMMER_LEER_TEXT } from './KanbanZimmerBlock'

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

const templates = new WeakMap<HTMLElement, HTMLElement>()

const SPALTE_TAG = KanbanSpalteBlock.tagName
const ZIMMER_TAG = KanbanZimmerBlock.tagName
const CARD_TAG = CardBlock.tagName

function columnsOf(board: HTMLElement): HTMLElement[] {
  return Array.from(board.children).filter(
    (el): el is HTMLElement => el.tagName.toLowerCase() === SPALTE_TAG,
  )
}

function cardsOf(flaeche: HTMLElement): HTMLElement[] {
  return Array.from(flaeche.children).filter(
    (el): el is HTMLElement => el.tagName.toLowerCase() === CARD_TAG,
  )
}

function zimmerOf(column: HTMLElement): HTMLElement[] {
  return Array.from(column.children).filter(
    (el): el is HTMLElement => el.tagName.toLowerCase() === ZIMMER_TAG,
  )
}

function ablagenOf(column: HTMLElement): HTMLElement[] {
  return [column, ...zimmerOf(column)]
}

function setzeLeerHinweise(board: HTMLElement, columns: readonly HTMLElement[]): void {
  const satz = board.getAttribute('leertext') ?? LEER_TEXT_STANDARD
  const setze = (el: HTMLElement, text: string): void => {
    (el as unknown as { leerHinweis: string }).leerHinweis = text
  }
  for (const col of columns) {
    const zimmer = zimmerOf(col)
    for (const z of zimmer) setze(z, cardsOf(z).length === 0 ? ZIMMER_LEER_TEXT : '')
    setze(col, zimmer.length === 0 && cardsOf(col).length === 0 ? satz : '')
  }
}

function spotsForTag(tagName: string) {
  const def = getAllBlockDefinitions().find((d) => d.tagName === tagName.toLowerCase())
  return def?.bindableSpots ?? []
}

function zielZimmer(column: HTMLElement, row: unknown): HTMLElement | null {
  const zimmer = zimmerOf(column)
  if (zimmer.length === 0) return null
  const feld = column.getAttribute('zimmerfield') ?? ''
  if (feld === '') return zimmer[0]

  const titel = zimmer.map(
    (z) => z.getAttribute('heading') ?? KanbanZimmerBlock.defaultProps.heading,
  )
  const idx = columnIndexFor(getField(row, feld), titel)
  return idx >= 0 ? zimmer[idx] : zimmer[0]
}

function hydrate(board: HTMLElement): void {
  if (dragged?.board === board) beendeZug()

  const statusField = board.getAttribute('statusfield') ?? ''
  const vorspann = holeDatenVorspann(board)
  if (!vorspann) return

  const columns = columnsOf(board)
  if (columns.length === 0) return

  let template = templates.get(board)
  if (!template) {
    const tpl = board.querySelector('template[data-ff-template]') as HTMLTemplateElement | null
    const source = tpl?.content.firstElementChild ?? board.querySelector(CARD_TAG)
    if (source) {
      template = source.cloneNode(true) as HTMLElement
      templates.set(board, template)
    }
  }
  if (!template) return

  const rows = vorspann.zeilen

  const columnValues = columns.map(
    (c) => c.getAttribute('heading') ?? KanbanSpalteBlock.defaultProps.heading,
  )
  const spots = spotsForTag(template.tagName)
  const catchIdx = catchColumnIndex(columns.map((c) => c.getAttribute('auffang')))

  const lies = vorspann.lies

  for (const col of columns) {
    for (const ablage of ablagenOf(col)) cardsOf(ablage).forEach((card) => card.remove())
  }
  for (const row of rows) {
    const card = template.cloneNode(true) as HTMLElement
    const idx = statusField === ''
      ? -1
      : columnIndexFor(getField(row, statusField), columnValues)

    const column = idx >= 0
      ? columns[idx]
      : catchIdx >= 0 ? columns[catchIdx] : columns[0]

    const target = zielZimmer(column, row) ?? column
    target.appendChild(card)

    for (const spot of spots) {
      const wert = card.getAttribute(bindingAttr(spot.prop)) ?? ''
      if (wert !== '') {
        (card as unknown as Record<string, unknown>)[spot.prop] = lies(row, wert)
      }
    }

    const pindex = satzIndexVon(vorspann.quelle, row)
    cardData.set(card, { row, pindex })
    card.draggable = true
  }

  setzeLeerHinweise(board, columns)

  const karten = columns.flatMap((col) => ablagenOf(col).flatMap(cardsOf))
  const treffer = auswahlWiederfinden(
    geberIdVon(board),
    karten,
    (card) => cardData.get(card)?.row,
  )
  for (const i of treffer) karten[i].setAttribute('data-ff-auswahl', '')
}

const cardData = new WeakMap<HTMLElement, { row: unknown; pindex: string }>()

let dragged: { card: HTMLElement; board: HTMLElement } | null = null
const wiredBoards = new WeakSet<HTMLElement>()

const ZIEHT_ATTR = 'data-ff-zieht'
const ZIEL_ATTR = 'data-ff-ziel'

let ziel: HTMLElement | null = null

function markiereZiel(neu: HTMLElement | null): void {
  if (ziel === neu) return
  ziel?.removeAttribute(ZIEL_ATTR)
  ziel = neu
  ziel?.setAttribute(ZIEL_ATTR, '')
}

function beendeZug(): void {
  dragged?.card.removeAttribute(ZIEHT_ATTR)
  dragged = null
  markiereZiel(null)
}

function flaecheOfEvent(board: HTMLElement, e: Event, tag: string): HTMLElement | null {
  for (const el of e.composedPath()) {
    if (el instanceof HTMLElement && el.tagName.toLowerCase() === tag && board.contains(el)) {
      return el
    }
  }
  return null
}

function columnOfEvent(board: HTMLElement, e: Event): HTMLElement | null {
  return flaecheOfEvent(board, e, SPALTE_TAG)
}

function handleDrop(board: HTMLElement, column: HTMLElement, zimmer: HTMLElement | null): void {
  if (!dragged || dragged.board !== board) return
  const data = cardData.get(dragged.card)
  if (!data) return
  const targetValue = column.getAttribute('heading') ?? ''

  const zimmerValue = zimmer?.getAttribute('heading') ?? ''
  runEvent(board, 'onCardDrop', {
    PINDEX: data.pindex,
    VALUE: targetValue,
    ZIMMER: zimmerValue,
  }).catch(meldeKettenFehler)
}

function wireDrag(board: HTMLElement): void {
  if (wiredBoards.has(board)) return
  wiredBoards.add(board)

  board.addEventListener('click', (e) => {
    const card = (e.composedPath().find(
      (el) => el instanceof HTMLElement && cardData.has(el),
    ) ?? null) as HTMLElement | null
    if (!card) return
    const data = cardData.get(card)
    if (data) waehleAuswahl(geberIdVon(board), data.row)
    runEvent(board, 'onCardClick', { PINDEX: data?.pindex ?? '' })
      .catch(meldeKettenFehler)
  })
  board.addEventListener('dragstart', (e) => {
    const card = (e.composedPath().find(
      (el) => el instanceof HTMLElement && cardData.has(el),
    ) ?? null) as HTMLElement | null
    if (!card) return
    dragged = { card, board }
    e.dataTransfer?.setData('text/plain', cardData.get(card)?.pindex ?? '')
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'

    setTimeout(() => {
      if (dragged?.card === card) card.setAttribute(ZIEHT_ATTR, '')
    }, 0)
  })
  board.addEventListener('dragend', beendeZug)
  board.addEventListener('dragover', (e) => {
    const column = columnOfEvent(board, e)
    if (dragged?.board !== board || !column) {
      markiereZiel(null)
      return
    }
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    markiereZiel(flaecheOfEvent(board, e, ZIMMER_TAG) ?? column)
  })

  board.addEventListener('dragleave', (e) => {
    const nach = e.relatedTarget
    if (!(nach instanceof Node) || !board.contains(nach)) markiereZiel(null)
  })
  board.addEventListener('drop', (e) => {
    const column = columnOfEvent(board, e)
    if (!column) return
    e.preventDefault()

    handleDrop(board, column, flaecheOfEvent(board, e, ZIMMER_TAG))

    beendeZug()
  })
}

const anschluss = macheDatenAnschluss<HTMLElement>({ hydriere: hydrate, verdrahte: wireDrag })

export const connectBoard = anschluss.connect
export const disconnectBoard = anschluss.disconnect
