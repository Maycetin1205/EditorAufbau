// zieheGroesse
// DIE eine Zieh-Mechanik für Größen-Anfasser (Editor-Paket 2026-07-17,
// Nutzer-Go): Block-Anfasser (useBlockResize) und Popup-Fenster-Anfasser
// (PopupSeite) waren wörtlich dieselbe Geste — Zeiger fassen, Achse lesen,
// eine Transaktion = 1 Undo, bei jedem Zug Untergrenze + Runden, beim
// Loslassen aufräumen. Unterschiede sind DATEN, kein Code: welche Achse,
// welche Prop, Startwert, Untergrenze und der Faktor (Popup-Fenster ist
// zentriert, darum wächst es um 2×delta — die Kante bleibt unter dem
// Zeiger). Reine Editor-Hilfe: läuft nie in der Maske, kein Export-Einfluss.

import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Editor } from '../../state/Editor'

export interface ZiehAuftrag {
  // Zeigerachse der Geste: 'x' (Breite) oder 'y' (Höhe).
  achse: 'x' | 'y'
  // Zu schreibende Prop des Blocks (width/height bzw. breite/hoehe).
  prop: string
  // Block-Id zum SCHREIB-Zeitpunkt (Blocks reichen eine Ref durch,
  // deshalb eine Funktion statt eines festen Werts).
  getId: () => string
  // Ausgangsgröße in px (Blocks: gemessene Ist-Größe; Popup: sichtbare
  // — eingeklemmte — Fenstergröße, damit die Kante am Zeiger startet).
  start: number
  // Untergrenze in px.
  min: number
  // px Größenänderung je Zeiger-px; Standard 1 (Popup zentriert: 2).
  faktor?: number
}

export function zieheGroesse(
  editor: Editor,
  e: ReactPointerEvent<HTMLElement>,
  auftrag: ZiehAuftrag,
): void {
  e.preventDefault()
  e.stopPropagation()
  const startPos = auftrag.achse === 'x' ? e.clientX : e.clientY
  editor.beginTransaction()
  const onMove = (ev: PointerEvent) => {
    const pos = auftrag.achse === 'x' ? ev.clientX : ev.clientY
    const next = Math.max(
      auftrag.min,
      Math.round(auftrag.start + (pos - startPos) * (auftrag.faktor ?? 1)),
    )
    editor.updateProperty(auftrag.getId(), auftrag.prop, next)
  }
  const onUp = () => {
    editor.endTransaction()
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}
