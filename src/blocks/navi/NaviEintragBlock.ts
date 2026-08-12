// NaviEintragBlock (N2)
// EIN Eintrag der Navi: ein farbiger Punkt und der Klarname der Seite, auf
// die er zeigt. Er erscheint nicht in der Bibliothek — Eintraege entstehen
// ueber „+ Eintrag" an der Navi (dieselbe Bauart wie „+ Spalte" am Board).
//
// Zwei Props, und die Trennung ist der Punkt (Regel 3):
//   seite      = die id der Seite im EDITOR-Baum. Technikwert, waehlbar im
//                Inspector (kind 'seite'), reist NIE in den Export
//                (nurImEditor) — die laufende Maske kennt keine Editor-ids.
//   seitename  = der KLARNAME derselben Seite. Er ist das SICHTBARE am
//                Eintrag UND der Adressweg der Laufzeit: sie sucht die
//                Ansicht mit diesem Namen, genau wie ein Popup-Schritt sein
//                Fenster sucht (blocks/shared/seAktionen). Leer = Hauptseite.
// Der Inspector setzt beide zusammen in EINEM Undo-Schritt (PropControl).
//
// Wird die Ansicht geloescht, BLEIBT der Eintrag stehen und behaelt seine
// Beschriftung (Entscheidung N2, 2026-08-12): kein Baustein verschwindet,
// weil woanders etwas geloescht wurde, und es gibt keine Warn-Anzeige
// (Zusage 2026-08-10). Sein Klick zeigt dann die Hauptseite.
//
// Der Klick selbst gehoert nicht dem Baustein: er meldet nur
// SEITEN_WECHSEL_EVENT (composed) — im Editor wechselt die Arbeitsflaeche
// darauf die offene Seite, in der Maske blendet die Navi-Laufzeit um.
// Dieselbe Bauart wie das X am Dialograhmen.
//
// Aussehen aus dem Optik-Vorbild (designsprache/mix-fellnase-empfang.html,
// .navi-eintrag): Hover mildert auf, der aktive Eintrag traegt Koralle.
// Ausschliesslich Masken-Tokens, keine Farb-Literale.

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { SEITEN_WECHSEL_EVENT, type SeitenWechselDetail } from '../../core/blocks/seitenWechsel'

// Die waehlbaren Punkt-Farben. Klarname sichtbar, Token unsichtbar — und
// bewusst dieselben Toene, aus denen die ganze Maske gebaut ist (die
// Statusfarben-Tokens), damit eine Navi nie aus der Palette faellt.
const TOENE: readonly { wert: string; name: string }[] = [
  { wert: 'sonne', name: 'Sonnengelb' },
  { wert: 'salbei', name: 'Salbeigrün' },
  { wert: 'himmel', name: 'Himmelblau' },
  { wert: 'flieder', name: 'Flieder' },
  { wert: 'koralle', name: 'Koralle' },
]

export class NaviEintragBlock extends BasicBlock {
  static readonly blockType = 'navi-eintrag'
  static readonly tagName = 'ff-navi-eintrag'
  static readonly displayName = 'Navi-Eintrag'
  static readonly category: BlockCategory = 'layout'
  static readonly acceptsChildren = false
  static readonly showInPalette = false
  static readonly allowedParentTypes = ['navi']
  static readonly resizableWidth = false
  static readonly defaultProps = {
    seite: '',
    seitename: '',
    ton: 'sonne',
  }

  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'seite',
      name: 'Seite',
      description: 'Welche Seite dieser Maske der Eintrag zeigt.',
      kind: 'seite',
      klarnameProp: 'seitename',
      nurImEditor: true,
    },
    {
      attributeName: 'ton',
      name: 'Farbe',
      description: 'Farbe des Punkts vor dem Namen.',
      kind: 'select',
      options: TOENE.map((t) => ({ value: t.wert, label: t.name })),
    },
  ]

  static override styles = [
    BasicBlock.styles,
    css`
      :host {
        --ton: var(--se-amber);
        display: flex;
        align-items: center;
        gap: 10px;
        box-sizing: border-box;
        padding: 9px 12px;
        border-radius: var(--se-r-md);
        font-family: var(--se-font);
        font-size: var(--se-fs);
        font-weight: 600;
        color: var(--se-bg);
        cursor: pointer;
      }
      :host(:hover) { background: var(--se-muted); }
      /* Der aktive Eintrag: genau EINER traegt ihn, gesetzt von der Navi. */
      :host([aktiv]) { background: var(--se-accent); color: var(--se-panel); }
      .punkt {
        width: 8px;
        height: 8px;
        flex: none;
        background: var(--ton);
      }
      :host([aktiv]) .punkt { background: var(--se-panel); }
      /* Die waehlbaren Toene: je Wert genau ein Masken-Token. Der Grundwert
         steht oben am :host und ist DERSELBE wie 'sonne' — der Export laesst
         Standardwerte weg, ein Eintrag im Standardton traegt also gar kein
         ton-Attribut, und ohne Grundwert waere sein Punkt unsichtbar. */
      :host([ton='sonne'])   { --ton: var(--se-amber); }
      :host([ton='salbei'])  { --ton: var(--se-green); }
      :host([ton='himmel'])  { --ton: var(--se-blue); }
      :host([ton='flieder']) { --ton: var(--se-violet); }
      :host([ton='koralle']) { --ton: var(--se-accent); }
      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ]

  @property() seite = ''
  @property() seitename = ''
  @property({ reflect: true }) ton = 'sonne'

  constructor() {
    super()
    this.addEventListener('click', () => this.melde())
  }

  // Der Baustein entscheidet NICHT, was ein Klick bewirkt — er meldet ihn.
  // Wer darauf hoert, haengt am Ort (Editor-Flaeche bzw. Navi-Laufzeit).
  private melde(): void {
    const detail: SeitenWechselDetail = {
      ansicht: this.seitename,
      seiteId: this.seite,
    }
    this.dispatchEvent(new CustomEvent<SeitenWechselDetail>(SEITEN_WECHSEL_EVENT, {
      detail,
      bubbles: true,
      composed: true,
    }))
  }

  override render(): TemplateResult {
    // Ohne gewaehlte Seite steht der Eintrag mit Strich da — der Editor
    // erfindet keine Daten (Regel 7), und der Bauer sieht, dass hier noch
    // etwas fehlt.
    return html`<span class="punkt"></span>
      <span class="name">${this.seitename === '' ? '—' : this.seitename}</span>`
  }
}

BasicBlock.defineAndRegister(NaviEintragBlock)
