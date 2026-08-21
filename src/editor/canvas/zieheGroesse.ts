import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Editor } from '../../state/Editor'
import { schluckeKlickNachZug, vergissKlickSchlucker } from './klickNachZug'

export interface ZiehAuftrag {
  achse: 'x' | 'y'

  prop: string

  getId: () => string

  start: number

  min: number

  faktor?: number

  schritt?: number

  anwenden?: (id: string, wert: number) => void
}

export function zieheGroesse(
  editor: Editor,
  e: ReactPointerEvent<HTMLElement>,
  auftrag: ZiehAuftrag,
): void {
  e.preventDefault()
  e.stopPropagation()
  const startPos = auftrag.achse === 'x' ? e.clientX : e.clientY

  let letzter = Math.max(auftrag.min, Math.round(auftrag.start))
  let gezogen = false

  const klammer = editor.oeffneGeste()
  const onMove = (ev: PointerEvent) => {
    const pos = auftrag.achse === 'x' ? ev.clientX : ev.clientY
    const rohDelta = (pos - startPos) * (auftrag.faktor ?? 1)

    const delta = auftrag.schritt && auftrag.schritt !== 1
      ? Math.round(rohDelta / auftrag.schritt)
      : rohDelta
    const next = Math.max(auftrag.min, Math.round(auftrag.start + delta))
    if (next === letzter) return
    letzter = next
    gezogen = true
    klammer.oeffne()
    if (auftrag.anwenden) auftrag.anwenden(auftrag.getId(), next)
    else editor.updateProperty(auftrag.getId(), auftrag.prop, next)
  }

  const beende = () => {
    klammer.schliesse()
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', beende)
    window.removeEventListener('pointercancel', beende)
    window.removeEventListener('blur', beende)
    vergissKlickSchlucker()
    // Der Anfasser liegt IM Baustein: der Klick nach dem Ziehen stieg bis zum
    // Baustein-Rahmen auf und warf die Auswahl weg. Nur nach echtem Zug —
    // sonst kann man den Anfasser nicht mehr antippen.
    if (gezogen) schluckeKlickNachZug()
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', beende)
  window.addEventListener('pointercancel', beende)
  window.addEventListener('blur', beende)
}
