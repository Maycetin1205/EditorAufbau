// TextBlock
// Statisches Anzeige-Atom "Text": zeigt statischen Text an. EIN Bibliotheks-
// eintrag; die Optik steuert die Eigenschaft `groesse` (Nutzer-Entscheidung
// 2026-07-21: „ich kann Text auch als Ueberschrift nehmen, wenn die
// Schriftgroesse einstellbar ist" — deshalb KEIN zweiter Baustein, keine
// Art-Umschaltung). Groessen (Klarnamen sichtbar, Regel 3):
//   - "Ueberschrift": gross + fett (Massstab = Abschnitts-Titel der chef-maske)
//   - "Normal":       normaler Fliesstext (--se-fs)
//   - "Klein":        Hinweistext, gedaempft (--se-muted)
//
// Der Text wird per Doppelklick DIREKT am Ding bearbeitet (Inline-Edit,
// WYSIWYG — Muster Schaltflaechen-Beschriftung); der Default-Text ist
// Platzhalter-Inhalt zum Ueberschreiben, keine erfundenen Daten (Regel 7).
//
// Keine Datenbindung, keine Ereignisse. Aussehen AUSSCHLIESSLICH aus
// Masken-Tokens (--se-*); strukturelle Groessen als Literale wie bei Button.

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

// Groesse (Technikwerte) — der Bediener sieht nur die Klarnamen (customProperties).
const GROESSEN = ['ueberschrift', 'normal', 'klein'] as const
type Groesse = (typeof GROESSEN)[number]

function coerceGroesse(v: unknown): Groesse {
  return GROESSEN.includes(v as Groesse) ? (v as Groesse) : 'normal'
}

export class TextBlock extends BasicBlock {
  static readonly blockType = 'text'
  static readonly tagName = 'ff-text'
  static readonly displayName = 'Text'
  static readonly category: BlockCategory = 'anzeige'
  // Volle Breite: Fliesstext bricht dann im Container um, eine Ueberschrift
  // sitzt linksbuendig ueber der ganzen Breite. Der Breiten-Anfasser bleibt
  // aktiv (Doppelklick stellt den Standard wieder her).
  static readonly defaultProps = { width: 'fill', groesse: 'normal', text: 'Text' }

  // Einziges Inspector-Feld: die Groesse (Klarnamen sichtbar). Der Text selbst
  // laeuft ueber Inline-Edit, nicht ueber den Inspector.
  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'groesse',
      name: 'Größe',
      description: 'Überschrift = groß und fett, Normal = Fließtext, Klein = kleiner und gedämpft.',
      isArray: false,
      maxLength: 0,
      kind: 'select',
      options: [
        { value: 'ueberschrift', label: 'Überschrift' },
        { value: 'normal', label: 'Normal' },
        { value: 'klein', label: 'Klein' },
      ],
    },
  ]

  static styles = [
    BasicBlock.styles,
    css`
      .text {
        font-family: var(--se-font);
        font-size: var(--se-fs);
        color: var(--se-ink);
        line-height: 1.4;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      .text.ueberschrift {
        font-size: var(--se-fs-lg);
        font-weight: 700;
        line-height: 1.25;
      }
      .text.klein {
        font-size: var(--se-fs-sm);
        color: var(--se-muted);
      }
      /* Leerer Text bleibt im Editor ein greifbares Klick-Ziel (Regel 7:
         Platzhalter statt erfundener Wert); die Maske zeigt bei leerem Text
         schlicht nichts. */
      :host([data-ff-editor]) .text:empty::before {
        content: 'Text …';
        color: var(--se-faint);
      }
    `,
  ]

  @property() groesse: Groesse = 'normal'
  @property() text = 'Text'

  render(): TemplateResult {
    const g = coerceGroesse(this.groesse)
    const klasse = g === 'ueberschrift' ? 'text ueberschrift' : g === 'klein' ? 'text klein' : 'text'
    return html`<div
      class=${klasse}
      data-ff-editable
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'text')}
    >${this.text}</div>`
  }
}

BasicBlock.defineAndRegister(TextBlock)
