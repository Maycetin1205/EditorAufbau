// tabelleKoerper — was zwischen Steuerung und Fusszeile zu sehen ist:
// Suchzeile, Spaltenkopf, Datenzeilen, Lineal.
//
// Aus TabelleBlock herausgeloest (2026-08-06), aus demselben Grund wie
// ./tabelleFuss und mit derselben Form: Zustand rein, Darstellung raus, keine
// eigene Erinnerung. Anlass war nicht der Deckel allein — die Tabelle bekommt
// als Naechstes Spalten-Darstellungen (Zahl/Datum/Status/Bild + Name), und die
// gehoeren hierher, nicht in die Baustein-Datei. Der Baustein behaelt, was ihn
// ausmacht: Eigenschaften, Zustand, Messung, Lebenszyklus.
//
// Die Datei ENTSCHEIDET nichts. Ob echte Daten kommen (hatQuelle), welche
// Zeilen diese Seite zeigt und wie breit die Spalten sind, rechnet der
// Baustein aus (./suche, ./seitengroesse) und reicht es fertig herein.
//
// Aussehen kommt aus ./tabelleStil, das hier sind nur die Klassennamen.

import { html, type TemplateResult } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import type { Spalte } from './spalten'
import { spaltenArt } from './spaltenArten'

// Was im Editor in einer Zelle steht, solange keine Daten kommen: ein Strich.
// Er laeuft durch DIESELBE Darstellung wie ein echter Wert — in einer
// Status-Spalte also als graue Marke mit einem Strich darin. So sieht der
// Bauer die FORM seiner Spalte, ohne dass ein Wert erfunden wird (Regel 7).
const PLATZHALTER = '—'

export interface KoerperLage {
  spalten: readonly Spalte[]
  // Die Rasterbreiten — EINE Rechnung, zwei Leser (Kopf und Zeilen muessen
  // dasselbe Raster tragen, sonst stehen die Werte neben ihrer Ueberschrift).
  cols: Readonly<Record<string, string>>
  // Editor oder Maske? Trennt Feld-Picker/Umbenennen vom Sortieren — dieselbe
  // Marke, an der auch der Baustein die beiden Welten auseinanderhaelt.
  editable: boolean
  zeigeSuche: boolean
  suchtext: string
  // Sortier-Zustand, nur fuer den Pfeil am Kopf (-1 = unsortiert).
  sortSpalte: number
  sortAuf: boolean
  // Die Zeilen DIESER Seite als ROHINDIZES in datenzeilen; null = eine
  // Platzhalter-Zeile im Editor (Regel 7: hier kommt spaeter ein Wert hin).
  zeilen: readonly (number | null)[]
  datenzeilen: readonly string[][]
  // Kommen echte Daten? Entscheidet, ob eine Zeile anklickbar ist.
  hatQuelle: boolean
  auswahlIndex: number
}

export interface KoerperHandeln {
  setzeSuchtext: (text: string) => void
  // Doppelklick am Kopf = Titel umbenennen, Einzelklick = Feld-Picker (Editor)
  // bzw. sortieren (Maske). Welcher davon gilt, entscheidet der Baustein.
  dblklickKopf: (e: MouseEvent, index: number) => void
  klickKopf: (e: MouseEvent, index: number) => void
  klickZeile: (rohIndex: number | null) => void
  // Klicks duerfen den Baustein nicht anfassen (Editor: Auswahl).
  stop: (e: Event) => void
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
        ${lage.zeilen.map(
          (rohIndex) => html`<div
            class="zeile${rohIndex !== null && lage.hatQuelle ? ' waehlbar' : ''}${
              rohIndex !== null && rohIndex === lage.auswahlIndex ? ' gewaehlt' : ''}"
            style=${styleMap(lage.cols)}
            @click=${() => tun.klickZeile(rohIndex)}
          >
            ${/* Ueber die SPALTEN laufen, nicht ueber die Werte: die Art sagt,
                  wie die Zelle aussieht, und eine Datenzeile mit zu wenig
                  Werten (kurze Zeile aus SoftEngine) darf keine Spalte
                  verschlucken — sonst rutschte der Rest nach links unter die
                  falsche Ueberschrift. */ ''}
            ${lage.spalten.map((s, i) => {
              const art = spaltenArt(s.art)
              const wert = rohIndex !== null
                ? (lage.datenzeilen[rohIndex]?.[i] ?? '')
                : PLATZHALTER
              return html`<div class=${art.klasse}>${art.zelle(wert, s.zuordnung ?? [])}</div>`
            })}
          </div>`,
        )}
        ${/* Das Lineal traegt DASSELBE Raster wie Kopf und Zeilen und zieht
              seine senkrechten Striche mit echten Zellen. Bis 2026-08-06 malte
              es sie als Verlauf im Takt `100% / Spaltenzahl` — das stimmte nur,
              solange alle Spalten gleich breit waren. Mit den festen Massen
              (Zahl 90, Datum 100, Status 120) waeren die Striche aus der Flucht
              gelaufen; so kann sich das Lineal gar nicht mehr verrechnen. */ ''}
        <div class="lineal" style=${styleMap(lage.cols)}>
          ${lage.spalten.map(() => html`<div></div>`)}
        </div>
      </div>
    `
}
