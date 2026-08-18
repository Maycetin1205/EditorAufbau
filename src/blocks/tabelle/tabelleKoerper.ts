import { html, nothing, type TemplateResult } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { leerZustand } from '../shared/leerZustand'
import { ZELLE_PLATZHALTER, type Spalte } from './spalten'
import { spaltenArt } from './spaltenArten'

export interface KoerperLage {
  spalten: readonly Spalte[]

  cols: Readonly<Record<string, string>>

  editable: boolean

  imEditor: boolean

  // Schalter „Kopfzeile": aus = keine Titelzeile (Editor UND Maske). Die
  // Kopf-Griffe (Feld-Picker, Umbenennen) wandern im Editor auf die Zellen;
  // Sortieren per Titelklick entfaellt an der Maske.
  zeigeKopf: boolean

  auswahlSemantik: boolean
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

  // Erfasste, noch nicht geschriebene Zeilen (G4): sie stehen zwischen der
  // letzten Datenzeile und der Erfassungszeile, links markiert — erst der
  // Ketten-Lauf des Knopfs macht aus ihnen echte Positionen.
  erfasste: readonly (readonly string[])[]

  // Die fertige Erfassungszeile. Der Rumpf kennt ihre Rollen nicht — er
  // setzt sie nur an die richtige Stelle: sie ist die naechste FREIE Zeile,
  // also direkt unter der letzten DATENzeile und vor allem, was nur fuellt.
  // Ohne echte Daten (Editor, leere Quelle) ist das Zeile 1 ganz oben —
  // nicht unten hinter den Platzhalter-Strichen.
  erfassung: TemplateResult | typeof nothing
}

export interface KoerperHandeln {
  setzeSuchtext: (text: string) => void

  dblklickKopf: (e: MouseEvent, index: number) => void
  klickKopf: (e: MouseEvent, index: number) => void

  aktiviereZeile: (rohIndex: number | null, ansichtIndex: number) => void
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
  return html`<div class="lineal" role="presentation" style=${styleMap(stil)}>
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
          @input=${(e: Event) => tun.setzeSuchtext((e.target as HTMLInputElement).value)}
        />
      </div>` : ''}
      <div class="koerper" role=${lage.leer ? nothing : 'table'} tabindex="-1">
      ${lage.zeigeKopf ? html`<div class="kopf" role="row" style=${styleMap(lage.cols)}>
        ${lage.spalten.map(
          (s, i) => html`<div
            class=${spaltenArt(s.art).klasse}
            role="columnheader"
            data-ff-editable
            @dblclick=${(e: MouseEvent) => tun.dblklickKopf(e, i)}
            @click=${(e: MouseEvent) => tun.klickKopf(e, i)}
          >${s.titel}${!lage.editable && lage.sortSpalte === i
            ? html`<span class="sort-pfeil">${lage.sortAuf ? ' ▲' : ' ▼'}</span>`
            : ''}</div>`,
        )}
      </div>` : nothing}
        ${ ''}
        ${lage.leer ? leerZustand(lage.leerText, true) : html`
        ${lage.hatQuelle ? nothing : lage.erfassung}
        ${lage.zeilen.map((rohIndex, ansichtIndex) => {
          const aktivierbar = rohIndex !== null && !lage.imEditor
          return html`<div
            class="zeile${rohIndex !== null && lage.hatQuelle ? ' waehlbar' : ''}${
              rohIndex !== null && rohIndex === lage.auswahlIndex ? ' gewaehlt' : ''}"
            role="row"
            data-ff-roh=${rohIndex ?? nothing}
            tabindex=${aktivierbar ? '0' : nothing}
            aria-selected=${lage.auswahlSemantik && rohIndex !== null
              ? String(rohIndex === lage.auswahlIndex)
              : nothing}
            style=${styleMap(lage.cols)}
            @click=${() => tun.aktiviereZeile(rohIndex, ansichtIndex)}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key !== 'Enter') return
              e.preventDefault()
              tun.aktiviereZeile(rohIndex, ansichtIndex)
            }}
          >
            ${ ''}
            ${lage.spalten.map((s, i) => {
              const art = spaltenArt(s.art)
              const wert = rohIndex !== null
                ? (lage.datenzeilen[rohIndex]?.[i] ?? '')
                : ZELLE_PLATZHALTER

              const zusatz = rohIndex !== null
                ? (lage.zusatzzeilen[rohIndex]?.[i] ?? {})
                : {}
              // Ohne Kopfzeile uebernimmt die Zelle im Editor den Kopf-Griff:
              // Klick oeffnet den Feld-Picker der Spalte. Umbenennen laeuft
              // ueber das kurze Einschalten der Kopfzeile (Inspector).
              const kopfGriff = lage.imEditor && !lage.zeigeKopf && lage.editable
              return html`<div
                class=${art.klasse}
                role="cell"
                data-ff-editable=${kopfGriff ? '' : nothing}
                @click=${kopfGriff ? (e: MouseEvent) => tun.klickKopf(e, i) : nothing}
              >${
                art.zelle(wert, s.zuordnung ?? [], zusatz)
              }</div>`
            })}
          </div>`
        })}
        ${lage.erfasste.map((werte) => html`<div class="zeile erfasst" role="row" style=${styleMap(lage.cols)}>
          ${lage.spalten.map((s, i) => {
            const art = spaltenArt(s.art)
            return html`<div class=${art.klasse} role="cell">${
              art.zelle(werte[i] ?? '', s.zuordnung ?? [], {})
            }</div>`
          })}
        </div>`)}
        ${lage.hatQuelle ? lage.erfassung : nothing}
        ${lineal(lage)}`}
      </div>
    `
}
