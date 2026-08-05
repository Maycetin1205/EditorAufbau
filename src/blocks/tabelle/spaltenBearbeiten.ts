// spaltenBearbeiten — die Spalten am Kopf bearbeiten (nur im Editor).
//
// Zwei Handgriffe, ein Thema: den Titel einer Spalte umbenennen, und Spalten
// hinzufuegen bzw. die letzte entfernen. Beides passiert oben am Kopf, beides
// gibt es NUR auf der Maskenflaeche — im Export nie (WYSIWYG, Regel 1).
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
