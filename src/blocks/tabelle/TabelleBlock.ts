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

import { html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { ListenBindung } from '../../core/blocks/BlockDefinition'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { connectTable, disconnectTable } from './seRuntime'
import { sortiereZeilen } from './sortierung'
import { datensatzText, filtereZeilen, zeigtEchteDaten } from './suche'
import { tabelleStil } from './tabelleStil'
import {
  SPALTEN_MAX,
  SPALTEN_MIN,
  STANDARD_TITEL,
  coerceSpalten,
  standardSpalten,
  standardTitelFuer,
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
  // Datenquelle anhaengbar (Inspector-Sektion „Daten"); der Export
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
    suche: 'ja',
    // Feldcode des Datumsfelds fuer den Tageswaehler (Technikwert,
    // unsichtbar). Leer = kein Tagesfilter, alle Saetze.
    tagField: '',
  }
  static readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'suche',
      name: 'Suchzeile',
      description: 'Zeigt ueber der Tabelle ein Feld, mit dem der Bediener den Inhalt durchsucht.',
      kind: 'segment',
      options: [{ value: 'ja', label: 'Ja' }, { value: 'nein', label: 'Nein' }],
      requiresDataSource: true,
    },
    // „Zeilen pro Seite" war bis 2026-07-27 zweimal da: hier im Inspector
    // UND unten in der Fusszeile der Tabelle. Beides ersatzlos auf EINEN
    // Ort zusammengezogen (Nutzer-Entscheidung) — die Fusszeile, wo der
    // Bediener es in der laufenden Maske umstellt. Die Maske startet immer
    // mit ZEILEN_PRO_SEITE[0]; es gibt keinen einstellbaren Startwert mehr
    // und darum auch kein Attribut im Export.
    {
      attributeName: 'tagField',
      name: 'Tag filtern nach',
      description: 'Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt die Tabelle nur Saetze des Tages, den der Tageswaehler zeigt. Leer = alle Saetze.',
      kind: 'field',
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

  // Suchzeile ueber der Tabelle ein-/ausschaltbar ('ja' | 'nein').
  @property() suche = 'ja'

  // Was der Bediener zur Laufzeit in die Suchzeile getippt hat.
  private _suchtext = ''

  // Laufzeit-Zeilen (attribute:false): tabelle/seRuntime setzt sie im Export aus
  // den SoftEngine-Daten — je Datenzeile ein Wert-Array, an `spalten` ausgerichtet.
  // Im Editor bleibt es [] -> Platzhalter-Striche (Regel 7).
  @property({ attribute: false }) datenzeilen: string[][] = []

  // Sortier-Zustand (nur Laufzeit/Export, nicht persistiert).
  private _sortSpalte = -1
  private _sortAuf = true

  // Paginierung (nur Laufzeit, nicht persistiert).
  private _seite = 0
  // Was der BEDIENER unten in der Fusszeile gewaehlt hat (null = nichts
  // umgestellt, dann gilt die Startgroesse). Es gibt keine Maskeneinstellung
  // mehr — die Seitengroesse ist reine Laufzeit-Sache des Bedieners.
  private _proSeiteWahl: number | null = null

  private get proSeiteAktuell(): number {
    return this._proSeiteWahl ?? ZEILEN_PRO_SEITE[0]
  }

  private spaltenListe(): Spalte[] {
    return coerceSpalten(this.spalten)
  }

  // Die Zeilen, die der Bediener gerade sehen soll: ERST suchen, DANN
  // sortieren. Andersherum waere die Arbeit umsonst — sortiert wird nur,
  // was uebrig bleibt. Beides sind eigene, getestete Stellen
  // (./suche, ./sortierung).
  private sichtbareZeilen(): string[][] {
    const gefiltert = filtereZeilen(this.datenzeilen, this._suchtext)
    if (this._sortSpalte < 0) return gefiltert
    return sortiereZeilen(gefiltert, this._sortSpalte, this._sortAuf)
  }

  // Tippen in der Suchzeile: zurueck auf Seite 1 — sonst steht der Bediener
  // auf Seite 5 einer Liste, die nach dem Filtern nur noch zwei Seiten hat.
  private setzeSuchtext(text: string): void {
    this._suchtext = text
    this._seite = 0
    this.requestUpdate()
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

  static styles = [BasicBlock.styles, tabelleStil]

  render(): TemplateResult {
    const spalten = this.spaltenListe()
    const cols = { gridTemplateColumns: `repeat(${spalten.length}, minmax(0, 1fr))` }
    const stop = (e: Event): void => e.stopPropagation()
    // Laufzeit-Daten (Export/SoftEngine) oder Platzhalter (Editor/ohne Quelle).
    const alleDaten = this.sichtbareZeilen()
    // „Hat Quelle" heisst: es KOMMEN Daten — nicht, dass gerade welche da
    // sind. Bis 2026-07-28 stand hier `datenzeilen.length > 0`, und damit
    // fiel die LAUFENDE Maske auf die Editor-Platzhalter zurueck, sobald der
    // Tagesfilter einen Tag ohne Saetze traf: vier Striche „—" und
    // „— Datensaetze", als warte man noch auf Daten. Ein leerer Tag ist aber
    // der Normalfall, und erfundene Striche in der echten Maske brechen
    // Regel 7 (der Editor erfindet nie Daten — die Maske erst recht nicht).
    //
    // Unterschieden wird ueber `data-ff-editor`: der BlockHost setzt es an
    // JEDEM Editor-Element, der Export nie — dieselbe Marke, an der auch
    // datenAnschluss Editor-Elemente von der Daten-Mechanik fernhaelt.
    // `editable` taugt dafuer NICHT: das ist im Editor nur am AUSGEWAEHLTEN
    // Baustein true, ein nicht ausgewaehlter saehe sonst aus wie Laufzeit.
    // Die Entscheidung selbst wohnt pruefbar in ./suche (zeigtEchteDaten).
    const hatQuelle = zeigtEchteDaten(this.hasAttribute('data-ff-editor'), this.source)
    // Paginierung (nur Laufzeit mit echten Daten).
    const gesamt = alleDaten.length
    const proSeite = this.proSeiteAktuell
    const seiten = hatQuelle ? Math.max(1, Math.ceil(gesamt / proSeite)) : 1
    // Seite einklemmen: eine geschrumpfte Datenmenge (neuer SE-Push) darf den
    // Bediener nicht auf einer Seite stehen lassen, die es nicht mehr gibt.
    const seite = Math.min(Math.max(this._seite, 0), seiten - 1)
    const seitenDaten = hatQuelle
      ? alleDaten.slice(seite * proSeite, (seite + 1) * proSeite)
      : []
    // Zeilen auffuellen: immer mindestens proSeite (Laufzeit) bzw.
    // PLATZHALTER_ZEILEN (Editor) Zeilen mit Linien zeigen.
    const sollZeilen = hatQuelle ? proSeite : PLATZHALTER_ZEILEN
    // Zwei verschiedene leere Zeilen, zwei verschiedene Bedeutungen:
    //   ohne Quelle (Editor): „—" = hier kommt spaeter ein Wert hin (Regel 7).
    //   mit Quelle (leerer Tag, letzte Seite halb voll): LEER — es gibt
    //   schlicht nicht mehr. Ein „—" waere dort gelogen: es sieht aus wie ein
    //   fehlender Wert, obwohl es gar keinen Satz gibt.
    const fuellzeichen = hatQuelle ? '' : '—'
    const zeilen: (readonly string[] | null)[] = [
      ...seitenDaten,
      ...Array.from({ length: Math.max(0, sollZeilen - seitenDaten.length) }, () => null),
    ]
    return html`<div class="tabelle" style=${styleMap({ '--spalten-zahl': String(spalten.length) })}>
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
              // Titel aus ./spalten, nicht von Hand getippt: an DIESER Vorlage
              // erkennt der Editor, dass der Bediener den Titel nicht selbst
              // gesetzt hat und ihn beim Feld-Binden ersetzen darf.
              l.push({ titel: standardTitelFuer(l.length), feld: '' })
              this.aendere(l)
            }
          }}
        >+</button>
      </div>
      ${this.suche === 'ja' ? html`<div class="suchzeile">
        <input
          type="search"
          placeholder="Tabelle durchsuchen…"
          aria-label="Tabelle durchsuchen"
          .value=${this._suchtext}
          @pointerdown=${stop}
          @input=${(e: Event) => this.setzeSuchtext((e.target as HTMLInputElement).value)}
        />
      </div>` : ''}
      <div class="koerper">
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
        ${zeilen.map(
          (row) => html`<div class="zeile" style=${styleMap(cols)}>
            ${row
              ? row.map((wert) => html`<div>${wert}</div>`)
              : spalten.map(() => html`<div>${fuellzeichen}</div>`)}
          </div>`,
        )}
        <div class="lineal"></div>
      </div>
      <!-- Fusszeile IMMER: sie gehoert zum Aufbau der Tabelle, also muss der
           Editor sie zeigen (Regel 1 — was zu sehen ist, IST der Export).
           Vorher erschien sie nur mit Daten; im Editor fehlte sie damit
           komplett, und der Bediener suchte vergeblich nach der
           Seiteneinstellung. Ohne Daten steht statt einer erfundenen Zahl
           ein Strich (Regel 7). -->
      <div class="fusszeile">
        <div class="seiten-info">${datensatzText({
          hatQuelle,
          sichtbar: gesamt,
          gesamt: this.datenzeilen.length,
          suchtAktiv: this._suchtext.trim() !== '',
        })}</div>
        <div class="seiten-nav">
          <select
            aria-label="Zeilen pro Seite"
            @pointerdown=${stop}
            @change=${(e: Event) => {
              this._proSeiteWahl = Number((e.target as HTMLSelectElement).value)
              this._seite = 0
              this.requestUpdate()
            }}
          >${ZEILEN_PRO_SEITE.map(
            (n) => html`<option value=${n} ?selected=${n === proSeite}>${n} pro Seite</option>`,
          )}</select>
          <button aria-label="Seite zurück" ?disabled=${seite <= 0} @click=${() => { this._seite = seite - 1; this.requestUpdate() }}>‹</button>
          <span>Seite ${seite + 1} von ${seiten}</span>
          <button aria-label="Seite vor" ?disabled=${seite >= seiten - 1} @click=${() => { this._seite = seite + 1; this.requestUpdate() }}>›</button>
        </div>
      </div>
    </div>`
  }
}

BasicBlock.defineAndRegister(TabelleBlock)
