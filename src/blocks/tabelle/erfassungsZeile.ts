import { html, nothing, type TemplateResult } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { lupeZeichen } from '../shared/lupeZeichen'
import { vorschlagListeTpl, type Vorschlag } from '../shared/vorschlagListe'
import { spaltenArt } from './spaltenArten'
import {
  ROLLE_FOLGT,
  ROLLE_FREI,
  ROLLE_NACHSCHLAGEN,
  rolleVon,
} from './erfassungsRollen'
import { ZELLE_PLATZHALTER, type Spalte } from './spalten'

// Die naechste freie Zeile der Tabelle. Sie ist eine FAEHIGKEIT der Tabelle
// und kein eigener Baustein: ohne den Schalter gibt es sie nicht, und eine
// Tabelle ohne sie exportiert wie zuvor.

export interface ErfassungsLage {
  spalten: readonly Spalte[]

  cols: Readonly<Record<string, string>>

  imEditor: boolean

  // Was in der Zelle steht (Laufzeit).
  wert: (index: number) => string

  // Die offene Vorschlagsliste gehoert zu GENAU EINER Zelle.
  tippSpalte: number
  vorschlaege: readonly Vorschlag[]
  marke: number

  // Nach OBEN aufklappen. Der Rumpf schneidet ab, was aus ihm herausragt:
  // steht die Zeile ganz unten, waere eine Liste nach unten unerreichbar.
  // Ist unter ihr noch Platz (leere Tabelle → Zeile 1 ganz oben), klappt sie
  // nach unten — dorthin waechst auch der Rollbereich des Rumpfes mit.
  listeNachOben: boolean
}

export interface ErfassungsHandeln {
  // Editor: Klick stellt die Rolle, Doppelklick tippt die Vorbelegung.
  klickZelle: (e: MouseEvent, index: number) => void
  dblklickZelle: (e: MouseEvent, index: number) => void

  tippen: (index: number, text: string) => void
  taste: (index: number, e: KeyboardEvent) => void
  verlassen: (index: number) => void
  lupe: (index: number, e: MouseEvent) => void

  waehleVorschlag: (listenIndex: number) => void
  setzeMarke: (listenIndex: number) => void
}

function editorZelle(spalte: Spalte, rolle: string): TemplateResult | string {
  if (rolle === ROLLE_NACHSCHLAGEN) {
    // Keine neue Symbolsprache: die Nachschlage-Zelle traegt die Lupe, die es
    // am Formularfeld schon gibt. Sonst Striche — der Editor erfindet nie
    // Daten (Regel 7).
    return html`<span class="erf-strich">${ZELLE_PLATZHALTER}</span><span class="erf-lupe-zeichen">${
      lupeZeichen()
    }</span>`
  }
  if (rolle === ROLLE_FREI) {
    const vorbelegt = spalte.vorbelegung ?? ''
    return vorbelegt !== '' ? vorbelegt : ZELLE_PLATZHALTER
  }
  return ZELLE_PLATZHALTER
}

function eingabe(
  lage: ErfassungsLage,
  tun: ErfassungsHandeln,
  index: number,
): TemplateResult {
  return html`<input
    class="erf-eingabe"
    type="text"
    .value=${lage.wert(index)}
    @input=${(e: Event) => tun.tippen(index, (e.target as HTMLInputElement).value)}
    @keydown=${(e: KeyboardEvent) => tun.taste(index, e)}
    @blur=${() => tun.verlassen(index)}
  />`
}

function laufzeitZelle(
  lage: ErfassungsLage,
  tun: ErfassungsHandeln,
  index: number,
  rolle: string,
): TemplateResult | string {
  if (rolle === ROLLE_FOLGT) return lage.wert(index)
  if (rolle === ROLLE_FREI) return eingabe(lage, tun, index)
  const liste = lage.tippSpalte === index && lage.vorschlaege.length > 0
  return html`<div class=${lage.listeNachOben ? 'erf-nachschlag nach-oben' : 'erf-nachschlag'}>
    ${eingabe(lage, tun, index)}
    <button
      class="lupe"
      type="button"
      aria-label="Nachschlagen"
      title="Nachschlagen"
      @click=${(e: MouseEvent) => tun.lupe(index, e)}
    >${lupeZeichen()}</button>
    ${liste ? vorschlagListeTpl({
      eintraege: lage.vorschlaege,
      marke: lage.marke,
      onWaehlen: (i) => tun.waehleVorschlag(i),
      onMarke: (i) => tun.setzeMarke(i),
    }) : nothing}
  </div>`
}

export function erfassungsZeileTpl(
  lage: ErfassungsLage,
  tun: ErfassungsHandeln,
): TemplateResult {
  return html`<div class="zeile erfassung" role="row" style=${styleMap(lage.cols)}>
    ${lage.spalten.map((spalte, i) => {
      const rolle = rolleVon(spalte)
      const art = spaltenArt(spalte.art)
      const klassen = `${art.klasse} erf-${rolle}`.trim()
      if (!lage.imEditor) {
        return html`<div class=${klassen} role="cell">${
          laufzeitZelle(lage, tun, i, rolle)
        }</div>`
      }
      // data-ff-editable nur an der Frei-Zelle: nur dort tippt der
      // Doppelklick wirklich Text (die Vorbelegung). An den anderen waere der
      // Schreib-Zeiger eine Luege.
      return html`<div
        class=${klassen}
        role="cell"
        ?data-ff-editable=${rolle === ROLLE_FREI}
        @click=${(e: MouseEvent) => tun.klickZelle(e, i)}
        @dblclick=${(e: MouseEvent) => tun.dblklickZelle(e, i)}
      >${editorZelle(spalte, rolle)}</div>`
    })}
  </div>`
}
