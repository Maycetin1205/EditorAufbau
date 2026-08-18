import { html, nothing, render, type TemplateResult } from 'lit'
import type { ListenBindung } from '../../core/blocks/listenBindung'
import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, getField, rowsFor } from '../../softengine/data'
import { meldeFehler } from '../../softengine/meldung'
import { zeilenNachAuswahl } from '../shared/auswahl'
import { lupeZeichen } from '../shared/lupeZeichen'
import {
  DIALOG_RAHMEN_TAG,
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

// Das Startmass des Nachschlage-Fensters. Geteilt, weil die Erfassungszeile
// der Tabelle dasselbe Fenster oeffnet und zwei getrennte Zahlen sofort
// auseinanderliefen.
export const FENSTER_BREITE = 520
export const FENSTER_HOEHE = 380

export function nachschlagFeldTpl(args: {
  wert: string
  onTippen: (wert: string) => void
  onTaste: (e: KeyboardEvent) => void
  onVerlassen: () => void
  onLupe: () => void

  // Die Vorschlagsliste (G1) haengt im selben Halter wie die Lupe: sie
  // steht unter dem Feld und deckt zu, was darunter liegt.
  liste: TemplateResult | typeof nothing
}): TemplateResult {
  return html`<div class="nachschlag">
    <input
      class="ctrl"
      type="text"
      .value=${args.wert}
      @input=${(e: Event) => args.onTippen((e.target as HTMLInputElement).value)}
      @keydown=${args.onTaste}
      @blur=${() => args.onVerlassen()}
    />
    <button
      class="lupe"
      type="button"
      aria-label="Nachschlagen"
      title="Nachschlagen"
      @click=${() => args.onLupe()}
    >${lupeZeichen()}</button>
    ${args.liste}
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

  // Gesetzt: der Aufrufer hat seine Eintraege schon (Erfassungszeile) — dann
  // zeigt das Fenster GENAU dieselben Saetze wie die Vorschlagsliste daneben.
  eintraege?: readonly Eintrag[]

  // Wohin der Fokus nach dem Schliessen zurueckgeht. Ohne Angabe die erste
  // Lupe des Bausteins; die Erfassungszeile hat mehrere und nennt ihre.
  rueckFokus?: HTMLElement | null
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

// Die Saetze EINER Bibliotheks-Quelle zur Laufzeit, ungefiltert. Getrennt von
// holeEintraege, weil die Erfassungszeile der Tabelle dieselben Saetze braucht,
// aber NICHT die Auswahl-Folgen ihres Bausteins: die gehoeren dort zur Quelle
// der Tabelle, nicht zur Nachschlage-Quelle, und wuerden mit deren Feldcodes
// jeden Nachschlage-Satz wegfiltern.
export function quellenZeilen(quelleId: string): unknown[] | null {
  const quelle = findRuntimeDataSource(seGlobal().FF_DATA_SOURCES, quelleId)
  if (!quelle) return null
  return rowsFor(seGlobal().SEDATA, quelle.name, quelle.tableId)
}

export function holeEintraege(e: NachschlagEinstellung): EintraegeErgebnis {
  if (e.quelleId === '' || e.speicherFeld === '') {
    return { ok: false, grund: 'unvollstaendig' }
  }
  const rows = quellenZeilen(e.quelleId)
  if (rows === null) return { ok: false, grund: 'quelleFehlt' }
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

// `offen` ist der Lit-Halter am document.body, in den das Laufzeit-Fenster
// gerendert wird — ihn entfernen raeumt Fenster samt Listenern ab.
let offen: HTMLElement | null = null
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

interface FensterArgs {
  titel: string

  breite: number
  hoehe: number

  inhalt: TemplateResult
  onSchliessen: () => void

  // Gesetzt = Editor-Weg (Spalten stellen): das Fenster ist ziehbar
  // (Groesse am Ding, gemeldet ueber onGroesse) und liegt mit z-index 40
  // UNTER den Editor-Overlays (der Rahmen-Standard ist das Viewport-
  // Maximum); pointerdown/dblclick bleiben im Fenster, damit Klicks den
  // Baustein nicht ziehen oder waehlen (Ausnahme der Zug-Regel, s.
  // rasterMove). Ohne `editor` traegt das Fenster den Laufzeit-Marker
  // data-ff-nachschlagen.
  editor?: { onGroesse: (detail: DialogGroesseDetail) => void }
}

// Das EINE Nachschlage-Fenster: Editor-Lupe (Spalten stellen) und
// Laufzeit-Lupe (Saetze waehlen) bauen hier dasselbe Geruest — die zwei
// Wege unterscheiden sich nur im Tabellen-Inhalt und in den benannten
// `editor`-Extras oben, nicht in zwei Kopien.
function fensterTpl(args: FensterArgs): TemplateResult {
  const stop = (e: Event): void => e.stopPropagation()
  const editor = args.editor
  return html`<ff-dialog-rahmen
    viewport
    escape-schliesst
    ohne-modal
    inhalt-fest
    ?ziehbar=${editor !== undefined}
    ?data-ff-nachschlagen=${editor === undefined}
    style=${editor !== undefined ? 'z-index:40' : nothing}
    .titel=${args.titel !== '' ? args.titel : 'Nachschlagen'}
    .breite=${args.breite}
    .hoehe=${args.hoehe}
    @ff-dialog-groesse=${editor === undefined ? nothing : (e: Event) => {
      e.stopPropagation()
      editor.onGroesse((e as CustomEvent<DialogGroesseDetail>).detail)
    }}
    @ff-dialog-schliessen=${(e: Event) => {
      if (editor !== undefined) e.stopPropagation()
      args.onSchliessen()
    }}
    @click=${stop}
    @pointerdown=${editor === undefined ? nothing : stop}
    @dblclick=${editor === undefined ? nothing : stop}
  >${args.inhalt}</ff-dialog-rahmen>`
}

function laufzeitTabelleTpl(args: NachschlagenArgs, eintraege: readonly Eintrag[]): TemplateResult {
  const eigene = coerceNachschlagSpalten([...args.spalten])
  const einspaltig = nurEineSpalte(
    anzeigeFeldVon(eigene, args.speicherFeld),
    args.speicherFeld,
  )
  return html`<ff-tabelle
    fuellt
    suche="ja"
    style="--se-r-lg:0px"
    .besitz=${'provided'}
    .spalten=${eigene.length > 0 ? eigene : automatikSpalten(args)}
    .leerText=${'Diese Quelle hat keine Sätze.'}
    .bereitgestellteZeilen=${eintraege.map((e) => ({
      rohzeile: e.satz,
      zellen: eigene.length > 0
        ? eigene.map((s) => (s.feld === '' ? '' : getField(e.satz, s.feld)))
        : (einspaltig ? [e.wert] : [e.anzeige, e.wert]),
    }))}
  ></ff-tabelle>`
}

export function oeffneNachschlagen(args: NachschlagenArgs): void {
  let eintraege = args.eintraege
  if (eintraege === undefined) {
    const ergebnis = holeEintraege(args)
    if (!ergebnis.ok) {
      meldeFehler(ergebnis.grund === 'unvollstaendig'
        ? 'Nachschlagen braucht an diesem Feld eine Quelle und „Gespeichert wird".'
        : 'Die Nachschlage-Quelle dieses Feldes ist in der Maske nicht vorhanden.')
      return
    }
    eintraege = ergebnis.eintraege
  }

  schliesse(false)

  // Der Halter ist layout-neutral (display:contents); das Fenster darin
  // steht ohnehin fix im Viewport.
  const halter = document.createElement('div')
  halter.style.display = 'contents'
  render(fensterTpl({
    titel: args.titel,
    breite: args.breite,
    hoehe: args.hoehe,
    inhalt: laufzeitTabelleTpl(args, eintraege),
    onSchliessen: () => schliesse(),
  }), halter)

  const dialog = halter.querySelector<DialogRahmen>(DIALOG_RAHMEN_TAG)
  const tabelle = halter.querySelector<TabelleBlock>(TabelleBlock.tagName)
  tabelle?.addEventListener(ZEILE_AKTIVIERT_EVENT, (event) => {
    const detail = (event as CustomEvent<ZeileAktiviertDetail>).detail
    const eintrag = eintraege[detail.rohIndex]
    if (!eintrag) return
    schliesse()
    args.onUebernehmen(eintrag.anzeige, eintrag.wert, eintrag.satz)
  })

  rueckFokus = args.rueckFokus ?? lupeVon(args.el)
  document.body.appendChild(halter)
  offen = halter
  offenFuer = args.el

  if (dialog && tabelle) {
    void Promise.all([dialog.updateComplete, tabelle.updateComplete]).then(() => {
      if (dialog.isConnected) tabelle.fokussiereSuche()
    })
  }
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

// Editor-Weg der Lupe: dasselbe Fenster wie zur Laufzeit (fensterTpl),
// aber die Tabelle laeuft im Editor-Modus (Striche statt Daten, Regel 7)
// und traegt ihre eigene Spalten-Bedienung: +/- oben rechts, Doppelklick
// = umbenennen, Klick auf den Titel = Feld waehlen. Lebt im Shadow-DOM
// des Feldes, damit die Aenderungen als normale Ereignisse beim Editor
// ankommen (Undo).
export function spaltenStellenTpl(args: SpaltenStellenArgs): TemplateResult {
  return fensterTpl({
    titel: args.titel,
    breite: args.breite,
    hoehe: args.hoehe,
    onSchliessen: args.onSchliessen,
    editor: { onGroesse: args.onGroesse },
    inhalt: html`<ff-tabelle
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
    ></ff-tabelle>`,
  })
}
