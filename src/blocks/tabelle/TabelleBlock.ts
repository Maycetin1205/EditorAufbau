import { html, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type {
  ErfassungsFaehigkeit,
  ListenBindung,
  SatzWahl,
} from '../../core/blocks/BlockDefinition'
import { geberIdVon, waehleAuswahl } from '../shared/auswahl'
import { LEER_TEXT_STANDARD, leerStil } from '../shared/leerZustand'
import { vorschlagStil } from '../shared/vorschlagListe'
import { chipStyles } from '../shared/statusVariant'
import { schliesseNachschlagenFuer } from '../formfeld/nachschlagen'
import { beobachteRumpf, gemessenesMass } from './rumpfMessung'
import {
  erfassungsZeileFuer,
  type ErfassungsWirt,
} from './erfassungsBedienung'
import { ErfassungsAnschluss } from './erfassungsAnschluss'
import type { ErfassungsUmfeld } from './erfassungsZellen'
import { erfassungStil } from './erfassungStil'
import {
  leiteZeilenAb,
  type BereitgestellteZeile,
  type Datenbesitz,
} from './datenBesitz'
import type { Zeilenmass } from './seitengroesse'
import { connectTable, disconnectTable, zeilenIndexVon } from './seRuntime'
import { meldeKettenFehler, runEvent } from '../shared/seAktionen'
import { zeigtEchteDaten } from './suche'
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

  // Erfassungszeile an -> die Kette eines Knopfs darf „Wert aus
  // Erfassungszelle" lesen; der Export schreibt dafuer data-ff-block-id.
  static readonly kannErfassen: ErfassungsFaehigkeit = {
    wenn: { attributeName: 'erfassung', equals: 'ja' },
  }

  static readonly blockEvents = [
    { key: 'onRowClick', name: 'Zeile gewählt' },
  ]

  static readonly listenBindung: ListenBindung = SPALTEN_BINDUNG
  static readonly defaultProps = {
    width: 'fill',
    source: '',
    spalten: standardSpalten(),
    suche: 'ja',

    erfassung: 'nein',

    schlank: 'nein',

    kopfzeile: 'ja',

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

  @property() erfassung = 'nein'

  @property() schlank = 'nein'

  @property() kopfzeile = 'ja'

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

  private _besitz: Datenbesitz = 'softengine'

  // Tipp-Zustand + erfasste Zeilen; sie ueberleben jeden Daten-Push und
  // fallen nur mit dem Zweckwechsel oder dem Ketten-Lauf des Knopfs.
  private _erfassung = new ErfassungsAnschluss()

  get besitz(): Datenbesitz {
    return this._besitz
  }

  set besitz(neu: Datenbesitz) {
    if (neu === this._besitz) return
    this._besitz = neu
    this.setzeAbgeleitetesZurueck()
    if (this.isConnected) {
      if (neu === 'provided') disconnectTable(this)
      else connectTable(this)
    }
    this.requestUpdate()
  }

  set bereitgestellteZeilen(zeilen: readonly BereitgestellteZeile[]) {
    const abgeleitet = leiteZeilenAb(zeilen)
    this.rohzeilen = abgeleitet.rohzeilen
    this.datenzeilen = abgeleitet.datenzeilen
    this.zusatzzeilen = abgeleitet.zusatzzeilen
    this.datenGeliefert = true
    this.auswahlIndex = -1
    this.durchAuswahlGefiltert = false
    this._seite = 0
    this._mass = null
    this._taktGemessen = 0
    this.requestUpdate()
  }

  private setzeAbgeleitetesZurueck(): void {
    this.rohzeilen = []
    this.datenzeilen = []
    this.zusatzzeilen = []
    this.datenGeliefert = false
    this.auswahlIndex = -1
    this.durchAuswahlGefiltert = false
    this._suchtext = ''
    this._sortSpalte = -1
    this._sortAuf = true
    this._seite = 0
    this._mass = null
    this._taktGemessen = 0
    this._fokusZeile = null
    this._fokusHolen = false
    this._erfassung.zuruecksetzen()
  }

  // Der Laufzeit-Vertrag der Faehigkeit kannErfassen (ErfassungsTraegerElement
  // in core/blocks/BlockDefinition.ts): die Kette am Knopf liest die Zeilen
  // ueber data-ff-block-id und leert sie nach dem Lauf.
  get erfassteZeilen(): readonly (readonly string[])[] {
    return this._erfassung.zeilen
  }

  erfassungLeeren(): void {
    if (this._erfassung.leeren()) this.requestUpdate()
  }

  // Enter am Zeilenende (G4): die Zeile bleibt stehen, die Erfassung rueckt
  // tiefer, der Cursor auf die erste Zelle. Geschrieben wird hier NICHTS.
  private erfasseZeile(): void {
    if (!this._erfassung.erfasse(this.erfassungsUmfeld())) return
    this.requestUpdate()
    this.fokussiereErfassungsZelle(0)
  }

  fokussiereSuche(): boolean {
    const feld = this.shadowRoot?.querySelector<HTMLInputElement>('.suchzeile input')
    if (!feld) return false
    feld.focus()
    return true
  }

  private get hatQuelle(): boolean {
    return this._besitz === 'provided'
      ? true
      : zeigtEchteDaten(this.hasAttribute('data-ff-editor'), this.source)
  }

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
    runEvent(this, 'onRowClick', { PINDEX: zeilenIndexVon(this, rohzeile) })
      .catch(meldeKettenFehler)
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

  private get erfassungAn(): boolean {
    return this.erfassung === 'ja'
  }

  // Die Fusszeile nur, wenn sie etwas zu sagen hat: geblaettert werden muss
  // oder ein Filter greift (G5). Sonst gehoert der Platz den Zeilen.
  private fussNoetig(seiten: number): boolean {
    return seiten > 1 || this._suchtext.trim() !== '' || this.durchAuswahlGefiltert
  }

  // Der Baustein haelt nur den Stand; was die Zellen tun, steht in
  // erfassungsBedienung — sonst laeuft diese Datei ueber ihren Deckel.
  private erfassungsWirt(): ErfassungsWirt {
    return {
      baustein: this,
      lauf: this._erfassung.lauf,
      umfeld: () => this.erfassungsUmfeld(),
      melde: () => this.requestUpdate(),
      fokussiere: (index) => this.fokussiereErfassungsZelle(index),
      erfasseZeile: () => this.erfasseZeile(),
    }
  }

  // Erst NACH dem Rendern fokussieren: die Zellen zeigen dann den neuen
  // Stand, und das Ziel existiert sicher.
  private fokussiereErfassungsZelle(index: number): void {
    void this.updateComplete.then(() => {
      const felder = this.shadowRoot?.querySelectorAll<HTMLInputElement>('.zeile.erfassung .erf-eingabe')
      felder?.[index]?.focus()
    })
  }

  private erfassungsUmfeld(): ErfassungsUmfeld {
    return this._erfassung.umfeld(this, this.spaltenListe(), this.source)
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
    if (this._besitz === 'softengine') connectTable(this)
    this.beobachte()
  }

  protected override firstUpdated(): void {
    this.beobachte()
  }

  // Wie beim Nachschlage-Feld (G1): einmal je Darstellung berechnet, damit
  // Tastatur und Anzeige DENSELBEN Stand sehen. Im Editor gibt es keine Daten
  // und keine Liste (Regel 7).
  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed)
    if (!this.erfassungAn || this.hasAttribute('data-ff-editor')) return
    this._erfassung.lauf.aktualisiereVorschlaege(this.erfassungsUmfeld())
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
    schliesseNachschlagenFuer(this)
    disconnectTable(this)
  }

  static override styles = [
    BasicBlock.styles,
    chipStyles,
    leerStil,
    tabelleStil,
    vorschlagStil,
    erfassungStil,
  ]

  override render(): TemplateResult {
    const spalten = this.spaltenListe()
    const stop = (e: Event): void => e.stopPropagation()

    const ansicht = tabelleAnsicht({
      spalten,
      hatQuelle: this.hatQuelle,
      datenGeliefert: this.datenGeliefert,
      datenzeilen: this.datenzeilen,
      suchtext: this._suchtext,
      sortSpalte: this._sortSpalte,
      sortAuf: this._sortAuf,
      wunschSeite: this._seite,
      gemessen: this._mass,
      erfassungAn: this.erfassungAn,
      erfassteAnzahl: this._erfassung.zeilen.length,
    })
    return html`<div class=${this.schlank === 'ja' ? 'tabelle schlank' : 'tabelle'} style=${styleMap({
      '--takt': `${ansicht.takt}px`,
      '--zeilen-hoehe': `${ansicht.zeilenHoehe}px`,
    })}>
      ${spaltenSteuerung(() => this.spaltenListe(), (l) => this.aendere(l), stop)}
      ${tabelleKoerper({
        spalten,
        cols: ansicht.cols,
        editable: this.editable,
        imEditor: this.hasAttribute('data-ff-editor'),
        zeigeKopf: this.kopfzeile === 'ja',
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
        erfasste: this._erfassung.zeilen,
        erfassung: this.erfassungAn
          ? erfassungsZeileFuer(
              this.erfassungsWirt(),
              ansicht.cols,
              // Kein Lineal mehr uebrig heisst: die Zeile ist die letzte im
              // Rumpf, unter ihr ist kein Platz fuer die Liste.
              (ansicht.linealTakte ?? 1) <= 0,
            )
          : nothing,
      }, {
        setzeSuchtext: (text) => this.setzeSuchtext(text),
        dblklickKopf: (e, i) => {
          if (!this.editable) return

          feldPickerAbbestellen(this)
          benenneSpalteUm(e, i, () => this.spaltenListe(), (l) => this.aendere(l))
        },
        klickKopf: (e, i) => {
          if (this.editable) {
            oeffneFeldPicker(this, e, {
              prop: TabelleBlock.listenBindung.prop,
              index: i,
              liste: () => this.spaltenListe(),
            })
          }
          this.klickSortiere(i)
        },
        aktiviereZeile: (rohIndex, ansichtIndex) => this.aktiviereZeile(rohIndex, ansichtIndex),
      })}
      ${ ''}
      ${ansicht.leer || !this.fussNoetig(ansicht.seiten) ? nothing : tabelleFuss({
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
      })}
    </div>`
  }
}

BasicBlock.defineAndRegister(TabelleBlock)
