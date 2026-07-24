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
import { connectTable, disconnectTable } from './seRuntime'

export interface Spalte {
  titel: string
  feld: string
}

const SPALTEN_MIN = 1
const SPALTEN_MAX = 8
const PLATZHALTER_ZEILEN = 4

function standardSpalten(): Spalte[] {
  return [
    { titel: 'Spalte 1', feld: '' },
    { titel: 'Spalte 2', feld: '' },
    { titel: 'Spalte 3', feld: '' },
  ]
}

// Eine unbekannte Struktur defensiv auf eine Spalte abbilden (nie werfen).
function alsSpalte(x: unknown, index: number): Spalte {
  if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>
    return {
      titel: typeof o.titel === 'string' ? o.titel : `Spalte ${index + 1}`,
      feld: typeof o.feld === 'string' ? o.feld : '',
    }
  }
  // Alte Erstfassung: reine Titel-Strings.
  if (typeof x === 'string') return { titel: x, feld: '' }
  return { titel: `Spalte ${index + 1}`, feld: '' }
}

// Robust gegen alte Staende (Titel-Strings, Spalten-ZAHL) und kaputte Werte;
// immer 1..MAX Spalten mit {titel,feld}.
export function coerceSpalten(v: unknown): Spalte[] {
  let arr: Spalte[]
  if (Array.isArray(v)) {
    arr = v.map((x, i) => alsSpalte(x, i))
  } else if ((typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && /^\d+$/.test(v))) {
    const n = Math.max(1, Math.floor(Number(v)))
    arr = [...Array(n).keys()].map((i) => ({ titel: `Spalte ${i + 1}`, feld: '' }))
  } else {
    arr = standardSpalten()
  }
  if (arr.length > SPALTEN_MAX) arr = arr.slice(0, SPALTEN_MAX)
  if (arr.length < SPALTEN_MIN) arr = [{ titel: 'Spalte 1', feld: '' }]
  return arr
}

export class TabelleBlock extends BasicBlock {
  static readonly blockType = 'tabelle'
  static readonly tagName = 'ff-tabelle'
  static readonly displayName = 'Tabelle'
  static readonly category: BlockCategory = 'anzeige'
  // Kap. 5.1: Datenquelle anhaengbar (Inspector-Sektion „Daten"); der Export
  // erzeugt daraus den SEFILELOOP. `source` = Technikwert (Vorlagen-id), leer =
  // keine Quelle (Tabelle bleibt statisch mit Platzhaltern).
  static readonly acceptsDataSource = true
  static readonly defaultProps = {
    width: 'fill',
    source: '',
    spalten: standardSpalten(),
  }
  // Raster-Startgröße (Erstwert — im Browser nachzukalibrieren).
  static readonly raster = { startW: 14, startH: 8, minW: 6, minH: 4 }

  // Spalten (Titel + Feld) als JSON in Prop/Attribut. Editor setzt die
  // DOM-Property (useLitElement), Export schreibt JSON ins Attribut; der Wandler
  // liest es zurueck (leer/kaputt -> Standard; coerceSpalten faengt alte Staende).
  @property({
    converter: {
      fromAttribute: (v: string | null): Spalte[] =>
        v ? tryCoerce(v) : standardSpalten(),
      toAttribute: (v: Spalte[]): string => JSON.stringify(v),
    },
  })
  spalten: Spalte[] = standardSpalten()

  // Datenquelle (Technikwert, Vorlagen-id). Leer = statisch (Platzhalter).
  @property() source = ''

  // Laufzeit-Zeilen (attribute:false): tabelle/seRuntime setzt sie im Export aus
  // den SoftEngine-Daten — je Datenzeile ein Wert-Array, an `spalten` ausgerichtet.
  // Im Editor bleibt es [] -> Platzhalter-Striche (Regel 7).
  @property({ attribute: false }) datenzeilen: string[][] = []

  private spaltenListe(): Spalte[] {
    return coerceSpalten(this.spalten)
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
    const spalten = this.spaltenListe()
    const cols = { gridTemplateColumns: `repeat(${spalten.length}, minmax(0, 1fr))` }
    const stop = (e: Event): void => e.stopPropagation()
    // Laufzeit-Daten (Export/SoftEngine) oder Platzhalter (Editor/ohne Quelle).
    const daten = this.datenzeilen
    const platzhalter = Array.from({ length: PLATZHALTER_ZEILEN }, () => null)
    const zeilen: (readonly string[] | null)[] = daten.length > 0 ? daten : platzhalter
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
            @dblclick=${(e: MouseEvent) => this.bearbeiteTitel(e, i)}
          >${s.titel}</div>`,
        )}
      </div>
      <div class="koerper">
        ${zeilen.map(
          (row) => html`<div class="zeile" style=${styleMap(cols)}>
            ${row
              ? row.map((wert) => html`<div>${wert}</div>`)
              : spalten.map(() => html`<div>—</div>`)}
          </div>`,
        )}
      </div>
    </div>`
  }
}

// Nur fuer den Attribut-Wandler (haelt fromAttribute knapp + faengt JSON-Fehler).
function tryCoerce(v: string): Spalte[] {
  try {
    return coerceSpalten(JSON.parse(v))
  } catch {
    return standardSpalten()
  }
}

BasicBlock.defineAndRegister(TabelleBlock)
