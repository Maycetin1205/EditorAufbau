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

import { html, nothing, type TemplateResult } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { leerZustand } from '../shared/leerZustand'
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
  // Die WERTE der Zusatzfelder, an datenzeilen ausgerichtet: je Zeile, je
  // Spalte ein Record Schluessel -> Wert (leer, wo eine Art keine hat oder
  // nichts gebunden ist). Nur „Bild + Name" liest daraus (./spaltenArten).
  zusatzzeilen: readonly Record<string, string>[][]
  // Wie viele GANZE Zeilentakte das Lineal unter den Zeilen zeichnet
  // (./seitengroesse, linealTakte). 0 = gar keins, null = nicht messbar.
  linealTakte: number | null
  // Kommen echte Daten? Entscheidet, ob eine Zeile anklickbar ist.
  hatQuelle: boolean
  auswahlIndex: number
  // Liefert die gebundene Quelle KEINE Zeile? Dann traegt der Rumpf den
  // Leerzustand (shared/leerZustand) statt Zeilen und Lineal. Der Baustein
  // entscheidet das, nicht diese Datei.
  leer: boolean
  leerText: string
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

// Das Lineal traegt DASSELBE Raster wie Kopf und Zeilen und zieht seine
// senkrechten Striche mit echten Zellen. Bis 2026-08-06 malte es sie als
// Verlauf im Takt `100% / Spaltenzahl` — das stimmte nur, solange alle Spalten
// gleich breit waren. Mit den festen Massen (Zahl 90, Datum 100, Status 120)
// waeren die Striche aus der Flucht gelaufen; so kann sich das Lineal gar
// nicht mehr verrechnen.
//
// Seine HOEHE ist seit 2026-08-10 keine Restgroesse mehr, sondern eine feste
// Zahl ganzer Takte (./seitengroesse, linealTakte). Vorher nahm es mit
// `flex: 1 1 auto` auch den angebrochenen Rest-Takt auf und malte seine
// Spaltentrenner hinein — das las sich als leere, teils duennere letzte Zeile.
// Jetzt bleibt dieser Rest unbemalt: keine Trenner, keine Linien, nur die
// Panel-Flaeche der Tabelle.
//
// `flex: 0 1 auto` statt `none`: wachsen darf das Lineal nicht mehr (genau das
// war der Fehler), schrumpfen schon — sonst koennte ein zu flacher Rumpf durch
// das Lineal eine Scrollleiste bekommen, die er vorher nie hatte.
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
        ${/* Der KOPF bleibt im Leerzustand stehen (oben, ausserhalb dieser
              Weiche): die Spaltentitel sind Aufbau, keine Daten — eine Tabelle
              ohne Ueberschriften waere nicht mehr als Tabelle zu erkennen.
              Weg sind nur Zeilen UND Lineal: das Lineal zeichnet leere
              Zeilenlinien weiter, und unter einer Meldung „keine Eintraege"
              saehe genau das nach Daten aus, die noch laden. */ ''}
        ${lage.leer ? leerZustand(lage.leerText, true) : html`
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
              // Im Editor (Platzhalter-Zeile) gibt es keine Zusatzwerte: die
              // Bild-Stelle bleibt dort leer statt eine Flaeche zu zeigen, die
              // nichts enthaelt (Nutzer-Ansage 2026-08-06).
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
