// TabelleBlock
// Test-/Erstfassung des Tabellen-Bausteins (Fahrplan-Punkt 4). EIN Baustein,
// EIN Rahmen: die Spalten stecken INNEN (kein Kind-Baustein je Spalte). Die
// Spalten sind jetzt ECHTE Spalten mit eigenem Titel:
//   - Titel je Spalte per Doppelklick am Kopf umbenennen (Inline-Edit)
//   - „+ Spalte" / „−" oben rechts am Baustein: hinzufügen / letzte entfernen
// Beides nur im Editor sichtbar (data-ff-editor) — im Export nie (WYSIWYG).
// KEIN Spaltenbreite-Ziehen (Nutzer-Entscheidung 2026-07-23: bewusst raus).
// KEINE Inspector-Steuerung (Bedienung am Ding, Regel 7).
//
// Die Titel liegen als Liste (string[]) in der Prop `spalten`. Alte Stände mit
// einer Spalten-ZAHL werden beim Lesen still auf „Spalte 1..N" abgebildet.
// Zeilen sind Platzhalter mit Strichen „—" (keine erfundenen Daten, Regel 7);
// echte Zeilen kommen erst mit der Datenanbindung (nächste Stufe).
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*).

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'

const SPALTEN_MIN = 1
const SPALTEN_MAX = 8
const PLATZHALTER_ZEILEN = 4
const STANDARD_TITEL = ['Spalte 1', 'Spalte 2', 'Spalte 3']

export class TabelleBlock extends BasicBlock {
  static readonly blockType = 'tabelle'
  static readonly tagName = 'ff-tabelle'
  static readonly displayName = 'Tabelle'
  static readonly category: BlockCategory = 'anzeige'
  static readonly defaultProps = { width: 'fill', spalten: [...STANDARD_TITEL] }
  // Raster-Startgröße (Erstwert — im Browser nachzukalibrieren).
  static readonly raster = { startW: 14, startH: 8, minW: 6, minH: 4 }

  // Titel-Liste. Zwei Wege, EIN Wert: der Editor setzt die DOM-Property direkt
  // (useLitElement), der Export schreibt die Liste als JSON ins Attribut
  // (exportMask). Darum KEIN attribute:false mehr — sonst käme der Export-Wert
  // in SoftEngine nie an (die Spalten fielen auf die Standardtitel zurück,
  // WYSIWYG-Bruch, Regel 1). Der Wandler ist robust: leeres/kaputtes Attribut
  // → Standardtitel; titelListe() fängt zusätzlich alte Stände (Spalten-ZAHL) ab.
  @property({
    converter: {
      fromAttribute: (v: string | null): string[] => {
        if (!v) return [...STANDARD_TITEL]
        try {
          const p: unknown = JSON.parse(v)
          return Array.isArray(p) ? p.map((x) => String(x)) : [...STANDARD_TITEL]
        } catch {
          return [...STANDARD_TITEL]
        }
      },
      toAttribute: (v: string[]): string => JSON.stringify(v),
    },
  })
  spalten: string[] = [...STANDARD_TITEL]

  // Robust gegen alte Stände (Zahl) und kaputte Werte; immer 1..MAX Titel.
  private titelListe(): string[] {
    const v = this.spalten as unknown
    let arr: string[]
    if (Array.isArray(v)) arr = v.map((x) => String(x))
    else if ((typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && /^\d+$/.test(v))) {
      const n = Math.max(1, Math.floor(Number(v)))
      arr = [...Array(n).keys()].map((i) => `Spalte ${i + 1}`)
    } else arr = [...STANDARD_TITEL]
    if (arr.length > SPALTEN_MAX) arr = arr.slice(0, SPALTEN_MAX)
    if (arr.length < SPALTEN_MIN) arr = ['Spalte 1']
    return arr
  }

  // Eigene Prop ändern = 'ff-prop-change' an den BlockHost (Muster inlineEdit).
  private aendere(titel: string[]): void {
    this.dispatchEvent(
      new CustomEvent('ff-prop-change', {
        detail: { attr: 'spalten', value: titel },
        bubbles: true,
        composed: true,
      }),
    )
  }

  // Inline-Umbenennen EINER Spalte am Kopf (Muster BasicBlock.inlineEdit,
  // angepasst auf den Listen-Index).
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
      const liste = this.titelListe()
      if (commit && neu && neu !== original.trim() && index < liste.length) {
        liste[index] = neu
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
      }
      .zeile > div { color: var(--se-muted); }
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
    const titel = this.titelListe()
    const cols = { gridTemplateColumns: `repeat(${titel.length}, minmax(0, 1fr))` }
    const zeilen = [...Array(PLATZHALTER_ZEILEN)]
    const stop = (e: Event): void => e.stopPropagation()
    return html`<div class="tabelle">
      <div class="steuerung">
        <button
          title="Letzte Spalte entfernen"
          @pointerdown=${stop}
          @click=${(e: Event) => {
            stop(e)
            const l = this.titelListe()
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
            const l = this.titelListe()
            if (l.length < SPALTEN_MAX) {
              l.push(`Spalte ${l.length + 1}`)
              this.aendere(l)
            }
          }}
        >+ Spalte</button>
      </div>
      <div class="kopf" style=${styleMap(cols)}>
        ${titel.map(
          (t, i) => html`<div
            data-ff-editable
            @dblclick=${(e: MouseEvent) => this.bearbeiteTitel(e, i)}
          >${t}</div>`,
        )}
      </div>
      <div class="koerper">
        ${zeilen.map(
          () => html`<div class="zeile" style=${styleMap(cols)}>
            ${titel.map(() => html`<div>—</div>`)}
          </div>`,
        )}
      </div>
    </div>`
  }
}

BasicBlock.defineAndRegister(TabelleBlock)
