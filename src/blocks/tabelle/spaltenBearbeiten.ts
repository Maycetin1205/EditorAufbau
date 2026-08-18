import { html, type TemplateResult } from 'lit'
import { SPALTEN_MAX, SPALTEN_MIN, neueSpalte, type Spalte } from './spalten'

// Kein Stop auf pointerdown (Zug-Regel in editor/canvas/rasterMove.ts) — der
// Stop auf CLICK bleibt, sonst waehlte jeder Knopfdruck die Tabelle mit aus.
export function spaltenSteuerung(
  liste: () => Spalte[],
  aendere: (spalten: Spalte[]) => void,
  stop: (e: Event) => void,
): TemplateResult {
  return html`<div class="steuerung">
    <button
      title="Letzte Spalte entfernen"
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
      @click=${(e: Event) => {
        stop(e)
        const l = liste()
        if (l.length < SPALTEN_MAX) {
          l.push(neueSpalte(l.length))
          aendere(l)
        }
      }}
    >+</button>
  </div>`
}

export function starteTitelEdit(
  e: MouseEvent,
  uebernehmen: (neu: string) => void,
): void {
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
    if (commit && neu && neu !== original.trim()) {
      uebernehmen(neu)
    } else {
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

const DOPPELKLICK_FENSTER = 220

const wartenderPicker = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>()

export function feldPickerAbbestellen(baustein: HTMLElement): void {
  const t = wartenderPicker.get(baustein)
  if (t === undefined) return
  clearTimeout(t)
  wartenderPicker.delete(baustein)
}

export function oeffneFeldPicker(
  baustein: HTMLElement,
  e: MouseEvent,
  prop: string,
  index: number,
  // Der gerade ANGEZEIGTE Stand reist mit: der Editor braucht ihn als
  // Rückfallebene, wenn die Eigenschaft selbst noch leer ist (Automatik-
  // Spalten des Nachschlagens) — sonst zeigt der Index ins Leere.
  liste?: () => Spalte[],
): void {
  e.stopPropagation()
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  feldPickerAbbestellen(baustein)
  wartenderPicker.set(baustein, setTimeout(() => {
    wartenderPicker.delete(baustein)
    baustein.dispatchEvent(
      new CustomEvent('ff-listen-bind', {
        detail: {
          prop,
          index,
          top: rect.bottom + 4,
          left: rect.left,
          ...(liste ? { liste: liste() } : {}),
        },
        bubbles: true,
        composed: true,
      }),
    )
  }, DOPPELKLICK_FENSTER))
}
