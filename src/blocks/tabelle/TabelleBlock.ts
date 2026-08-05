// TabelleBlock
// Tabellen-Baustein. EIN Baustein, EIN Rahmen: die Spalten stecken INNEN
// (kein Kind-Baustein je Spalte). Jede Spalte hat einen Titel UND ein Feld:
//   - Titel je Spalte per Doppelklick am Kopf umbenennen (./titelEdit)
//   - „+" / „−" oben rechts: Spalte hinzufügen / letzte entfernen
//   - feld = Feldcode der Datenquelle (Technikwert, unsichtbar) — welchen Wert
//     die Spalte je Zeile zeigt. Einfacher Klick auf den Spaltenkopf oeffnet
//     im Editor den Feld-Picker (generisch ueber `listenBindung`).
// Alles Editor-Sichtbare (Steuerung/Inline-Edit) NUR im Editor (data-ff-editor),
// im Export nie (WYSIWYG). KEIN Spaltenbreite-Ziehen (Nutzer 2026-07-23).
// Wie viele Zeilen eine Seite zeigt, rechnet ./seitengroesse aus der HOEHE;
// die Bedienleiste unten wohnt in ./tabelleFuss.
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
import type { ListenBindung, SatzWahl } from '../../core/blocks/BlockDefinition'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { geberIdVon, waehleAuswahl } from '../shared/auswahl'
import { OHNE_MESSUNG, passendeZeilen, seitenAufteilung, ZEILEN_HOEHE } from './seitengroesse'
import { connectTable, disconnectTable } from './seRuntime'
import { sortiereIndizes } from './sortierung'
import { spaltenSteuerung, starteTitelEdit } from './spaltenBearbeiten'
import { passendeIndizes, zeigtEchteDaten } from './suche'
import { tabelleFuss } from './tabelleFuss'
import { tabelleStil } from './tabelleStil'
import {
  STANDARD_TITEL,
  coerceSpalten,
  standardSpalten,
  tryCoerceSpalten,
  type Spalte,
} from './spalten'

// Das Spalten-Modell wohnt in ./spalten — hier nur die Darstellung.
export { coerceSpalten, type Spalte } from './spalten'

const PLATZHALTER_ZEILEN = 4

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
  // Auswahl (2026-08-05): der Bediener greift hier einen Satz heraus, indem er
  // eine ZEILE anklickt (zweiter Klick hebt auf) — immer und aus der eigenen
  // Datenquelle, darum eine SatzWahl ohne Bedingung und ohne eigene
  // Quellen-Prop. Ob die Tabelle damit wirklich Auswahl-Geber IST, leitet
  // istAuswahlGeber daraus ab: ohne Quelle zeigt sie nur Platzhalter, dann gibt
  // es nichts abzugeben. Ausserdem kann sie der Auswahl eines anderen Gebers
  // FOLGEN (zeigt dann nur die passenden Zeilen). Beides Registry-Faehigkeiten
  // — Export, Inspector und Laufzeit lesen sie generisch.
  static readonly satzWahl: SatzWahl = {}
  static readonly kannAuswahlFolgen = true
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
  static override readonly customProperties: PropertyDescription[] = [
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

  // Die ROHEN Zeilenobjekte, an datenzeilen ausgerichtet (gleicher Index).
  // Braucht die Auswahl: die Folger vergleichen Schluesselfelder der
  // gewaehlten Zeile, und die stehen nicht unbedingt in einer Spalte.
  @property({ attribute: false }) rohzeilen: unknown[] = []

  // Index der GEWAEHLTEN Zeile in datenzeilen (-1 = keine). Setzt die
  // Laufzeit (seRuntime) aus dem gemeinsamen Auswahl-Zustand — der Baustein
  // haelt selbst keinen: nach jedem SoftEngine-Push waere er veraltet.
  @property({ attribute: false }) auswahlIndex = -1

  // Zeigt die Tabelle gerade WENIGER, weil sie der Auswahl eines anderen
  // Bausteins folgt? Nur fuer die ehrliche Fusszeile (Regel 4).
  @property({ attribute: false }) durchAuswahlGefiltert = false

  // Sortier-Zustand (nur Laufzeit/Export, nicht persistiert).
  private _sortSpalte = -1
  private _sortAuf = true

  // Paginierung (nur Laufzeit, nicht persistiert).
  private _seite = 0
  // Was der BEDIENER unten in der Fusszeile gewaehlt hat (null = nichts
  // umgestellt, dann gilt die gemessene Hoehe). Es gibt keine
  // Maskeneinstellung mehr — die Seitengroesse ist reine Laufzeit-Sache des
  // Bedieners.
  private _proSeiteWahl: number | null = null

  // Wie viele Zeilen bei der aktuellen Hoehe passen — gemessen, nicht geraten
  // (siehe messeRumpf). null = noch nicht bzw. nicht messbar.
  private _proSeiteGemessen: number | null = null
  private _beobachter: ResizeObserver | null = null

  private get proSeiteAktuell(): number {
    // Reihenfolge: bewusste Uebersteuerung des Bedieners gewinnt, dann die
    // Messung, dann der Rueckfall. Ohne Messung (altes WinUI ohne
    // ResizeObserver) laeuft die Tabelle genau wie bis 2026-08-06.
    return this._proSeiteWahl ?? this._proSeiteGemessen ?? OHNE_MESSUNG
  }

  // Die Hoehe des Rumpfes beobachten und daraus die Zeilenzahl rechnen.
  // Editor UND Maske, eine Render-Quelle (Regel 1): im Editor zieht der Bauer
  // den Baustein groesser und sieht sofort, was in der Maske stehen wird.
  //
  // Gemessen wird NUR auf der Rasterflaeche — daran, dass das Attribut
  // 'fuellt' steht (dieselbe Marke setzen Editor und Export, siehe
  // BasicBlock). Nur dort ist die Hoehe VORGEGEBEN und der Rumpf (flex:1,
  // scrollend) unabhaengig von seinem Inhalt. Steht die Tabelle dagegen im
  // Fluss, z. B. in einer Zeile, hat sie gar keine vorgegebene Hoehe: dort
  // faellt `height: 100%` auf `auto` und sie WAECHST mit ihrem Inhalt. Messen
  // wuerde sich dann aufschaukeln — mehr Zeilen, hoeherer Rumpf, wieder mehr
  // Zeilen, bis der Browser die Notbremse zieht. Im Fluss gilt darum
  // OHNE_MESSUNG, genau wie ohne ResizeObserver.
  //
  // Neu gezeichnet wird ausserdem nur, wenn sich die ZAHL aendert: eine
  // Scrollleiste, die kommt oder geht, aendert die Breite und darf keine
  // Zeichen-Schleife anstossen.
  private messeRumpf(): void {
    if (!this.hasAttribute('fuellt')) {
      // Aus dem Raster in einen Container gezogen: die alte Messung gilt nicht
      // mehr, sonst bliebe eine Zahl stehen, zu der es keine Hoehe gibt.
      if (this._proSeiteGemessen === null) return
      this._proSeiteGemessen = null
      this.requestUpdate()
      return
    }
    const rumpf = this.renderRoot.querySelector('.koerper')
    const kopf = this.renderRoot.querySelector('.kopf')
    if (!(rumpf instanceof HTMLElement) || !(kopf instanceof HTMLElement)) return
    const zahl = passendeZeilen(rumpf.clientHeight, kopf.offsetHeight)
    if (zahl === this._proSeiteGemessen) return
    this._proSeiteGemessen = zahl
    this.requestUpdate()
  }

  private spaltenListe(): Spalte[] {
    return coerceSpalten(this.spalten)
  }

  // Die Zeilen, die der Bediener gerade sehen soll — als ROHINDIZES in
  // datenzeilen: ERST suchen, DANN sortieren. Indizes statt Werte, weil die
  // Auswahl-Markierung an der ZEILE kleben muss, egal wie gefiltert oder
  // sortiert wird. Beides sind eigene, getestete Stellen (./suche, ./sortierung).
  private sichtbareIndizes(): number[] {
    const gefiltert = passendeIndizes(this.datenzeilen, this._suchtext)
    if (this._sortSpalte < 0) return gefiltert
    const rows = gefiltert.map((i) => this.datenzeilen[i])
    return sortiereIndizes(rows, this._sortSpalte, this._sortAuf).map((k) => gefiltert[k])
  }

  // Klick auf eine Datenzeile in der LAUFZEIT: Auswahl setzen bzw. mit dem
  // zweiten Klick auf dieselbe Zeile wieder aufheben (Toggle). Der Zustand
  // wohnt im gemeinsamen Auswahl-Modul (shared/auswahl) — von dort kommt er
  // ueber die Neu-Hydrierung als auswahlIndex zurueck. Im Editor passiert
  // nichts (keine erfundene Auswahl, Regel 7).
  private klickZeile(rohIndex: number | null): void {
    if (rohIndex === null || this.hasAttribute('data-ff-editor')) return
    const geberId = geberIdVon(this)
    const zeile = this.rohzeilen[rohIndex]
    if (geberId === '' || zeile === undefined) return
    waehleAuswahl(geberId, zeile)
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

  // Inline-Umbenennen des TITELS einer Spalte am Kopf. Die Mechanik wohnt in
  // ./titelEdit, hier bleibt nur, was die Tabelle daran fachlich ausmacht:
  // der Titel landet an SEINER Stelle in der Liste, das Feld der Spalte
  // bleibt erhalten.
  private bearbeiteTitel(e: MouseEvent, index: number): void {
    if (!this.editable) return
    starteTitelEdit(e, (neu) => {
      const liste = this.spaltenListe()
      if (index >= liste.length) return
      liste[index] = { ...liste[index], titel: neu }
      this.aendere(liste)
    })
  }

  // Den Rumpf beobachten. Aus BEIDEN Einstiegen aufgerufen: beim ersten Mal
  // gibt es noch kein gezeichnetes Innenleben (firstUpdated holt es nach),
  // beim Wieder-Einhaengen ins DOM steht es schon (connectedCallback) — und
  // dort MUSS neu angemeldet werden, weil disconnectedCallback abmeldet.
  // Sonst maesse ein verschobener Baustein nie wieder.
  //
  // RUECKFALL PFLICHT: ohne ResizeObserver (altes WinUI) wird nicht gemessen —
  // dann bleibt _proSeiteGemessen null und es gilt OHNE_MESSUNG. Kein Fehler,
  // kein Absturz, nur die feste Zahl von vor 2026-08-06.
  private beobachteRumpf(): void {
    if (this._beobachter || typeof ResizeObserver === 'undefined') return
    const rumpf = this.renderRoot.querySelector('.koerper')
    if (!rumpf) return
    this._beobachter = new ResizeObserver(() => this.messeRumpf())
    this._beobachter.observe(rumpf)
    this.messeRumpf()
  }

  override connectedCallback(): void {
    super.connectedCallback()
    connectTable(this)
    this.beobachteRumpf()
  }

  protected override firstUpdated(): void {
    this.beobachteRumpf()
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.klickTimerAus()
    this._beobachter?.disconnect()
    this._beobachter = null
    disconnectTable(this)
  }

  static override styles = [BasicBlock.styles, tabelleStil]

  override render(): TemplateResult {
    const spalten = this.spaltenListe()
    const cols = { gridTemplateColumns: `repeat(${spalten.length}, minmax(0, 1fr))` }
    const stop = (e: Event): void => e.stopPropagation()
    // Laufzeit-Daten (Export/SoftEngine) oder Platzhalter (Editor/ohne Quelle) —
    // als Rohindizes, damit die Auswahl-Markierung an ihrer Zeile klebt.
    const alleSichtbar = this.sichtbareIndizes()
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
    // Paginierung: die Rechnung wohnt in ./seitengroesse (rein + getestet).
    // In der Maske wird NICHT aufgefuellt — ein Satz ist eine Zeile; den
    // leeren Rest zeichnet das Lineal weiter. Im Editor stehen stattdessen
    // Platzhalter-Zeilen mit „—" (Regel 7: hier kommt spaeter ein Wert hin).
    const gesamt = alleSichtbar.length
    const proSeite = this.proSeiteAktuell
    const { seiten, seite, zeilen } = seitenAufteilung({
      sichtbar: alleSichtbar,
      hatQuelle,
      proSeite,
      wunschSeite: this._seite,
      platzhalterZeilen: PLATZHALTER_ZEILEN,
    })
    return html`<div class="tabelle" style=${styleMap({
      '--spalten-zahl': String(spalten.length),
      // EINE Zahl, EINE Stelle: der Takt kommt aus ./seitengroesse, damit die
      // Optik (Linien) und die Rechnung (wie viele passen) nicht auseinander
      // laufen koennen.
      '--zeilen-hoehe': `${ZEILEN_HOEHE}px`,
    })}>
      ${spaltenSteuerung(() => this.spaltenListe(), (l) => this.aendere(l), stop)}
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
          (rohIndex) => html`<div
            class="zeile${rohIndex !== null && hatQuelle ? ' waehlbar' : ''}${
              rohIndex !== null && rohIndex === this.auswahlIndex ? ' gewaehlt' : ''}"
            style=${styleMap(cols)}
            @click=${() => this.klickZeile(rohIndex)}
          >
            ${rohIndex !== null
              ? (this.datenzeilen[rohIndex] ?? []).map((wert) => html`<div>${wert}</div>`)
              : spalten.map(() => html`<div>—</div>`)}
          </div>`,
        )}
        <div class="lineal"></div>
      </div>
      ${tabelleFuss({
        hatQuelle,
        sichtbar: gesamt,
        gesamt: this.datenzeilen.length,
        suchtAktiv: this._suchtext.trim() !== '',
        auswahlAktiv: this.durchAuswahlGefiltert,
        proSeiteWahl: this._proSeiteWahl,
        seite,
        seiten,
      }, {
        waehleProSeite: (wert) => {
          this._proSeiteWahl = wert
          this._seite = 0
          this.requestUpdate()
        },
        blaettere: (zu) => {
          this._seite = zu
          this.requestUpdate()
        },
        stop,
      })}
    </div>`
  }
}

BasicBlock.defineAndRegister(TabelleBlock)
