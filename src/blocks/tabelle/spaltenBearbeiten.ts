// spaltenBearbeiten — die Spalten am Kopf bearbeiten (nur im Editor).
//
// Drei Handgriffe, ein Thema: den Titel einer Spalte umbenennen, ihr Feld
// waehlen, und Spalten hinzufuegen bzw. die letzte entfernen. Alles passiert
// oben am Kopf, alles gibt es NUR auf der Maskenflaeche — im Export nie
// (WYSIWYG, Regel 1).
//
// Aus TabelleBlock herausgeloest (2026-08-06), weil die Datei mit der
// gemessenen Seitengroesse ueber den 500-Zeilen-Deckel wuchs (check:regeln).
// Der Schnitt ist der natuerliche: hier das BEARBEITEN der Spalten, drueben
// das Zeichnen und die Daten. Der Code ist unveraendert uebernommen — reine
// Verschiebung, kein neues Verhalten.
//
// Warum das NICHT BasicBlock.inlineEdit ist (die Vorlage, an der es sich
// orientiert): dort geht der fertige Text als 'ff-prop-change' an EIN
// Attribut. Hier landet er an einer STELLE IN EINER LISTE, und ein leer
// getippter Titel wird verworfen statt uebernommen (eine Spalte ohne
// Ueberschrift waere im Kopf nicht mehr anklickbar). Zusammenlegen wuerde
// den generischen Helfer um zwei Sonderfaelle aufblaehen, die nur die
// Tabelle braucht (Regel 10 — erst wenn ein zweiter Fall es erzwingt).

import { html, type TemplateResult } from 'lit'
import { SPALTEN_MAX, SPALTEN_MIN, standardTitelFuer, type Spalte } from './spalten'

// Die „+" / „−"-Knoepfe oben rechts. Sichtbar macht sie das CSS
// (:host([data-ff-editor]) .steuerung) — hier steht nur, WAS sie tun.
export function spaltenSteuerung(
  liste: () => Spalte[],
  aendere: (spalten: Spalte[]) => void,
  stop: (e: Event) => void,
): TemplateResult {
  return html`<div class="steuerung">
    <button
      title="Letzte Spalte entfernen"
      @pointerdown=${stop}
      @click=${(e: Event) => {
        stop(e)
        const l = liste()
        if (l.length > SPALTEN_MIN) {
          l.pop()
          aendere(l)
        }
      }}
    >−</button>
    <button
      title="Spalte hinzufügen"
      @pointerdown=${stop}
      @click=${(e: Event) => {
        stop(e)
        const l = liste()
        if (l.length < SPALTEN_MAX) {
          // Titel aus ./spalten, nicht von Hand getippt: an DIESER Vorlage
          // erkennt der Editor, dass der Bediener den Titel nicht selbst
          // gesetzt hat und ihn beim Feld-Binden ersetzen darf.
          l.push({ titel: standardTitelFuer(l.length), feld: '' })
          aendere(l)
        }
      }}
    >+</button>
  </div>`
}

// Blendet contenteditable in den angeklickten Spaltenkopf ein und gibt den
// fertigen Titel an `uebernehmen`. Enter/Blur uebernehmen, Escape verwirft.
// Den editable-Check macht der Aufrufer (nur er kennt seinen Zustand).
export function starteTitelEdit(
  e: MouseEvent,
  uebernehmen: (neu: string) => void,
): void {
  const ziel = e.currentTarget as HTMLElement | null
  if (!ziel) return
  e.stopPropagation()
  e.preventDefault()
  // Lit verwaltet die Kindknoten der Stelle (Marker-Kommentare + Text). Fuer
  // den Verwerfen-Fall werden die Originalknoten gesichert: ein nacktes
  // `textContent = original` wuerde Lits Marker zerstoeren, und die Stelle
  // bekaeme danach nie wieder ein Update.
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
    if (commit && neu && neu !== original.trim()) {
      uebernehmen(neu)
    } else {
      // Verwerfen: Original-Knoten zurueck (Lit-Marker bleiben heil).
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

// Titel EINER Spalte umbenennen. Die Eingabe-Mechanik ist starteTitelEdit;
// hier steht nur, was die Tabelle daran fachlich ausmacht: der neue Titel
// landet an SEINER Stelle in der Liste, das Feld der Spalte bleibt erhalten.
export function benenneSpalteUm(
  e: MouseEvent,
  index: number,
  liste: () => Spalte[],
  aendere: (spalten: Spalte[]) => void,
): void {
  starteTitelEdit(e, (neu) => {
    const l = liste()
    if (index >= l.length) return
    l[index] = { ...l[index], titel: neu }
    aendere(l)
  })
}

// Wartezeit, bis ein Einzelklick auf den Spaltenkopf als Einzelklick gilt.
// Darunter waere ein Doppelklick (Umbenennen) nicht mehr sauber abzugrenzen,
// darueber fuehlt sich der Feld-Picker traege an.
const DOPPELKLICK_FENSTER = 220

// Der wartende Feld-Picker je Baustein. Einzel- und Doppelklick liegen auf
// DEMSELBEN Element, und ein Doppelklick loest immer auch zwei Einzelklicks
// aus — darum wartet der Picker kurz ab und wird vom dblclick abbestellt.
// WeakMap statt Feld am Element: der Timer gehoert zu DIESER Bedienung, nicht
// zum Zustand der Tabelle.
const wartenderPicker = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>()

// Beim Umbenennen und beim Abmelden aufzurufen — sonst oeffnet sich der
// Picker noch, nachdem der Baustein aus dem DOM ist.
export function feldPickerAbbestellen(baustein: HTMLElement): void {
  const t = wartenderPicker.get(baustein)
  if (t === undefined) return
  clearTimeout(t)
  wartenderPicker.delete(baustein)
}

// Fordert den BlockHost auf, den Feld-Picker fuer diesen Listen-Eintrag zu
// oeffnen. Das Event ist GENERISCH (`ff-listen-bind` + Prop-Name) — der
// BlockHost bedient damit jeden Baustein mit `listenBindung`, ohne die Tabelle
// zu kennen (Regel 2). Den editable-Check macht der Aufrufer.
export function oeffneFeldPicker(
  baustein: HTMLElement,
  e: MouseEvent,
  prop: string,
  index: number,
): void {
  e.stopPropagation()
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  feldPickerAbbestellen(baustein)
  wartenderPicker.set(baustein, setTimeout(() => {
    wartenderPicker.delete(baustein)
    baustein.dispatchEvent(
      new CustomEvent('ff-listen-bind', {
        detail: { prop, index, top: rect.bottom + 4, left: rect.left },
        bubbles: true,
        composed: true,
      }),
    )
  }, DOPPELKLICK_FENSTER))
}
