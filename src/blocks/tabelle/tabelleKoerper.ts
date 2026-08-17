import { html, nothing, type TemplateResult } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { leerZustand } from '../shared/leerZustand'
import type { Spalte } from './spalten'
import { spaltenArt } from './spaltenArten'

const PLATZHALTER = '—'

export interface KoerperLage {
  spalten: readonly Spalte[]

  cols: Readonly<Record<string, string>>

  editable: boolean
  zeigeSuche: boolean
  suchtext: string

  sortSpalte: number
  sortAuf: boolean

  zeilen: readonly (number | null)[]
  datenzeilen: readonly string[][]

  zusatzzeilen: readonly Record<string, string>[][]

  linealTakte: number | null

  hatQuelle: boolean
  auswahlIndex: number

  leer: boolean
  leerText: string
}

export interface KoerperHandeln {
  setzeSuchtext: (text: string) => void

  dblklickKopf: (e: MouseEvent, index: number) => void
  klickKopf: (e: MouseEvent, index: number) => void
  klickZeile: (rohIndex: number | null) => void

  stop: (e: Event) => void
}

function lineal(lage: KoerperLage): TemplateResult | typeof nothing {
  if (lage.linealTakte === 0) return nothing
  const stil = lage.linealTakte === null
    ? lage.cols
    : {
        ...lage.cols,
        flex: '0 1 auto',
        height: `calc(var(--zeilen-hoehe) * ${lage.linealTakte})`,
      }
  return html`<div class="lineal" style=${styleMap(stil)}>
          ${lage.spalten.map(() => html`<div></div>`)}
        </div>`
}

export function tabelleKoerper(lage: KoerperLage, tun: KoerperHandeln): TemplateResult {
  return html`
      ${lage.zeigeSuche ? html`<div class="suchzeile">
        <input
          type="search"
          placeholder="Tabelle durchsuchen…"
          aria-label="Tabelle durchsuchen"
          .value=${lage.suchtext}
          @pointerdown=${tun.stop}
          @input=${(e: Event) => tun.setzeSuchtext((e.target as HTMLInputElement).value)}
        />
      </div>` : ''}
      <div class="koerper">
      <div class="kopf" style=${styleMap(lage.cols)}>
        ${lage.spalten.map(
          (s, i) => html`<div
            class=${spaltenArt(s.art).klasse}
            data-ff-editable
            @dblclick=${(e: MouseEvent) => tun.dblklickKopf(e, i)}
            @click=${(e: MouseEvent) => tun.klickKopf(e, i)}
          >${s.titel}${!lage.editable && lage.sortSpalte === i
            ? html`<span class="sort-pfeil">${lage.sortAuf ? ' ▲' : ' ▼'}</span>`
            : ''}</div>`,
        )}
      </div>
        ${ ''}
        ${lage.leer ? leerZustand(lage.leerText, true) : html`
        ${lage.zeilen.map(
          (rohIndex) => html`<div
            class="zeile${rohIndex !== null && lage.hatQuelle ? ' waehlbar' : ''}${
              rohIndex !== null && rohIndex === lage.auswahlIndex ? ' gewaehlt' : ''}"
            style=${styleMap(lage.cols)}
            @click=${() => tun.klickZeile(rohIndex)}
          >
            ${ ''}
            ${lage.spalten.map((s, i) => {
              const art = spaltenArt(s.art)
              const wert = rohIndex !== null
                ? (lage.datenzeilen[rohIndex]?.[i] ?? '')
                : PLATZHALTER

              const zusatz = rohIndex !== null
                ? (lage.zusatzzeilen[rohIndex]?.[i] ?? {})
                : {}
              return html`<div class=${art.klasse}>${
                art.zelle(wert, s.zuordnung ?? [], zusatz)
              }</div>`
            })}
          </div>`,
        )}
        ${lineal(lage)}`}
      </div>
    `
}
