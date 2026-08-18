import { html, type TemplateResult } from 'lit'
import type { ListenBindung } from '../../core/blocks/listenBindung'
import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, getField, rowsFor } from '../../softengine/data'
import { meldeFehler } from '../../softengine/meldung'
import { zeilenNachAuswahl } from '../shared/auswahl'
import {
  DIALOG_RAHMEN_TAG,
  DIALOG_SCHLIESSEN_EVENT,
  type DialogGroesseDetail,
  type DialogRahmen,
} from '../shared/DialogRahmen'
import { ART_TEXT } from '../tabelle/spaltenArten'
import { coerceSpalten, STANDARD_TITEL, type Spalte } from '../tabelle/spalten'
import { TabelleBlock } from '../tabelle/TabelleBlock'
import {
  ZEILE_AKTIVIERT_EVENT,
  type ZeileAktiviertDetail,
} from '../tabelle/zeilenAktivierung'

export function nachschlagFeldTpl(args: {
  wert: string
  onTippen: (wert: string) => void
  onVerlassen: () => void
  onLupe: () => void
}): TemplateResult {
  return html`<div class="nachschlag">
    <input
      class="ctrl"
      type="text"
      .value=${args.wert}
      @input=${(e: Event) => args.onTippen((e.target as HTMLInputElement).value)}
      @blur=${() => args.onVerlassen()}
    />
    <button
      class="lupe"
      type="button"
      aria-label="Nachschlagen"
      title="Nachschlagen"
      @pointerdown=${(e: Event) => e.stopPropagation()}
      @click=${() => args.onLupe()}
    ><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"></circle>
      <line x1="10.4" y1="10.4" x2="14" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>
    </svg></button>
  </div>`
}

// Die Spalten des Fensters wohnen am FELD und werden am Ding eingestellt
// (Lupe im Editor). Leer = Automatik: eine Spalte (Wert) bzw. zwei
// (Angezeigt + Wert), je nachdem ob ein eigenes Anzeigefeld gesetzt ist.
export const NACHSCHLAG_SPALTEN_BINDUNG: ListenBindung = {
  prop: 'nachschlagSpalten',
  titelKey: 'titel',
  feldKey: 'feld',
  standardTitel: STANDARD_TITEL,
  quelleProp: 'nachschlagQuelle',
}

export function coerceNachschlagSpalten(v: unknown): Spalte[] {
  if (typeof v === 'string') {
    try {
      v = JSON.parse(v)
    } catch {
      return []
    }
  }
  // Anders als die Tabelle darf das Feld LEER sein: leer heisst Automatik.
  return Array.isArray(v) && v.length > 0 ? coerceSpalten(v) : []
}

export interface NachschlagenArgs {
  el: HTMLElement
  quelleId: string
  speicherFeld: string
  speicherTitel: string

  spalten: readonly Spalte[]
  titel: string

  breite: number
  hoehe: number
  onUebernehmen: (anzeige: string, wert: string, satz: unknown) => void
}

export interface Eintrag {
  anzeige: string
  wert: string

  satz: unknown
}

export interface NachschlagEinstellung {
  el: HTMLElement
  quelleId: string
  speicherFeld: string

  spalten: readonly Spalte[]
}

// Was im FELD steht, ist die erste Spalte des Fensters. Ohne eigene
// Spalten zeigt das Fenster nur „Gespeichert wird" — dann ist der
// gespeicherte Wert selbst die Anzeige.
export function anzeigeFeldVon(spalten: readonly Spalte[], speicherFeld: string): string {
  const erste = spalten[0]
  return erste === undefined ? speicherFeld : erste.feld
}

export function nurEineSpalte(anzeigeFeld: string, speicherFeld: string): boolean {
  const anzeige = anzeigeFeld.trim()
  return anzeige === '' || anzeige === speicherFeld.trim()
}

export function nachschlagEintraege(
  rows: readonly unknown[],
  anzeigeFeld: string,
  speicherFeld: string,
): Eintrag[] {
  const anzeigeCode = anzeigeFeld.trim()
  const eintraege: Eintrag[] = []
  const einspaltig = nurEineSpalte(anzeigeFeld, speicherFeld)
  const gesehen = new Set<string>()
  for (const row of rows) {
    const wert = getField(row, speicherFeld).trim()
    const anzeige = anzeigeCode === '' ? wert : getField(row, anzeigeCode).trim()
    if (anzeige === '' && wert === '') continue
    if (einspaltig) {
      if (gesehen.has(wert)) continue
      gesehen.add(wert)
    }
    eintraege.push({ anzeige, wert, satz: row })
  }
  return eintraege
}

export function fensterEintraege(
  el: HTMLElement,
  rows: unknown[],
  anzeigeFeld: string,
  speicherFeld: string,
): Eintrag[] {
  return nachschlagEintraege(zeilenNachAuswahl(el, rows).rows, anzeigeFeld, speicherFeld)
}

export type EintraegeErgebnis =
  | { ok: true; eintraege: Eintrag[] }
  | { ok: false; grund: 'unvollstaendig' | 'quelleFehlt' }

export function holeEintraege(e: NachschlagEinstellung): EintraegeErgebnis {
  if (e.quelleId === '' || e.speicherFeld === '') {
    return { ok: false, grund: 'unvollstaendig' }
  }
  const quelle = findRuntimeDataSource(seGlobal().FF_DATA_SOURCES, e.quelleId)
  if (!quelle) return { ok: false, grund: 'quelleFehlt' }
  const rows = rowsFor(seGlobal().SEDATA, quelle.name, quelle.tableId)
  const anzeigeFeld = anzeigeFeldVon(coerceNachschlagSpalten([...e.spalten]), e.speicherFeld)
  return { ok: true, eintraege: fensterEintraege(e.el, rows, anzeigeFeld, e.speicherFeld) }
}

export function einzigenTrefferFinden(
  eintraege: readonly Eintrag[],
  feldLeer: boolean,
): Eintrag | null {
  return feldLeer && eintraege.length === 1 ? eintraege[0] : null
}

export function satzPasstZurAuswahl(el: HTMLElement, satz: unknown): boolean {
  const { rows, gefiltert } = zeilenNachAuswahl(el, [satz])
  return !gefiltert || rows.length > 0
}

export type VerlassenFolge = 'nichts' | 'leeren' | 'zurueck'

export function folgeBeimVerlassen(

  getippt: string,

  bestaetigteAnzeige: string,
  bestaetigterWert: string,
): VerlassenFolge {
  if (getippt === '') {
    return bestaetigteAnzeige === '' && bestaetigterWert === '' ? 'nichts' : 'leeren'
  }
  return getippt === bestaetigteAnzeige ? 'nichts' : 'zurueck'
}

let offen: DialogRahmen | null = null
let offenFuer: HTMLElement | null = null
let rueckFokus: HTMLElement | null = null

function lupeVon(el: HTMLElement): HTMLElement | null {
  return el.shadowRoot?.querySelector<HTMLElement>('.lupe') ?? null
}

function schliesse(mitFokus = true): void {
  const ziel = mitFokus ? rueckFokus : null
  rueckFokus = null
  offen?.remove()
  offen = null
  offenFuer = null
  ziel?.focus()
}

// Stirbt das Feld (Maskenabbau), darf sein Fenster nicht als Waise am
// document.body weiterleben — samt keydown-Listener des Dialograhmens.
export function schliesseNachschlagenFuer(el: HTMLElement): void {
  if (offenFuer === el) schliesse(false)
}

type SpaltenQuelle = Pick<NachschlagenArgs, 'speicherFeld' | 'speicherTitel'>

// Die Automatik: EINE Spalte, „Gespeichert wird". feld traegt den Code,
// damit derselbe Stand auch als Startpunkt im Einstell-Fenster dient; die
// Laufzeit-Zellen kommen bei der Automatik trotzdem aus den fertigen
// Eintraegen (anzeige/wert). Wer mehr Spalten will, stellt sie an der Lupe
// ein — die erste davon ist dann, was im Feld steht.
export function automatikSpalten(args: SpaltenQuelle): Spalte[] {
  const titel = args.speicherTitel !== '' ? args.speicherTitel : 'Wert'
  return [{ titel, feld: args.speicherFeld, art: ART_TEXT }]
}

function macheTabelle(args: NachschlagenArgs, eintraege: readonly Eintrag[]): TabelleBlock {
  const tabelle = document.createElement(TabelleBlock.tagName) as TabelleBlock
  const eigene = coerceNachschlagSpalten([...args.spalten])
  const einspaltig = nurEineSpalte(
    anzeigeFeldVon(eigene, args.speicherFeld),
    args.speicherFeld,
  )

  tabelle.besitz = 'provided'
  tabelle.spalten = eigene.length > 0 ? eigene : automatikSpalten(args)
  tabelle.suche = 'ja'
  tabelle.leerText = 'Diese Quelle hat keine Sätze.'
  tabelle.bereitgestellteZeilen = eintraege.map((e) => ({
    rohzeile: e.satz,
    zellen: eigene.length > 0
      ? eigene.map((s) => (s.feld === '' ? '' : getField(e.satz, s.feld)))
      : (einspaltig ? [e.wert] : [e.anzeige, e.wert]),
  }))
  tabelle.toggleAttribute('fuellt', true)

  tabelle.style.setProperty('--se-r-lg', '0px')
  return tabelle
}

export function oeffneNachschlagen(args: NachschlagenArgs): void {
  const ergebnis = holeEintraege(args)
  if (!ergebnis.ok) {
    meldeFehler(ergebnis.grund === 'unvollstaendig'
      ? 'Nachschlagen braucht an diesem Feld eine Quelle und „Gespeichert wird".'
      : 'Die Nachschlage-Quelle dieses Feldes ist in der Maske nicht vorhanden.')
    return
  }
  const eintraege = ergebnis.eintraege

  schliesse(false)

  const dialog = document.createElement(DIALOG_RAHMEN_TAG) as DialogRahmen
  dialog.setAttribute('data-ff-nachschlagen', '')
  dialog.viewport = true
  dialog.escapeSchliesst = true

  dialog.ohneModal = true

  dialog.inhaltFest = true
  dialog.titel = args.titel !== '' ? args.titel : 'Nachschlagen'
  dialog.breite = args.breite
  dialog.hoehe = args.hoehe
  dialog.addEventListener(DIALOG_SCHLIESSEN_EVENT, () => schliesse())

  dialog.addEventListener('click', (event) => event.stopPropagation())

  const tabelle = macheTabelle(args, eintraege)
  tabelle.addEventListener(ZEILE_AKTIVIERT_EVENT, (event) => {
    const detail = (event as CustomEvent<ZeileAktiviertDetail>).detail
    const eintrag = eintraege[detail.rohIndex]
    if (!eintrag) return
    schliesse()
    args.onUebernehmen(eintrag.anzeige, eintrag.wert, eintrag.satz)
  })

  dialog.appendChild(tabelle)
  rueckFokus = lupeVon(args.el)
  document.body.appendChild(dialog)
  offen = dialog
  offenFuer = args.el

  void Promise.all([dialog.updateComplete, tabelle.updateComplete]).then(() => {
    if (dialog.isConnected) tabelle.fokussiereSuche()
  })
}

export interface SpaltenStellenArgs {
  titel: string

  spalten: readonly Spalte[]

  breite: number
  hoehe: number

  onAendern: (spalten: Spalte[]) => void

  onGroesse: (detail: DialogGroesseDetail) => void

  onFeldWahl: (detail: { index: number; top: number; left: number; liste?: Spalte[] }) => void
  onSchliessen: () => void
}

// Editor-Weg der Lupe: dasselbe Fenster wie zur Laufzeit, aber die Tabelle
// laeuft im Editor-Modus (Striche statt Daten, Regel 7) und traegt ihre
// eigene Spalten-Bedienung: +/- oben rechts, Doppelklick = umbenennen,
// Klick auf den Titel = Feld waehlen. Lebt im Shadow-DOM des Feldes, damit
// die Aenderungen als normale Ereignisse beim Editor ankommen (Undo).
export function spaltenStellenTpl(args: SpaltenStellenArgs): TemplateResult {
  const stop = (e: Event): void => e.stopPropagation()
  return html`<ff-dialog-rahmen
    viewport
    escape-schliesst
    ohne-modal
    inhalt-fest
    ziehbar
    style="z-index:40"
    .titel=${args.titel !== '' ? args.titel : 'Nachschlagen'}
    .breite=${args.breite}
    .hoehe=${args.hoehe}
    @ff-dialog-groesse=${(e: Event) => {
      e.stopPropagation()
      args.onGroesse((e as CustomEvent<DialogGroesseDetail>).detail)
    }}
    @ff-dialog-schliessen=${(e: Event) => {
      e.stopPropagation()
      args.onSchliessen()
    }}
    @click=${stop}
    @pointerdown=${stop}
    @dblclick=${stop}
  >
    <ff-tabelle
      data-ff-editor
      fuellt
      suche="ja"
      style="--se-r-lg:0px"
      .spalten=${[...args.spalten]}
      .editable=${true}
      @ff-prop-change=${(e: Event) => {
        e.stopPropagation()
        const detail = (e as CustomEvent<{ attr?: string; value?: unknown }>).detail
        if (detail?.attr !== 'spalten') return
        args.onAendern(coerceSpalten(detail.value))
      }}
      @ff-listen-bind=${(e: Event) => {
        e.stopPropagation()
        const d = (e as CustomEvent<{
          index?: number
          top?: number
          left?: number
          liste?: Spalte[]
        }>).detail
        if (typeof d?.index !== 'number') return
        args.onFeldWahl({
          index: d.index,
          top: d.top ?? 0,
          left: d.left ?? 0,
          ...(Array.isArray(d.liste) ? { liste: d.liste } : {}),
        })
      }}
    ></ff-tabelle>
  </ff-dialog-rahmen>`
}
