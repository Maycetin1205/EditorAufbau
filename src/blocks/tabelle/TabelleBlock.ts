// TabelleBlock
// Tabellen-Baustein (Fahrplan-Punkt 4). EIN Baustein, EIN Rahmen: die Spalten
// stecken INNEN (kein Kind-Baustein je Spalte). Jede Spalte hat einen Titel
// UND ein Feld:
//   - Titel je Spalte per Doppelklick am Kopf umbenennen (Inline-Edit)
//   - „+ Spalte" / „−" oben rechts: hinzufügen / letzte entfernen
//   - feld = Feldcode der Datenquelle (Technikwert, unsichtbar) — welchen Wert
//     die Spalte je Zeile zeigt. Das Setzen kommt in der naechsten Stufe
//     (Feld am Spaltenkopf); bis dahin bleibt feld leer.
// Alles Editor-Sichtbare (Steuerung/Inline-Edit) NUR im Editor (data-ff-editor),
// im Export nie (WYSIWYG). KEIN Spaltenbreite-Ziehen (Nutzer 2026-07-23).
//
// Daten: an die Tabelle laesst sich eine Datenquelle haengen (acceptsDataSource,
// `source`-Prop -> Inspector-Sektion „Daten", Export -> SEFILELOOP). Zur
// Laufzeit fuellt tabelle/seRuntime die echten Zeilen (setzt `datenzeilen`); im
// Editor bleibt es bei Platzhalter-Strichen „—" (Regel 7 — keine erfundenen Daten).
//
// `spalten` reist als JSON in Prop/Attribut: der Editor setzt die DOM-Property
// (useLitElement), der Export schreibt JSON ins Attribut, der Wandler unten liest
// es zurueck. Alte Staende (reine Titel-Strings aus der Erstfassung, oder eine
// Spalten-ZAHL) werden defensiv auf {titel,feld} abgebildet — keine Migration noetig.
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*).

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { ListenBindung } from '../../core/blocks/BlockDefinition'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { connectTable, disconnectTable } from './seRuntime'
import { sortiereZeilen } from './sortierung'
import {
  SPALTEN_MAX,
  SPALTEN_MIN,
  STANDARD_TITEL,
  coerceSpalten,
  standardSpalten,
  tryCoerceSpalten,
  type Spalte,
} from './spalten'

// Das Spalten-Modell wohnt in ./spalten — hier nur die Darstellung.
export { coerceSpalten, type Spalte } from './spalten'

const PLATZHALTER_ZEILEN = 4
const ZEILEN_PRO_SEITE = [10, 25, 50] as const

// Wartezeit, bis ein Einzelklick auf den Spaltenkopf als Einzelklick gilt.
// Darunter waere ein Doppelklick (Umbenennen) nicht mehr sauber abzugrenzen,
// darueber fuehlt sich der Feld-Picker traege an.
const DOPPELKLICK_FENSTER = 220

export class TabelleBlock extends BasicBlock {
  static readonly blockType = 'tabelle'
  static readonly tagName = 'ff-tabelle'
  static readonly displayName = 'Tabelle'
  static readonly category: BlockCategory = 'anzeige'
  // Kap. 5.1: Datenquelle anhaengbar (Inspector-Sektion „Daten"); der Export
  // erzeugt daraus den SEFILELOOP. `source` = Technikwert (Vorlagen-id), leer =
  // keine Quelle (Tabelle bleibt statisch mit Platzhaltern).
  static readonly acceptsDataSource = true
  // Jede SPALTE ist eine bindbare Stelle (Regel 2): der Editor oeffnet den
  // Feld-Picker generisch ueber diesen Eintrag — er kennt die Tabelle nicht.
  static readonly listenBindung: ListenBindung = {
    prop: 'spalten',
    titelKey: 'titel',
    feldKey: 'feld',
    standardTitel: STANDARD_TITEL,
  }
  static readonly defaultProps = {
    width: 'fill',
    source: '',
    spalten: standardSpalten(),
    proSeite: String(ZEILEN_PRO_SEITE[0]),
  }
  // Wie viele Zeilen eine Seite zeigt — bisher fest im Code, jetzt je Maske
  // einstellbar (Regel 2: Faehigkeiten sind Registry-Eintraege). Ohne
  // Datenquelle sinnlos, deshalb requiresDataSource.
  static readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'proSeite',
      name: 'Zeilen pro Seite',
      description: 'Wie viele Datensaetze eine Seite der Tabelle zeigt.',
      kind: 'select',
      options: ZEILEN_PRO_SEITE.map((n) => ({ value: String(n), label: String(n) })),
      requiresDataSource: true,
    },
  ]
  // Raster-Startgröße (Erstwert — im Browser nachzukalibrieren).
  static readonly raster = { startW: 14, startH: 8, minW: 6, minH: 4 }

  // Spalten (Titel + Feld) als JSON in Prop/Attribut. Editor setzt die
  // DOM-Property (useLitElement), Export schreibt JSON ins Attribut; der Wandler
  // liest es zurueck (leer/kaputt -> Standard; coerceSpalten faengt alte Staende).
  @property({
    converter: {
      fromAttribute: (v: string | null): Spalte[] =>
        v ? tryCoerceSpalten(v) : standardSpalten(),
      toAttribute: (v: Spalte[]): string => JSON.stringify(v),
    },
  })
  spalten: Spalte[] = standardSpalten()

  // Datenquelle (Technikwert, Vorlagen-id). Leer = statisch (Platzhalter).
  @property() source = ''

  // Zeilen pro Seite, wie der Maskenbauer sie eingestellt hat (Text, weil
  // Attribute Text sind). Der Bediener kann davon zur Laufzeit abweichen —
  // s. _proSeiteWahl.
  @property() proSeite = String(ZEILEN_PRO_SEITE[0])

  // Laufzeit-Zeilen (attribute:false): tabelle/seRuntime setzt sie im Export aus
  // den SoftEngine-Daten — je Datenzeile ein Wert-Array, an `spalten` ausgerichtet.
  // Im Editor bleibt es [] -> Platzhalter-Striche (Regel 7).
  @property({ attribute: false }) datenzeilen: string[][] = []

  // Sortier-Zustand (nur Laufzeit/Export, nicht persistiert).
  private _sortSpalte = -1
  private _sortAuf = true

  // Paginierung (nur Laufzeit, nicht persistiert).
  private _seite = 0
  // Abweichung des BEDIENERS von der eingestellten Seitengroesse (null = er
  // hat nichts umgestellt, dann gilt die Maskeneinstellung `proSeite`).
  // Getrennt gehalten, damit eine Aenderung im Editor sofort durchschlaegt
  // und nicht von einer alten Laufzeit-Wahl ueberdeckt wird.
  private _proSeiteWahl: number | null = null

  private get proSeiteAktuell(): number {
    if (this._proSeiteWahl !== null) return this._proSeiteWahl
    const n = Number(this.proSeite)
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : ZEILEN_PRO_SEITE[0]
  }

  private spaltenListe(): Spalte[] {
    return coerceSpalten(this.spalten)
  }

  // Sortieren nach Spaltenart (Zahl/Datum/Text) — s. ./sortierung.
  private sortierteZeilen(): string[][] {
    if (this._sortSpalte < 0) return this.datenzeilen.map((z) => [...z])
    return sortiereZeilen(this.datenzeilen, this._sortSpalte, this._sortAuf)
  }

  // Klick auf den Spaltenkopf in der LAUFZEIT: erst absteigend?  Nein —
  // erst aufsteigend, zweiter Klick dreht um (Explorer-Verhalten).
  // Nach dem Sortieren immer zurueck auf Seite 1: sonst steht der Bediener
  // auf Seite 7 einer Liste, die er gerade neu geordnet hat.
  private klickSortiere(index: number): void {
    if (this.editable) return
    if (this._sortSpalte === index) {
      this._sortAuf = !this._sortAuf
    } else {
      this._sortSpalte = index
      this._sortAuf = true
    }
    this._seite = 0
    this.requestUpdate()
  }

  // Eigene Prop ändern = 'ff-prop-change' an den BlockHost (Muster inlineEdit).
  private aendere(spalten: Spalte[]): void {
    this.dispatchEvent(
      new CustomEvent('ff-prop-change', {
        detail: { attr: 'spalten', value: spalten },
        bubbles: true,
        composed: true,
      }),
    )
  }

  // Editor-only: Klick auf einen Spaltenkopf fordert den BlockHost auf, den
  // Feld-Picker fuer diesen Listen-Eintrag zu oeffnen. Das Event ist GENERISCH
  // (`ff-listen-bind` + Prop-Name) — der BlockHost bedient damit jeden
  // Baustein mit `listenBindung`, ohne die Tabelle zu kennen (Regel 2).
  //
  // Einzel- und Doppelklick liegen hier auf DEMSELBEN Element (Picker vs.
  // Umbenennen). Ein Doppelklick loest immer auch zwei Einzelklicks aus —
  // darum wartet der Picker kurz ab und wird vom dblclick abbestellt.
  private _klickTimer: ReturnType<typeof setTimeout> | null = null

  private klickSpaltenkopf(e: MouseEvent, index: number): void {
    if (!this.editable) return
    e.stopPropagation()
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    this.klickTimerAus()
    this._klickTimer = setTimeout(() => {
      this._klickTimer = null
      this.dispatchEvent(
        new CustomEvent('ff-listen-bind', {
          detail: {
            prop: TabelleBlock.listenBindung.prop,
            index,
            top: rect.bottom + 4,
            left: rect.left,
          },
          bubbles: true,
          composed: true,
        }),
      )
    }, DOPPELKLICK_FENSTER)
  }

  private klickTimerAus(): void {
    if (this._klickTimer !== null) {
      clearTimeout(this._klickTimer)
      this._klickTimer = null
    }
  }

  // Inline-Umbenennen des TITELS einer Spalte am Kopf (Muster BasicBlock.inlineEdit,
  // angepasst auf den Listen-Index). Das Feld der Spalte bleibt dabei erhalten.
  private bearbeiteTitel(e: MouseEvent, index: number): void {
    if (!this.editable) return
    const ziel = e.currentTarget as HTMLElement | null
    if (!ziel) return
    e.stopPropagation()
    e.preventDefault()
    const originalNodes = Array.from(ziel.childNodes)
    const original = ziel.textContent ?? ''
    ziel.setAttribute('contenteditable', 'plaintext-only')
    ziel.focus()
    const sel = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(ziel)
    sel?.removeAllRanges()
    sel?.addRange(range)

    let fertig = false
    const abschluss = (commit: boolean): void => {
      if (fertig) return
      fertig = true
      ziel.removeAttribute('contenteditable')
      ziel.removeEventListener('blur', onBlur)
      ziel.removeEventListener('keydown', onKey)
      const neu = (ziel.textContent ?? '').trim()
      const liste = this.spaltenListe()
      if (commit && neu && neu !== original.trim() && index < liste.length) {
        liste[index] = { ...liste[index], titel: neu }
        this.aendere(liste)
      } else {
        // Verwerfen: Original-Knoten zurück (Lit-Marker bleiben heil).
        ziel.replaceChildren(...originalNodes)
      }
    }
    const onBlur = (): void => abschluss(true)
    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key === 'Enter') {
        ev.preventDefault()
        ziel.blur()
      } else if (ev.key === 'Escape') {
        ev.preventDefault()
        abschluss(false)
      }
    }
    ziel.addEventListener('blur', onBlur)
    ziel.addEventListener('keydown', onKey)
  }

  connectedCallback(): void {
    super.connectedCallback()
    connectTable(this)
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.klickTimerAus()
    disconnectTable(this)
  }

  static styles = [
    BasicBlock.styles,
    css`
      :host { min-width: 0; height: 100%; }
      .tabelle {
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--se-panel);
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-lg);
        overflow: hidden;
        font-family: var(--se-font);
        font-size: var(--se-fs);
        color: var(--se-ink);
      }
      .kopf,
      .zeile { display: grid; }
      .kopf {
        background: var(--se-panel-2);
        border-bottom: 1px solid var(--se-line);
        font-size: var(--se-fs-sm);
        font-weight: 600;
      }
      .koerper { flex: 1 1 auto; overflow: auto; }
      .zeile { border-bottom: 1px solid var(--se-line-soft); }
      .zeile:last-child { border-bottom: none; }
      .kopf > div,
      .zeile > div {
        padding: 6px 10px;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        border-right: 1px solid var(--se-line-soft);
      }
      .kopf > div:last-child,
      .zeile > div:last-child { border-right: none; }
      .kopf > div { cursor: pointer; user-select: none; }
      .sort-pfeil { font-size: 9px; color: var(--se-muted); }
      .zeile > div { color: var(--se-muted); }
      .fusszeile {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 10px;
        border-top: 1px solid var(--se-line);
        font-size: var(--se-fs-sm);
        color: var(--se-muted);
        background: var(--se-panel-2);
      }
      .seiten-nav {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .seiten-nav select,
      .seiten-nav button {
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        padding: 2px 6px;
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
        color: var(--se-ink);
        cursor: pointer;
      }
      .seiten-nav button:disabled {
        opacity: 0.3;
        cursor: default;
      }
      /* Editor-only Spalten-Steuerung — NUR auf der Maskenfläche, nie im Export. */
      .steuerung { display: none; }
      :host([data-ff-editor]) .steuerung {
        position: absolute;
        top: 3px;
        right: 3px;
        z-index: 2;
        display: inline-flex;
        gap: 4px;
      }
      .steuerung button {
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        line-height: 1;
        padding: 3px 7px;
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
        color: var(--se-muted);
        cursor: pointer;
      }
      .steuerung button:hover {
        border-color: var(--se-accent);
        color: var(--se-accent);
      }
    `,
  ]

  render(): TemplateResult {
    const spalten = this.spaltenListe()
    const cols = { gridTemplateColumns: `repeat(${spalten.length}, minmax(0, 1fr))` }
    const stop = (e: Event): void => e.stopPropagation()
    // Laufzeit-Daten (Export/SoftEngine) oder Platzhalter (Editor/ohne Quelle).
    const alleDaten = this.sortierteZeilen()
    const hatDaten = alleDaten.length > 0
    // Paginierung (nur Laufzeit mit echten Daten).
    const gesamt = alleDaten.length
    const proSeite = this.proSeiteAktuell
    const seiten = hatDaten ? Math.max(1, Math.ceil(gesamt / proSeite)) : 1
    // Seite einklemmen: eine geschrumpfte Datenmenge (neuer SE-Push) darf den
    // Bediener nicht auf einer Seite stehen lassen, die es nicht mehr gibt.
    const seite = Math.min(Math.max(this._seite, 0), seiten - 1)
    const seitenDaten = hatDaten
      ? alleDaten.slice(seite * proSeite, (seite + 1) * proSeite)
      : []
    // Zeilen auffuellen: immer mindestens proSeite (Laufzeit) bzw.
    // PLATZHALTER_ZEILEN (Editor) Zeilen mit Linien zeigen.
    const sollZeilen = hatDaten ? proSeite : PLATZHALTER_ZEILEN
    // Zwei verschiedene leere Zeilen, zwei verschiedene Bedeutungen:
    //   ohne Daten (Editor): „—" = hier kommt spaeter ein Wert hin (Regel 7).
    //   mit Daten (letzte Seite halb voll): LEER — es gibt schlicht nicht mehr.
    // Ein „—" waere dort gelogen: es sieht aus wie ein fehlender Wert.
    const fuellzeichen = hatDaten ? '' : '—'
    const zeilen: (readonly string[] | null)[] = [
      ...seitenDaten,
      ...Array.from({ length: Math.max(0, sollZeilen - seitenDaten.length) }, () => null),
    ]
    return html`<div class="tabelle">
      <div class="steuerung">
        <button
          title="Letzte Spalte entfernen"
          @pointerdown=${stop}
          @click=${(e: Event) => {
            stop(e)
            const l = this.spaltenListe()
            if (l.length > SPALTEN_MIN) {
              l.pop()
              this.aendere(l)
            }
          }}
        >−</button>
        <button
          title="Spalte hinzufügen"
          @pointerdown=${stop}
          @click=${(e: Event) => {
            stop(e)
            const l = this.spaltenListe()
            if (l.length < SPALTEN_MAX) {
              l.push({ titel: `Spalte ${l.length + 1}`, feld: '' })
              this.aendere(l)
            }
          }}
        >+ Spalte</button>
      </div>
      <div class="kopf" style=${styleMap(cols)}>
        ${spalten.map(
          (s, i) => html`<div
            data-ff-editable
            @dblclick=${(e: MouseEvent) => {
              // Umbenennen gewinnt: den wartenden Feld-Picker abbestellen.
              this.klickTimerAus()
              this.bearbeiteTitel(e, i)
            }}
            @click=${(e: MouseEvent) => {
              // Editor: Feld-Picker (verzoegert, s. klickSpaltenkopf).
              // Laufzeit: sortieren. Nie beides — editable trennt die Welten.
              this.klickSpaltenkopf(e, i)
              this.klickSortiere(i)
            }}
          >${s.titel}${!this.editable && this._sortSpalte === i
            ? html`<span class="sort-pfeil">${this._sortAuf ? ' ▲' : ' ▼'}</span>`
            : ''}</div>`,
        )}
      </div>
      <div class="koerper">
        ${zeilen.map(
          (row) => html`<div class="zeile" style=${styleMap(cols)}>
            ${row
              ? row.map((wert) => html`<div>${wert}</div>`)
              : spalten.map(() => html`<div>${fuellzeichen}</div>`)}
          </div>`,
        )}
      </div>
      ${hatDaten ? html`<div class="fusszeile">
        <div class="seiten-info">${gesamt} Datensätze</div>
        <div class="seiten-nav">
          <select
            @change=${(e: Event) => {
              this._proSeiteWahl = Number((e.target as HTMLSelectElement).value)
              this._seite = 0
              this.requestUpdate()
            }}
          >${ZEILEN_PRO_SEITE.map(
            (n) => html`<option value=${n} ?selected=${n === proSeite}>${n} pro Seite</option>`,
          )}</select>
          <button ?disabled=${seite <= 0} @click=${() => { this._seite = seite - 1; this.requestUpdate() }}>‹</button>
          <span>${seite + 1} / ${seiten}</span>
          <button ?disabled=${seite >= seiten - 1} @click=${() => { this._seite = seite + 1; this.requestUpdate() }}>›</button>
        </div>
      </div>` : ''}
    </div>`
  }
}

BasicBlock.defineAndRegister(TabelleBlock)
