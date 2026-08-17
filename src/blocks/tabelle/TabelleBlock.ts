import { html, nothing, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { ListenBindung, SatzWahl } from '../../core/blocks/BlockDefinition'
import { geberIdVon, waehleAuswahl } from '../shared/auswahl'
import { LEER_TEXT_STANDARD, leerStil } from '../shared/leerZustand'
import { chipStyles } from '../shared/statusVariant'
import { beobachteRumpf, gemessenesMass } from './rumpfMessung'
import type { Zeilenmass } from './seitengroesse'
import { connectTable, disconnectTable } from './seRuntime'
import {
  benenneSpalteUm,
  feldPickerAbbestellen,
  oeffneFeldPicker,
  spaltenSteuerung,
} from './spaltenBearbeiten'
import { zeilenHoeheFuer } from './spaltenArten'
import { SPALTEN_BINDUNG } from './spaltenBindung'
import { tabelleAnsicht } from './tabelleAnsicht'
import { TABELLE_EIGENSCHAFTEN } from './tabelleEigenschaften'
import { tabelleFuss } from './tabelleFuss'
import { tabelleKoerper } from './tabelleKoerper'
import { tabelleStil } from './tabelleStil'
import {
  fokussierterRohIndex,
  sendeZeileAktiviert,
  stelleZeilenFokusHer,
} from './zeilenAktivierung'
import {
  coerceSpalten,
  standardSpalten,
  tryCoerceSpalten,
  type Spalte,
} from './spalten'

export { coerceSpalten, type Spalte } from './spalten'

export class TabelleBlock extends BasicBlock {
  static readonly blockType = 'tabelle'
  static readonly tagName = 'ff-tabelle'
  static readonly displayName = 'Tabelle'
  static readonly category: BlockCategory = 'anzeige'

  static readonly acceptsDataSource = true

  static readonly satzWahl: SatzWahl = {}
  static readonly kannAuswahlFolgen = true

  static readonly listenBindung: ListenBindung = SPALTEN_BINDUNG
  static readonly defaultProps = {
    width: 'fill',
    source: '',
    spalten: standardSpalten(),
    suche: 'ja',

    tagField: '',

    leerText: LEER_TEXT_STANDARD,
  }
  static override readonly customProperties = TABELLE_EIGENSCHAFTEN

  static readonly raster = { startW: 14, startH: 8, minW: 6, minH: 4 }

  @property({
    converter: {
      fromAttribute: (v: string | null): Spalte[] =>
        v ? tryCoerceSpalten(v) : standardSpalten(),
      toAttribute: (v: Spalte[]): string => JSON.stringify(v),
    },
  })
  spalten: Spalte[] = standardSpalten()

  @property() source = ''

  @property() suche = 'ja'

  @property() leerText = LEER_TEXT_STANDARD

  private _suchtext = ''

  @property({ attribute: false }) datenzeilen: string[][] = []

  @property({ attribute: false }) zusatzzeilen: Record<string, string>[][] = []

  @property({ attribute: false }) rohzeilen: unknown[] = []

  @property({ attribute: false }) auswahlIndex = -1

  @property({ attribute: false }) durchAuswahlGefiltert = false

  @property({ attribute: false }) datenGeliefert = false

  private _sortSpalte = -1
  private _sortAuf = true

  private _seite = 0

  private _mass: Zeilenmass | null = null
  private _beobachter: ResizeObserver | null = null

  private _taktGemessen = 0

  private _fokusZeile: number | null = null
  private _fokusHolen = false

  private merkeZeilenFokus(): void {
    const roh = fokussierterRohIndex(this.shadowRoot)
    this._fokusHolen = roh !== undefined
    this._fokusZeile = roh ?? null
  }

  private messeRumpf(): void {
    const takt = this.zeilenHoehe
    this._taktGemessen = takt
    const mass = gemessenesMass(this, takt)
    if (mass?.passen === this._mass?.passen && mass?.zeilenHoehe === this._mass?.zeilenHoehe) return
    this._mass = mass
    this.requestUpdate()
  }

  private spaltenListe(): Spalte[] {
    return coerceSpalten(this.spalten)
  }

  private get zeilenHoehe(): number {
    return zeilenHoeheFuer(this.spaltenListe())
  }

  private aktiviereZeile(rohIndex: number | null, ansichtIndex: number): void {
    if (rohIndex === null || this.hasAttribute('data-ff-editor')) return
    const rohzeile = this.rohzeilen[rohIndex]
    if (rohzeile === undefined) return
    sendeZeileAktiviert(this, { rohzeile, rohIndex, ansichtIndex })
    this.toggleAuswahl(rohzeile)
  }

  private toggleAuswahl(rohzeile: unknown): void {
    const geberId = geberIdVon(this)
    if (geberId === '') return
    waehleAuswahl(geberId, rohzeile)
  }

  private setzeSuchtext(text: string): void {
    this.merkeZeilenFokus()
    this._suchtext = text
    this._seite = 0
    this.requestUpdate()
  }

  private klickSortiere(index: number): void {
    if (this.editable) return
    this.merkeZeilenFokus()
    if (this._sortSpalte === index) {
      this._sortAuf = !this._sortAuf
    } else {
      this._sortSpalte = index
      this._sortAuf = true
    }
    this._seite = 0
    this.requestUpdate()
  }

  private aendere(spalten: Spalte[]): void {
    this.dispatchEvent(
      new CustomEvent('ff-prop-change', {
        detail: { attr: 'spalten', value: spalten },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private beobachte(): void {
    if (this._beobachter) return
    this._beobachter = beobachteRumpf(this, () => this.messeRumpf())
    if (this._beobachter) this.messeRumpf()
  }

  override connectedCallback(): void {
    super.connectedCallback()
    connectTable(this)
    this.beobachte()
  }

  protected override firstUpdated(): void {
    this.beobachte()
  }

  protected override updated(): void {
    if (this._taktGemessen !== this.zeilenHoehe) this.messeRumpf()
    if (!this._fokusHolen) return
    this._fokusHolen = false
    stelleZeilenFokusHer(this.shadowRoot, this._fokusZeile)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    feldPickerAbbestellen(this)
    this._beobachter?.disconnect()
    this._beobachter = null
    disconnectTable(this)
  }

  static override styles = [BasicBlock.styles, chipStyles, leerStil, tabelleStil]

  override render(): TemplateResult {
    const spalten = this.spaltenListe()
    const stop = (e: Event): void => e.stopPropagation()

    const ansicht = tabelleAnsicht({
      spalten,
      imEditor: this.hasAttribute('data-ff-editor'),
      source: this.source,
      datenGeliefert: this.datenGeliefert,
      datenzeilen: this.datenzeilen,
      suchtext: this._suchtext,
      sortSpalte: this._sortSpalte,
      sortAuf: this._sortAuf,
      wunschSeite: this._seite,
      gemessen: this._mass,
    })
    return html`<div class="tabelle" style=${styleMap({
      '--takt': `${ansicht.takt}px`,
      '--zeilen-hoehe': `${ansicht.zeilenHoehe}px`,
    })}>
      ${spaltenSteuerung(() => this.spaltenListe(), (l) => this.aendere(l), stop)}
      ${tabelleKoerper({
        spalten,
        cols: ansicht.cols,
        editable: this.editable,
        imEditor: this.hasAttribute('data-ff-editor'),
        auswahlSemantik: geberIdVon(this) !== '',
        zeigeSuche: this.suche === 'ja',
        suchtext: this._suchtext,
        sortSpalte: this._sortSpalte,
        sortAuf: this._sortAuf,
        zeilen: ansicht.zeilen,
        linealTakte: ansicht.linealTakte,
        datenzeilen: this.datenzeilen,
        zusatzzeilen: this.zusatzzeilen,
        hatQuelle: ansicht.hatQuelle,
        auswahlIndex: this.auswahlIndex,
        leer: ansicht.leer,
        leerText: this.leerText,
      }, {
        setzeSuchtext: (text) => this.setzeSuchtext(text),
        dblklickKopf: (e, i) => {
          if (!this.editable) return

          feldPickerAbbestellen(this)
          benenneSpalteUm(e, i, () => this.spaltenListe(), (l) => this.aendere(l))
        },
        klickKopf: (e, i) => {
          if (this.editable) oeffneFeldPicker(this, e, TabelleBlock.listenBindung.prop, i)
          this.klickSortiere(i)
        },
        aktiviereZeile: (rohIndex, ansichtIndex) => this.aktiviereZeile(rohIndex, ansichtIndex),
        stop,
      })}
      ${ ''}
      ${ansicht.leer ? nothing : tabelleFuss({
        hatQuelle: ansicht.hatQuelle,
        sichtbar: ansicht.gesamt,
        gesamt: this.datenzeilen.length,
        suchtAktiv: this._suchtext.trim() !== '',
        auswahlAktiv: this.durchAuswahlGefiltert,
        seite: ansicht.seite,
        seiten: ansicht.seiten,
      }, {
        blaettere: (zu) => {
          this.merkeZeilenFokus()
          this._seite = zu
          this.requestUpdate()
        },
        stop,
      })}
    </div>`
  }
}

BasicBlock.defineAndRegister(TabelleBlock)
