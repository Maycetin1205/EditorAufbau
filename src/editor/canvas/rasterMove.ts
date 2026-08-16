// rasterMove
// Pointer-basiertes BEWEGEN eines Blocks auf der Rasterfläche (E2 „Bewegen").
// Bewusst KEIN HTML5-Drag: das native draggable am CanvasNode-Wrapper verschluckt
// den Pointer-Zug und liefert keinen live einrastenden Geist (Nutzer-Zusage
// „rastet live auf Zellen"). Reine Editor-Hilfe — läuft nie in der Maske, kein
// Export-Einfluss (die Platzierung liegt in den Rasterprops, die Canvas UND
// Export teilen). DIE eine Zieh-Mechanik für Größen ist zieheGroesse; dies ist
// ihr Gegenstück für die POSITION (zweidimensional + Zielzelle, ohne Ausweichen).
//
// Ablauf: greifen → ab einer kleinen Schwelle folgt der Geist (dropTarget
// kind:'raster', in Canvas gerendert) der Maus und rastet auf ganze Zellen;
// Loslassen legt den Block über moveNodeToCell an der Zielzelle ab (Nachbarn
// bleiben EXAKT stehen, EINE Undo-Transaktion). Ein reiner Klick (unter der
// Schwelle) bleibt ein Klick → die Auswahl am Ding (waehleGetroffenen) greift.

import type { PointerEvent as ReactPointerEvent } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import { RASTER, parseRasterPos } from '../../core/blocks/rasterLayout'
import type { Editor } from '../../state/Editor'
import type { DndState } from './dndState'
import { zelleAusZeiger } from './rasterDnd'
import { flaecheVon } from './rasterFlaeche'

// Zeigerweg (px), ab dem aus dem Klick ein Zug wird — trennt Auswahl vom Bewegen.
const ZUG_SCHWELLE = 4

// Schluckt genau den Klick, der auf ein abgeschlossenes Ziehen folgt, damit die
// Auswahl nach dem Ablegen nicht zusätzlich eine Ebene umschaltet.
function schluckeKlick(ev: MouseEvent): void {
  ev.stopPropagation()
  ev.preventDefault()
}

// Liegt der Zeiger in einer offenen Inline-Bearbeitung? Dann gehoert die Geste
// dem TEXT, nicht dem Baustein: wer im Edit-Modus (Doppelklick auf eine Stelle,
// BasicBlock.inlineEdit setzt contenteditable) Text per Ziehen markiert,
// bewegte bis 2026-08-06 stattdessen den ganzen Baustein — bei Zellwechsel
// sprang er mitten im Tippen woanders hin, und der Klick-Schlucker frass den
// Folgeklick. Die Editierfelder der Tabelle schuetzen sich seit je mit
// @pointerdown=stop; der generische Inline-Edit-Pfad kann das nicht, weil der
// Zug am Raster-Wrapper AUSSERHALB des Bausteins beginnt.
// composedPath, weil die bearbeitete Stelle im Shadow DOM des Bausteins liegt
// (Muster spotAt in useBindingPicker).
function inTextBearbeitung(e: ReactPointerEvent<HTMLElement>): boolean {
  for (const t of e.nativeEvent.composedPath()) {
    if (t === e.currentTarget) return false
    if (t instanceof HTMLElement && t.isContentEditable) return true
  }
  return false
}

export function ziehePosition(
  editor: Editor,
  dnd: DndState,
  e: ReactPointerEvent<HTMLElement>,
  node: BlockNode,
  parentId: string,
): void {
  if (e.button !== 0) return
  if (inTextBearbeitung(e)) return
  const wrapper = e.currentTarget
  // Der Wrapper ist direktes Grid-Item — WELCHES Element ihn layoutet, sagt
  // `flaecheVon` (im Popup liegt das Gitter im Schatten des Bausteins).
  const gridEl = flaecheVon(wrapper)
  if (!gridEl) return
  const startX = e.clientX
  const startY = e.clientY
  const rect = wrapper.getBoundingClientRect()
  // Greif-Versatz im Block, damit der Geist unter dem Zeiger bleibt statt mit der
  // Ecke anzuspringen.
  const greif = { x: startX - rect.left, y: startY - rect.top }
  const pos = parseRasterPos(node.props)
  const id = node.id
  let aktiv = false
  let letztes: { x: number; y: number } | null = null

  const aufraeumen = (): void => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onCancel)
    window.removeEventListener('blur', onCancel)
    // Einen Klick-Schlucker aus einem FRUEHEREN Zug abraeumen. Er ist mit
    // once:true bewaffnet, verschwindet also nur, wenn der synthetische Klick
    // wirklich kommt — bleibt der aus, sass er da und frass den naechsten
    // echten Klick des Bedieners. `schluckeKlick` ist modulweit dieselbe
    // Funktion, das Entfernen trifft deshalb genau den liegengebliebenen.
    // Fuer den LAUFENDEN Zug ist das folgenlos: onUp meldet seinen Schlucker
    // erst NACH diesem Aufraeumen an.
    window.removeEventListener('click', schluckeKlick, { capture: true })
  }

  const onMove = (ev: PointerEvent): void => {
    if (!aktiv) {
      if (Math.abs(ev.clientX - startX) < ZUG_SCHWELLE && Math.abs(ev.clientY - startY) < ZUG_SCHWELLE) return
      aktiv = true
      dnd.setDragId(id) // dimmt den gefassten Block (opacity im CanvasNode)
    }
    const zelle = zelleAusZeiger(gridEl, ev.clientX - greif.x, ev.clientY - greif.y)
    const x = Math.max(0, Math.min(zelle.x, RASTER.spalten - pos.w))
    const y = Math.max(0, zelle.y)
    letztes = { x, y }
    dnd.setDropTarget({ kind: 'raster', parentId, x, y, w: pos.w, h: pos.h })
  }

  const onUp = (): void => {
    aufraeumen()
    if (aktiv && letztes) {
      editor.moveNodeToCell(id, parentId, letztes.x, letztes.y)
      window.addEventListener('click', schluckeKlick, { capture: true, once: true })
    }
    dnd.reset()
  }

  const onCancel = (): void => {
    // Native Aktion (z. B. HTML5-Drag eines verschachtelten Container-Kindes)
    // hat übernommen: Bewegen abbrechen, nichts schreiben.
    // Gilt genauso fürs Fenster-Verlassen (blur, s. u.).
    aufraeumen()
    dnd.reset()
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onCancel)
  // blur wie bei der Schwester-Mechanik zieheGroesse: verlässt der Bediener
  // mit gehaltener Taste das Fenster und lässt draussen los, kommt das
  // pointerup nie bei uns an. Ohne diesen Weg blieb der abgedunkelte
  // Geist-Baustein bis zum nächsten Klick kleben. Abgebrochen statt abgelegt:
  // wo draussen losgelassen wurde, weiss niemand — eine Zielzelle zu raten
  // waere schlimmer als der abgebrochene Zug.
  window.addEventListener('blur', onCancel)
}
