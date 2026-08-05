// FormFeldBlock
// Eingabe-Baustein "Formularfeld" — NEUBAU nach der ECHTEN Referenz
// (behandlung/index.basis.source.html): alle Eingabeelemente teilen EINE
// Optik-Klasse `.ctrl` (1px-Rahmen var(--line), Panel-Flaeche, kantiger
// Radius, Fokus = Hausfarbe; Z. 205-210 der Referenz). Feldtypen der
// Referenz: Text, Zahl (Menge), Mehrzeilig (Doku), Auswahl (Zimmer),
// Datum, Ankreuzfeld (Impfung).
//
// KEIN Label ueber dem Feld (Nutzer-Korrektur 2026-07-14): der Text steht
// IM Feld — als Platzhalter (grau, verschwindet beim Tippen) bzw. beim
// Ankreuzfeld als Beschriftung neben dem Kaestchen. EINE Text-Prop
// (`placeholder`) fuer beides, per Doppelklick DIREKT im Feld aenderbar
// (Inline-Edit, WYSIWYG). Der Platzhalter ist ein eigenes Element mit
// Verschwinde-Logik (statt native placeholder-Attribut), damit derselbe
// Text in Editor UND Maske identisch sitzt und im Editor editierbar ist;
// die Maske blendet ihn beim Tippen bzw. nach einer Auswahl aus (input-/
// change-Event — die Komponente lebt in beiden Welten, 1 Render-Quelle).
// Ein GEBUNDENES Feld zeigt ihn in der Maske gar nicht — dort stehen Daten,
// und leer bleibt leer (Regel im CSS bei `.ph`, SE-Echttest 2026-08-04).
//
// Die Datenanbindung ist registry-getrieben: das Feld deklariert Quelle,
// Bindungsroute und bindbare Wert-Stelle. Die Export-Runtime liest die erste
// Zeile der gewählten Quelle — oder, wenn das Feld einem Auswahl-Geber folgt,
// AUSSCHLIESSLICH die zur angeklickten Zeile passende (kannAuswahlFolgen,
// s. u.: ohne Auswahl bleibt das Feld leer); Schreiben nach SoftEngine bleibt
// eine sichtbar konfigurierte Aktionskette am Ereignis „Wert geändert".
//
// Inspector: nur Feldtyp + Auswahl-Optionen (Klarnamen sichtbar,
// Technikwerte text/number/... unsichtbar). Im EDITOR ist das
// Eingabeelement bewusst nicht bedienbar (pointer-events, gated ueber
// data-ff-editor): im Editor wird gestaltet, ausgefuellt wird in der
// Maske — der Export bleibt unberuehrt.
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*), keine Literale,
// keine Fallbacks; strukturelle Groessen (Padding, Positionen) als
// Literale wie bei Karte/Spalte.

import { html, nothing, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type {
  ActionValueSpotsFor,
  BindableSpotsFor,
  SatzWahl,
} from '../../core/blocks/BlockDefinition'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { geberIdVon, setzeAuswahl } from '../shared/auswahl'
import {
  connectField,
  dateValueToInput,
  disconnectField,
  inputValueToDate,
} from './feldRuntime'
import { feldStil } from './feldStil'
import { oeffneNachschlagen } from './nachschlagen'

// Feldtypen (Technikwerte) — der Bediener sieht nur die Klarnamen unten.
const FELD_TYPEN = ['text', 'number', 'textarea', 'select', 'date', 'checkbox', 'nachschlagen'] as const
type FeldTyp = (typeof FELD_TYPEN)[number]

function coerceFeldTyp(v: unknown): FeldTyp {
  return FELD_TYPEN.includes(v as FeldTyp) ? (v as FeldTyp) : 'text'
}

// Typen mit sichtbarem Platzhalter IM Feld. Beim Select liegt darunter eine
// leere, deaktivierte Startoption: der Platzhalter beschreibt das Feld, ist
// aber selbst nie ein auswählbarer Wert.
const MIT_PLATZHALTER: readonly FeldTyp[] = ['text', 'number', 'textarea', 'select', 'nachschlagen']

export class FormFeldBlock extends BasicBlock {
  static readonly blockType = 'formfeld'
  static readonly tagName = 'ff-formfeld'
  static readonly displayName = 'Formularfeld'
  static readonly category: BlockCategory = 'eingabe'
  static readonly acceptsDataSource = true
  // Folgt der Auswahl eines Gebers (Tabelle/Kanban): klickt der Bediener in
  // der laufenden Maske eine Zeile an, zeigt das Feld den Wert der dazu
  // PASSENDEN Zeile seiner eigenen Quelle statt stur der ersten — und ohne
  // Auswahl gar nichts. Nur wo der Bauer die Folge einstellt: Felder ohne
  // sie zeigen weiter die erste Zeile, bestehende Masken bleiben gleich.
  static readonly kannAuswahlFolgen = true
  // Und es GIBT selbst einen Satz ab — aber nur als NACHSCHLAGE-Feld: dort
  // greift der Bediener im Fenster einen Satz heraus (bei jedem anderen
  // Feldtyp tippt er bloss). Der Satz stammt aus der Nachschlage-Quelle, nicht
  // aus der eigenen — darum `quelleProp`. Ob das Feld damit wirklich
  // Auswahl-Geber IST, leitet istAuswahlGeber daraus ab: ohne eingestellte
  // Nachschlage-Quelle gibt es kein Fenster und nichts abzugeben.
  static readonly satzWahl: SatzWahl = {
    quelleProp: 'nachschlagQuelle',
    wenn: { attributeName: 'fieldType', equals: 'nachschlagen' },
  }
  static readonly bindableSpots: BindableSpotsFor<typeof FormFeldBlock.defaultProps> = [{ prop: 'value', label: 'Wert' }]
  // Aktueller Eingabewert - ausdruecklich auch ohne Datenquellen-Bindung.
  static readonly actionValueSpots: ActionValueSpotsFor<typeof FormFeldBlock.defaultProps> = [
    { prop: 'value', label: 'Wert' },
  ]
  static readonly blockEvents = [{ key: 'onChange', name: 'Wert geändert' }]
  // Standardbreite fest (240px) — der Breiten-Anfasser bleibt aktiv,
  // Doppelklick auf den Anfasser stellt den Standard wieder her.
  static readonly defaultProps = {
    width: 240,
    fieldType: 'text',
    placeholder: 'Feldname',
    options: '',
    source: '',
    value: '',
    valueField: '',
    // Nachschlagen: Quelle + zwei Felder (Technikwerte) und deren Klarnamen
    // als Spaltenkoepfe im Fenster (klarnameProp, Regel 3 — die Maske kennt
    // sonst nur Feldcodes). Alles leer = kein Nachschlagen.
    nachschlagQuelle: '',
    anzeigeFeld: '',
    anzeigeTitel: '',
    speicherFeld: '',
    speicherTitel: '',
  }

  // Raster-Startgröße auf der Maskenfläche (kalibriert im Browser 2026-07-23):
  // ein Eingabefeld, Zelle eng am Inhalt.
  static readonly raster = { startW: 6, startH: 2, minW: 2, minH: 2 }

  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'fieldType',
      name: 'Feldtyp',
      description: 'Welche Art Eingabe das Feld annimmt.',      kind: 'select',
      options: [
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Zahl' },
        { value: 'textarea', label: 'Mehrzeilig' },
        { value: 'select', label: 'Auswahl' },
        { value: 'date', label: 'Datum' },
        { value: 'checkbox', label: 'Ankreuzfeld' },
        { value: 'nachschlagen', label: 'Nachschlagen' },
      ],
    },
    {
      attributeName: 'options',
      name: 'Auswahl-Optionen',
      description: 'Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.',      kind: 'text',
      visibleWhen: { attributeName: 'fieldType', equals: 'select' },
    },
    {
      attributeName: 'nachschlagQuelle',
      name: 'Quelle',
      description: 'Nur bei Feldtyp "Nachschlagen": aus dieser Datenquelle wählt der Bediener eine Zeile.',
      kind: 'quelle',
      visibleWhen: { attributeName: 'fieldType', equals: 'nachschlagen' },
    },
    {
      attributeName: 'anzeigeFeld',
      name: 'Angezeigt wird',
      description: 'Feld der Nachschlage-Quelle, dessen Wert der Bediener sieht (z. B. der Name).',
      kind: 'field',
      quelleProp: 'nachschlagQuelle',
      klarnameProp: 'anzeigeTitel',
      visibleWhen: { attributeName: 'fieldType', equals: 'nachschlagen' },
    },
    {
      attributeName: 'speicherFeld',
      name: 'Gespeichert wird',
      description: 'Feld der Nachschlage-Quelle, dessen Wert die Maske sich merkt und die Kette "Wert geändert" weitergibt (z. B. die Nummer).',
      kind: 'field',
      quelleProp: 'nachschlagQuelle',
      klarnameProp: 'speicherTitel',
      visibleWhen: { attributeName: 'fieldType', equals: 'nachschlagen' },
    },
    {
      attributeName: 'valueField',
      name: 'Feld',
      description: 'Feld der angeschlossenen Datenquelle, dessen Wert angezeigt und lokal aktualisiert wird.',      kind: 'field',
      // NICHT am Nachschlage-Feld: dort ENTSTEHT der Wert durch die Auswahl
      // im Fenster. Eine Datenbindung obendrauf ueberschriebe ihn bei jedem
      // SE-Push, waehrend das Feld weiter den Klarwert zeigte — Anzeige und
      // Ketten-Wert liefen still auseinander.
      visibleWhen: { attributeName: 'fieldType', notEquals: 'nachschlagen' },
    },
  ]

  static override styles = [BasicBlock.styles, feldStil]

  @property() fieldType = 'text'
  @property() placeholder = 'Feldname'
  @property() options = ''
  @property() source = ''
  @property() value = ''
  @property() valueField = ''
  @property() nachschlagQuelle = ''
  @property() anzeigeFeld = ''
  @property() anzeigeTitel = ''
  @property() speicherFeld = ''
  @property() speicherTitel = ''

  // Der ANGEZEIGTE Klarwert des Nachschlagens (z. B. „Berger, Anna").
  // @state, kein Bauplan-Wert: er entsteht erst, wenn der Bediener in der
  // Maske eine Zeile uebernimmt — `value` traegt derweil den Technikwert.
  @state() private anzeige = ''

  // Der Haken des Ankreuzfelds. Bewusst @state und NICHT @property: er ist
  // kein Bauplan-Wert und reist nicht in den Export — er entsteht erst, wenn
  // der Bediener in der fertigen Maske klickt. Bis 2026-07-27 hing er allein
  // im DOM (`box.checked` direkt gesetzt); jedes Neuzeichnen loeschte ihn,
  // und der SoftEngine-Daten-Push zeichnet neu — der Bediener hakte an, SE
  // schob Daten, der Haken war weg. Gefunden im Architektur-Review 2026-07-27.
  // Die BINDUNG bleibt weiterhin aus: der SE-Wert-Kontrakt (J/N? 1/0?) ist
  // an keiner echten Maske belegt, und geraten wird nicht (Regel 5).
  @state() private angehakt = false

  private onInput(e: Event): void {
    const t = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    this.value = coerceFeldTyp(this.fieldType) === 'date'
      ? inputValueToDate(t.value)
      : t.value
  }

  // 'change' ist laut DOM-Standard NICHT composed und endet an der
  // Schattengrenze — die Feld-Runtime (Kette „Wert geändert") lauscht aber
  // am Host. Deshalb wird das committete Ändern hier einmal am Host neu
  // ausgelöst ('input' ist composed und braucht das nicht). Belegt durch
  // e2e/formfeld-data.spec.ts — ohne diesen Schritt feuert die Kette nie.
  private onChange(): void {
    this.dispatchEvent(new Event('change'))
  }

  // Der Text IM Feld — Platzhalter bzw. Ankreuzfeld-Beschriftung; per
  // Doppelklick direkt am Feld änderbar (nur bei selektiertem Block,
  // wie jedes Inline-Edit). EIN Template für beide Fälle (N1: der
  // doppelte Zweig aus render() ist hier zusammengezogen).
  private textTpl(cls: string, hidden = false): TemplateResult {
    return html`<span
      class=${cls}
      ?hidden=${hidden}
      data-ff-editable
      @click=${this.onTextClick}
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'placeholder')}
    >${this.placeholder}</span>`
  }

  // N1: Klick auf die Ankreuzfeld-Beschriftung schaltet in der MASKE den
  // Haken — wie unter Windows. Im Editor passiert nichts (dort ist der
  // Text das Umbenennen-Ziel); der Platzhalter (.ph) ist in der Maske
  // klick-durchlässig (pointer-events) und erreicht diesen Handler nie.
  private onTextClick(): void {
    if (this.hasAttribute('data-ff-editor')) return
    this.setzeHaken(!this.angehakt)
  }

  // EIN Weg zum Haken — ob ueber das Kaestchen oder ueber die Beschriftung.
  // Der Zustand liegt im Baustein (ueberlebt das Neuzeichnen), das Kaestchen
  // zeigt ihn nur an. `change` feuert wie bei jedem anderen Feldtyp, damit
  // eine daran gehaengte Aktionskette ausloest.
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
        // Anzeige-Text nur lesbar (gesucht wird im Fenster, nicht im Feld —
        // der Wert ENTSTEHT durch Auswahl, Regel 3: angezeigt wird der
        // Klarwert, gespeichert der Technikwert in `value`). Die Lupe oeffnet
        // das Fenster; im Editor ist sie reine Optik (pointer-events aus).
        return html`<div class="nachschlag">
          <input class="ctrl" type="text" readonly .value=${this.anzeige} />
          <button
            class="lupe"
            type="button"
            aria-label="Nachschlagen"
            title="Nachschlagen"
            @click=${this.onLupe}
          ><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"></circle>
            <line x1="10.4" y1="10.4" x2="14" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>
          </svg></button>
        </div>`
      default:
        // text / number / date teilen das eine Input-Element.
        return html`<input
          class="ctrl"
          type=${typ}
          .value=${typ === 'date' ? dateValueToInput(this.value) : this.value}
          @input=${this.onInput}
          @change=${this.onChange}
        />`
    }
  }

  // Lupe gedrueckt (nur in der MASKE erreichbar): Fenster oeffnen. Die
  // Uebernahme setzt beide Werte und feuert 'change' am Host — daran haengt
  // die Kette „Wert geändert" (feldRuntime), exakt wie bei jedem Feldtyp.
  private onLupe(): void {
    if (this.hasAttribute('data-ff-editor')) return
    oeffneNachschlagen({
      quelleId: this.nachschlagQuelle,
      anzeigeFeld: this.anzeigeFeld,
      speicherFeld: this.speicherFeld,
      anzeigeTitel: this.anzeigeTitel,
      speicherTitel: this.speicherTitel,
      titel: this.placeholder,
      onUebernehmen: (anzeige, wert, satz) => {
        // Ein Satz mit leerem Anzeige-Feld bleibt SICHTBAR uebernommen: dann
        // steht der Wert selbst im Feld. Sonst saehe das Feld leer aus,
        // truege aber einen Technikwert — Auswahl und Nicht-Auswahl waeren
        // nicht zu unterscheiden. Der Wert stand dem Bediener im Fenster
        // ohnehin vor Augen (Wert-Spalte).
        this.anzeige = anzeige !== '' ? anzeige : wert
        this.value = wert
        // Den GANZEN Satz abgeben, damit Folger nach ihm filtern koennen
        // (2026-08-06): das Feld ist Auswahl-Geber, und ein Geber, der in der
        // Liste steht aber nie etwas abgibt, liesse jeden Folger stumm nie
        // filtern (Regel 4). Nicht `waehleAuswahl`: dessen Toggle wuerde den
        // zweimal bestaetigten Kunden wieder abwaehlen — hier ist Uebernehmen
        // immer ein Setzen. Absichtlich KEIN Wiederfinden nach dem SE-Push:
        // der bestaetigte Satz bleibt stehen, so wie der angezeigte Wert.
        setzeAuswahl(geberIdVon(this), satz)
        this.dispatchEvent(new Event('change'))
      },
    })
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
    return html`<div class="feld">
      <div
        class="huelle"
        data-ff-spot="value"
        ?data-ff-bound=${this.valueField !== ''}
      >
        ${this.controlTpl(typ)}
        ${MIT_PLATZHALTER.includes(typ)
          ? this.textTpl(typ === 'select' ? 'ph ph-select' : 'ph', this.value !== '')
          : nothing}
      </div>
    </div>`
  }

  override connectedCallback(): void {
    super.connectedCallback()
    connectField(this)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    disconnectField(this)
  }
}

BasicBlock.defineAndRegister(FormFeldBlock)
