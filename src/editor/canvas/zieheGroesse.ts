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
  // Zeigerweg in px je EINER Einheit des Zielwerts. Fehlt er / ist 1 = px-Modus
  // (Fluss/Popup: der Wert IST px). Auf der Rasterfläche ist der Zielwert eine
  // ganze Zellenzahl (rasterW/rasterH) — dann ist `schritt` die (gemessene)
  // Zell-Pitch, und die Geste rastet auf ganze Zellen ein statt px zu schreiben.
  schritt?: number
  // Optionaler Anwender je Zug-Schritt statt updateProperty: die RASTER-Größe
  // rastet auf ganze Zellen (Editor.resizeNodeToCells); die Nachbarn bleiben
  // stehen, ein wachsender Baustein überlappt bewusst. Fluss/Popup lassen es weg
  // und schreiben die Prop schlicht. Bekommt Block-id + gerundeten Zielwert.
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
  editor.beginTransaction()
  const onMove = (ev: PointerEvent) => {
    const pos = auftrag.achse === 'x' ? ev.clientX : ev.clientY
    const rohDelta = (pos - startPos) * (auftrag.faktor ?? 1)
    // px-Modus (schritt fehlt/1): der Wert bleibt px, wie bisher. Raster-Modus
    // (schritt = Zell-Pitch): der Zeigerweg wird in GANZE Zellen umgerechnet,
    // der Wert rastet ein — start/min sind hier Zellenzahlen.
    const delta = auftrag.schritt && auftrag.schritt !== 1
      ? Math.round(rohDelta / auftrag.schritt)
      : rohDelta
    const next = Math.max(auftrag.min, Math.round(auftrag.start + delta))
    if (auftrag.anwenden) auftrag.anwenden(auftrag.getId(), next)
    else editor.updateProperty(auftrag.getId(), auftrag.prop, next)
  }
  // Die Geste MUSS in jedem Fall abschliessen. Bleibt endTransaction aus,
  // steht der History-Zaehler dauerhaft > 0 — und history.record() schweigt
  // dann fuer den REST der Sitzung: ab da wird nichts mehr fuer Undo
  // aufgezeichnet, ohne dass der Bediener etwas merkt. Darum ausser
  // pointerup auch pointercancel (Zeiger vom Browser/System entzogen, z. B.
  // Touch-Geste) und blur (Fenster verlassen, waehrend die Taste haelt —
  // das pointerup kommt dann nie bei uns an). Beenden ist EINMALIG:
  // `beendet` schuetzt davor, dass zwei Wege endTransaction doppelt rufen.
  let beendet = false
  const beende = () => {
    if (beendet) return
    beendet = true
    editor.endTransaction()
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', beende)
    window.removeEventListener('pointercancel', beende)
    window.removeEventListener('blur', beende)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', beende)
  window.addEventListener('pointercancel', beende)
  window.addEventListener('blur', beende)
}
