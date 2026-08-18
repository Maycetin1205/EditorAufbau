import { html, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type {
  ActionValueSpotsFor,
  BindableSpotsFor,
  QuellenFaehigkeit,
  SatzWahl,
} from '../../core/blocks/BlockDefinition'
import { geberIdVon, klareAuswahl, setzeAuswahl } from '../shared/auswahl'
import {
  bewegteMarke,
  gueltigeMarke,
  passendeVorschlaege,
  tastenFolge,
  vorschlagListeTpl,
  vorschlagStil,
} from '../shared/vorschlagListe'
import { FELD_EIGENSCHAFTEN } from './feldEigenschaften'
import {
  connectField,
  dateValueToInput,
  disconnectField,
  inputValueToDate,
} from './feldRuntime'
import { feldStil } from './feldStil'
import {
  coerceFeldTyp,
  MIT_PLATZHALTER,
  PH_KLASSE,
  type FeldTyp,
} from './feldTypen'
import {
  automatikSpalten,
  coerceNachschlagSpalten,
  einzigenTrefferFinden,
  type Eintrag,
  FENSTER_BREITE,
  FENSTER_HOEHE,
  folgeBeimVerlassen,
  holeEintraege,
  NACHSCHLAG_SPALTEN_BINDUNG,
  nachschlagFeldTpl,
  oeffneNachschlagen,
  satzPasstZurAuswahl,
  schliesseNachschlagenFuer,
  spaltenStellenTpl,
} from './nachschlagen'
import type { Spalte } from '../tabelle/spalten'

export class FormFeldBlock extends BasicBlock {
  static readonly blockType = 'formfeld'
  static readonly tagName = 'ff-formfeld'
  static readonly displayName = 'Formularfeld'
  static readonly category: BlockCategory = 'eingabe'

  static readonly acceptsDataSource: QuellenFaehigkeit = {
    wenn: { attributeName: 'fieldType', notEquals: 'nachschlagen' },
  }

  static readonly kannAuswahlFolgen = true

  static readonly satzWahl: SatzWahl = {
    quelleProp: 'nachschlagQuelle',
    wenn: { attributeName: 'fieldType', equals: 'nachschlagen' },
  }

  static readonly listenBindung = NACHSCHLAG_SPALTEN_BINDUNG

  static readonly bindableSpots: BindableSpotsFor<typeof FormFeldBlock.defaultProps> = [
    {
      prop: 'value',
      label: 'Wert',
      wenn: { attributeName: 'fieldType', keinesVon: ['checkbox', 'nachschlagen'] satisfies readonly FeldTyp[] },

      vorschauProp: 'placeholder',
    },
  ]

  static readonly actionValueSpots: ActionValueSpotsFor<typeof FormFeldBlock.defaultProps> = [
    { prop: 'value', label: 'Wert' },
  ]
  static readonly blockEvents = [{ key: 'onChange', name: 'Wert geändert' }]

  static readonly defaultProps = {
    width: 240,
    fieldType: 'text',
    placeholder: 'Feldname',
    options: '',
    source: '',
    value: '',
    valueField: '',

    nachschlagQuelle: '',
    speicherFeld: '',
    speicherTitel: '',

    nachschlagSpalten: [] as Spalte[],

    fensterBreite: FENSTER_BREITE,
    fensterHoehe: FENSTER_HOEHE,

    einzigerTreffer: 'nein',
  }

  static readonly raster = { startW: 6, startH: 2, minW: 2, minH: 2 }

  static override readonly customProperties = FELD_EIGENSCHAFTEN

  static override styles = [BasicBlock.styles, feldStil, vorschlagStil]

  @property() fieldType = 'text'
  @property() placeholder = 'Feldname'
  @property() options = ''
  @property() source = ''
  @property() value = ''
  @property() valueField = ''
  @property() nachschlagQuelle = ''
  @property() speicherFeld = ''
  @property() speicherTitel = ''
  @property({
    converter: {
      fromAttribute: (v: string | null): Spalte[] => coerceNachschlagSpalten(v ?? ''),
      toAttribute: (v: Spalte[]): string => JSON.stringify(v),
    },
  })
  nachschlagSpalten: Spalte[] = []
  @property({ type: Number }) fensterBreite = FENSTER_BREITE
  @property({ type: Number }) fensterHoehe = FENSTER_HOEHE
  @property() einzigerTreffer = 'nein'

  @state() private spaltenDialog = false

  @state() private anzeige = ''

  @state() private getippt: string | null = null

  // Welcher Vorschlag Enter uebernehmen wuerde. Jeder Tastendruck setzt sie
  // auf den ersten Treffer zurueck.
  @state() private marke = 0

  // Escape macht die Liste zu, ohne das Getippte anzuruehren; das naechste
  // Zeichen holt sie zurueck.
  @state() private listeZu = false

  // In willUpdate berechnet, damit render() und die Tastatur DENSELBEN Stand
  // sehen — zwei Berechnungen koennten auseinanderlaufen.
  private vorschlaege: Eintrag[] = []

  private satz: unknown = undefined

  @state() private angehakt = false

  @state() private imSteuerelement = false

  private onInput(e: Event): void {
    const t = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    this.value = coerceFeldTyp(this.fieldType) === 'date'
      ? inputValueToDate(t.value)
      : t.value
  }

  private onChange(): void {
    this.dispatchEvent(new Event('change'))
  }

  private textTpl(cls: string, hidden = false): TemplateResult {
    return html`<span
      class=${cls}
      ?hidden=${hidden}
      data-ff-editable
      @click=${this.onTextClick}
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'placeholder')}
    >${this.placeholder}</span>`
  }

  private onTextClick(): void {
    if (this.hasAttribute('data-ff-editor')) return
    this.setzeHaken(!this.angehakt)
  }

  private setzeHaken(an: boolean): void {
    if (this.angehakt === an) return
    this.angehakt = an
    this.dispatchEvent(new Event('change'))
  }

  private controlTpl(typ: FeldTyp): TemplateResult {
    switch (typ) {
      case 'textarea':
        return html`<textarea class="ctrl" .value=${this.value} @input=${this.onInput} @change=${this.onChange}></textarea>`
      case 'select': {
        const eintraege = this.options.split(',').map((o) => o.trim()).filter((o) => o !== '')
        const fremdwert = this.value !== '' && !eintraege.includes(this.value)
        return html`<select class="ctrl" .value=${this.value} @input=${this.onInput} @change=${this.onChange}>
          <option value="" disabled hidden></option>
          ${fremdwert ? html`<option value=${this.value} hidden>${this.value}</option>` : nothing}
          ${eintraege.length === 0
            ? html`<option disabled>(keine Optionen)</option>`
            : eintraege.map((o) => html`<option value=${o}>${o}</option>`)}
        </select>`
      }
      case 'nachschlagen':

        return nachschlagFeldTpl({
          wert: this.getippt ?? this.anzeige,
          onTippen: (wert) => {
            this.getippt = wert
            this.marke = 0
            this.listeZu = false
          },
          onTaste: (e) => this.onNachschlagTaste(e),
          onVerlassen: () => this.onNachschlagVerlassen(),
          onLupe: () => this.onLupe(),
          liste: this.vorschlaege.length === 0 ? nothing : vorschlagListeTpl({
            eintraege: this.vorschlaege,
            marke: this.marke,
            onWaehlen: (i) => this.uebernimmVorschlag(i),
            onMarke: (i) => { this.marke = i },
          }),
        })
      default:

        return html`<input
          class="ctrl"
          type=${typ}
          .value=${typ === 'date' ? dateValueToInput(this.value) : this.value}
          @input=${this.onInput}
          @change=${this.onChange}
          @focus=${() => { this.imSteuerelement = true }}
          @blur=${() => { this.imSteuerelement = false }}
        />`
    }
  }

  private onLupe(): void {
    if (this.hasAttribute('data-ff-editor')) {
      // Editor-Weg: dasselbe Fenster, aber zum EINSTELLEN der Spalten.
      this.spaltenDialog = true
      return
    }
    oeffneNachschlagen({
      el: this,
      quelleId: this.nachschlagQuelle,
      speicherFeld: this.speicherFeld,
      speicherTitel: this.speicherTitel,
      spalten: this.nachschlagSpalten,
      titel: this.placeholder,
      breite: this.fensterBreite,
      hoehe: this.fensterHoehe,

      onUebernehmen: (anzeige, wert, satz) => this.uebernimmUndMelde(anzeige, wert, satz),
    })
  }

  // Der Startpunkt im Einstell-Fenster: die gespeicherten Spalten, sonst
  // der heutige Automatik-Stand als konkrete Zeilen.
  private spaltenEffektiv(): Spalte[] {
    const eigene = coerceNachschlagSpalten(this.nachschlagSpalten)
    if (eigene.length > 0) return eigene
    return automatikSpalten({
      speicherFeld: this.speicherFeld,
      speicherTitel: this.speicherTitel,
    })
  }

  // Der EINE Weg, mit dem dieser Baustein eine Eigenschaft an den Editor
  // meldet. `geste` gesetzt: der Editor klammert alles von 'beginn' bis
  // 'ende' zu einem Undo-Schritt (Ziehen).
  private meldeProp(attr: string, value: unknown, geste?: 'beginn' | 'ende'): void {
    this.dispatchEvent(new CustomEvent('ff-prop-change', {
      detail: { attr, value, ...(geste === undefined ? {} : { geste }) },
      bubbles: true,
      composed: true,
    }))
  }

  private spaltenDialogTpl(): TemplateResult {
    return spaltenStellenTpl({
      titel: this.placeholder,
      spalten: this.spaltenEffektiv(),
      breite: this.fensterBreite,
      hoehe: this.fensterHoehe,
      onGroesse: (detail) => {
        // Der Rahmen aendert sich nicht selbst: der Editor speichert und
        // gibt die neue Groesse als Property zurueck. `geste` klammert den
        // ganzen Zug zu EINEM Undo-Schritt.
        const attr = detail.achse === 'breite' ? 'fensterBreite' : 'fensterHoehe'
        if (detail.geste === 'standard') {
          this.meldeProp(attr, FormFeldBlock.defaultProps[attr])
          return
        }
        this.meldeProp(
          attr,
          detail.wert,
          detail.geste === 'laeuft' ? undefined : detail.geste,
        )
      },
      onAendern: (spalten) => {
        // Vom Baustein selbst gemeldet, damit der Editor sie als normale
        // Eigenschafts-Aenderung speichert (Undo inklusive).
        this.meldeProp('nachschlagSpalten', spalten)
      },
      onFeldWahl: (detail) => {
        // detail traegt die ANGEZEIGTE Liste mit (auch den Automatik-Stand):
        // der Editor braucht sie, solange nachschlagSpalten selbst leer ist.
        this.dispatchEvent(new CustomEvent('ff-listen-bind', {
          detail: { prop: 'nachschlagSpalten', ...detail },
          bubbles: true,
          composed: true,
        }))
      },
      onSchliessen: () => { this.spaltenDialog = false },
    })
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed)
    // Der Einstell-Dialog gehoert zum Typ „nachschlagen" — beim Typwechsel
    // bliebe er sonst offen (oder spraenge beim Rueckwechsel wieder auf).
    if (changed.has('fieldType') && coerceFeldTyp(this.fieldType) !== 'nachschlagen') {
      this.spaltenDialog = false
    }
    this.vorschlaege = this.berechneVorschlaege()
    this.marke = gueltigeMarke(this.marke, this.vorschlaege.length)
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed)
    // Die Liste haengt unten aus dem Baustein heraus. Raster-Kinder stapeln
    // in DOM-Reihenfolge, also muss dieses Feld solange ueber seinen
    // Nachbarn liegen — sonst verschwindet die Liste unter dem naechsten
    // Baustein (der Stil dazu steht in feldStil).
    this.toggleAttribute('data-ff-liste', this.vorschlaege.length > 0)
  }

  // Die Vorschlaege kommen aus DERSELBEN Quelle wie das grosse Fenster
  // (holeEintraege: Quelle, Spalten, Folge-Auswahl) — nur gefiltert und auf
  // acht gekuerzt. Fehlt die Quelle oder „Gespeichert wird", bleibt die Liste
  // still leer: eine Meldung bei jedem Tastendruck waere unbrauchbar.
  private berechneVorschlaege(): Eintrag[] {
    if (this.getippt === null || this.listeZu) return []
    if (coerceFeldTyp(this.fieldType) !== 'nachschlagen') return []
    // Im Editor gibt es keine Daten und keine Liste (Regel 7).
    if (this.hasAttribute('data-ff-editor')) return []
    const ergebnis = holeEintraege({
      el: this,
      quelleId: this.nachschlagQuelle,
      speicherFeld: this.speicherFeld,
      spalten: this.nachschlagSpalten,
    })
    return ergebnis.ok ? passendeVorschlaege(ergebnis.eintraege, this.getippt) : []
  }

  // Escape kommt hier NICHT an, wenn ein Dialograhmen mit escape-schliesst
  // offen ist — der hoert am document in der Abfang-Phase; ein
  // stopPropagation hier waere zu spaet und wuerde Sicherheit vortaeuschen.
  private onNachschlagTaste(e: KeyboardEvent): void {
    if (this.hasAttribute('data-ff-editor')) return
    const anzahl = this.vorschlaege.length
    const folge = tastenFolge(e.key, {
      listeOffen: anzahl > 0,
      feldLeer: (this.getippt ?? this.anzeige) === '',
    })
    if (folge === 'nichts') {
      // Enter darf trotzdem kein Formular abschicken.
      if (e.key === 'Enter') e.preventDefault()
      return
    }
    e.preventDefault()
    if (folge === 'marke-hoch') this.marke = bewegteMarke(this.marke, anzahl, -1)
    else if (folge === 'marke-runter') this.marke = bewegteMarke(this.marke, anzahl, 1)
    else if (folge === 'uebernehmen') this.uebernimmVorschlag(this.marke)
    else if (folge === 'liste-zu') this.listeZu = true
    else this.onLupe()
  }

  private uebernimmVorschlag(index: number): void {
    const treffer = this.vorschlaege[index]
    if (!treffer) return
    this.uebernimmUndMelde(treffer.anzeige, treffer.wert, treffer.satz)
  }

  private leereNachschlagen(): void {
    this.satz = undefined
    this.anzeige = ''
    this.value = ''
    klareAuswahl(geberIdVon(this))
  }

  // Der EINE Uebernahme-Weg fuer den Bediener: Zeilenklick im grossen
  // Fenster und Wahl in der Vorschlagsliste landen beide hier (G1). Er
  // raeumt das Getippte weg, damit im Feld der bestaetigte Text steht.
  private uebernimmUndMelde(anzeige: string, wert: string, satz: unknown): void {
    this.getippt = null
    this.listeZu = false
    this.marke = 0
    this.uebernimmSatz(anzeige, wert, satz)
    this.dispatchEvent(new Event('change'))
  }

  private uebernimmSatz(anzeige: string, wert: string, satz: unknown): void {
    this.anzeige = anzeige !== '' ? anzeige : wert
    this.value = wert
    this.satz = satz

    setzeAuswahl(geberIdVon(this), satz)
  }

  private onNachschlagVerlassen(): void {
    if (this.hasAttribute('data-ff-editor')) return
    const folge = folgeBeimVerlassen(this.getippt ?? this.anzeige, this.anzeige, this.value)
    this.getippt = null
    this.listeZu = false
    this.marke = 0
    if (folge !== 'leeren') return
    this.leereNachschlagen()
    this.dispatchEvent(new Event('change'))
  }

  pruefeEigenenWert(): void {
    if (coerceFeldTyp(this.fieldType) !== 'nachschlagen') return
    // Trifft der Daten-Push erst nach dem ersten Tastendruck ein, muss die
    // offene Liste nachziehen — sie entsteht in willUpdate.
    if (this.getippt !== null) this.requestUpdate()
    if (this.satz !== undefined && !satzPasstZurAuswahl(this, this.satz)) {
      this.leereNachschlagen()
    }
    this.uebernimmEinzigenTreffer()
  }

  private uebernimmEinzigenTreffer(): void {
    if (this.einzigerTreffer !== 'ja') return
    const ergebnis = holeEintraege({
      el: this,
      quelleId: this.nachschlagQuelle,
      speicherFeld: this.speicherFeld,
      spalten: this.nachschlagSpalten,
    })
    if (!ergebnis.ok) return
    const treffer = einzigenTrefferFinden(ergebnis.eintraege, this.satz === undefined)
    if (treffer) this.uebernimmSatz(treffer.anzeige, treffer.wert, treffer.satz)
  }

  override render(): TemplateResult {
    const typ = coerceFeldTyp(this.fieldType)
    if (typ === 'checkbox') {
      return html`<div class="feld">
        <div class="zeile">
          <input
            class="ctrl"
            type="checkbox"
            .checked=${this.angehakt}
            @change=${(e: Event) => this.setzeHaken((e.target as HTMLInputElement).checked)}
          />
          ${this.textTpl('text')}
        </div>
      </div>`
    }

    const wertBindbar = typ !== 'nachschlagen'

    const imFeld = wertBindbar ? this.value : (this.getippt ?? this.anzeige)

    const leer = imFeld === ''

    const huelleKlassen = `huelle${leer ? ' leer' : ''}${this.imSteuerelement ? ' tippt' : ''}`
    return html`<div class="feld">
      <div
        class=${huelleKlassen}
        data-ff-spot=${wertBindbar ? 'value' : nothing}
        ?data-ff-bound=${wertBindbar && this.valueField !== ''}
      >
        ${this.controlTpl(typ)}
        ${MIT_PLATZHALTER.includes(typ)
          ? this.textTpl(`ph ${PH_KLASSE[typ] ?? ''}`.trim(), !leer)
          : nothing}
      </div>
      ${this.spaltenDialog && this.hasAttribute('data-ff-editor')
        ? this.spaltenDialogTpl()
        : nothing}
    </div>`
  }

  override connectedCallback(): void {
    super.connectedCallback()
    connectField(this)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    disconnectField(this)
    schliesseNachschlagenFuer(this)
  }
}

BasicBlock.defineAndRegister(FormFeldBlock)
