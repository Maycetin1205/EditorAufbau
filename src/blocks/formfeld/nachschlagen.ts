import { html, type TemplateResult } from 'lit'
import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, getField, rowsFor } from '../../softengine/data'
import { meldeFehler } from '../../softengine/meldung'
import { zeilenNachAuswahl } from '../shared/auswahl'
import {
  DIALOG_RAHMEN_TAG,
  DIALOG_SCHLIESSEN_EVENT,
  type DialogRahmen,
} from '../shared/DialogRahmen'
import { ART_TEXT } from '../tabelle/spaltenArten'
import type { Spalte } from '../tabelle/spalten'
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
      @click=${() => args.onLupe()}
    ><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"></circle>
      <line x1="10.4" y1="10.4" x2="14" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>
    </svg></button>
  </div>`
}

export interface NachschlagenArgs {
  el: HTMLElement
  quelleId: string
  anzeigeFeld: string
  speicherFeld: string
  anzeigeTitel: string
  speicherTitel: string
  titel: string
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
  anzeigeFeld: string
  speicherFeld: string
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
  return { ok: true, eintraege: fensterEintraege(e.el, rows, e.anzeigeFeld, e.speicherFeld) }
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
let rueckFokus: HTMLElement | null = null

function lupeVon(el: HTMLElement): HTMLElement | null {
  return el.shadowRoot?.querySelector<HTMLElement>('.lupe') ?? null
}

function schliesse(mitFokus = true): void {
  const ziel = mitFokus ? rueckFokus : null
  rueckFokus = null
  offen?.remove()
  offen = null
  ziel?.focus()
}

function spaltenFuer(args: NachschlagenArgs): Spalte[] {
  const wertTitel = args.speicherTitel !== ''
    ? args.speicherTitel
    : (args.anzeigeTitel !== '' ? args.anzeigeTitel : 'Wert')
  const wertSpalte: Spalte = { titel: wertTitel, feld: '', art: ART_TEXT }
  if (nurEineSpalte(args.anzeigeFeld, args.speicherFeld)) return [wertSpalte]
  return [
    { titel: args.anzeigeTitel !== '' ? args.anzeigeTitel : 'Angezeigt', feld: '', art: ART_TEXT },
    wertSpalte,
  ]
}

function macheTabelle(args: NachschlagenArgs, eintraege: readonly Eintrag[]): TabelleBlock {
  const tabelle = document.createElement(TabelleBlock.tagName) as TabelleBlock
  const einspaltig = nurEineSpalte(args.anzeigeFeld, args.speicherFeld)

  tabelle.besitz = 'provided'
  tabelle.spalten = spaltenFuer(args)
  tabelle.suche = 'ja'
  tabelle.leerText = 'Diese Quelle hat keine Sätze.'
  tabelle.bereitgestellteZeilen = eintraege.map((e) => ({
    rohzeile: e.satz,
    zellen: einspaltig ? [e.wert] : [e.anzeige, e.wert],
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
  dialog.breite = 520
  dialog.hoehe = 380
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

  void Promise.all([dialog.updateComplete, tabelle.updateComplete]).then(() => {
    if (dialog.isConnected) tabelle.fokussiereSuche()
  })
}
