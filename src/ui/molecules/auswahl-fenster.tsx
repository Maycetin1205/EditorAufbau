// AuswahlFenster — der gemeinsame Rahmen der zwei schwebenden Auswahl-Fenster
// des Editors: der Feld-Picker an der angeklickten Stelle (editor/canvas) und
// das Feld-Übernahme-Fenster im Datencenter (editor/zentrale).
//
// Bis U3 (2026-08-12) trug jedes seinen eigenen Portal-Rumpf und seinen eigenen
// Schließ-Horcher — dieselben vier Ereignis-Wege zweimal gepflegt. Wer einen
// davon reparierte, reparierte nur das halbe Fenster.
//
// Hier wohnt GENAU das Gemeinsame:
//   - Portal an den body und feste Positionierung im Sichtfenster. Beide
//     Fenster hingen sonst in einem Scroll-/Overflow-Container fest (z. B. dem
//     Kanban-Spaltenrumpf) und würden abgeschnitten.
//   - Die Editor-Gesten abfangen: ein Klick/Zeigerdruck im Fenster darf nicht
//     als Klick auf den Baustein darunter gelten, und gezogen wird es nie.
//   - Die drei Schließ-Wege: Klick daneben (pointerdown, nicht click — auch ein
//     Klick, der woanders eine Auswahl startet, schließt sofort), Escape und
//     Scrollen außerhalb (das Fenster steht fix im Viewport, die Stelle darunter
//     wanderte sonst weg).
//
// Zwei Unterschiede bleiben als Schalter stehen, weil sie ECHT verschieden sind:
//   - `imBildHalten` — nur das Fenster im schmalen, rechts angedockten Bereich
//     klemmt sich an den Viewport-Rand (Nutzer-Fund 2026-07-22: es lief sonst
//     rechts aus dem Bild). Der Feld-Picker sitzt an einer angeklickten Stelle
//     der Fläche und wurde nie geklemmt.
//   - `escapeAbfangen` — nur dieses Fenster HÄLT Escape auf; sonst schlösse
//     derselbe Tastendruck auch das Formular darunter. Der Feld-Picker lässt
//     Escape bewusst weiterlaufen.
// Wer einen dritten Schalter braucht, baut vermutlich ein drittes Fenster.

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

// Abstand zum Fensterrand beim Klemmen.
const RAND = 8

interface AuswahlFensterProps {
  // Klarname des Fensters für Hilfstechnik (aria-label).
  bezeichnung: string
  // Gewünschte Position in VIEWPORT-Koordinaten.
  oben: number
  links: number
  // Größe/Scroll je Fenster — der Rahmen selbst (Rand, Grund, Schatten) steht
  // hier fest, damit beide Fenster gleich aussehen.
  className: string
  imBildHalten?: boolean
  escapeAbfangen?: boolean
  onClose: () => void
  children: ReactNode
}

export function AuswahlFenster({
  bezeichnung,
  oben,
  links,
  className,
  imBildHalten = false,
  escapeAbfangen = false,
  onClose,
  children,
}: AuswahlFensterProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [geklemmt, setGeklemmt] = useState({ top: oben, left: links })
  // Ohne Klemmen zählt allein die gewünschte Position — kein Zustand dazwischen,
  // also auch kein Bild, in dem das Fenster kurz woanders steht.
  const position = imBildHalten ? geklemmt : { top: oben, left: links }

  // Nach dem Messen an den Rand klemmen; der ResizeObserver deckt
  // Stufenwechsel (Quellen → Felder) und Such-Filter (Höhenänderung) mit ab.
  useLayoutEffect(() => {
    const el = ref.current
    if (!imBildHalten || !el) return
    const klemmen = () => {
      const rect = el.getBoundingClientRect()
      const maxLeft = Math.max(RAND, window.innerWidth - RAND - rect.width)
      const maxTop = Math.max(RAND, window.innerHeight - RAND - rect.height)
      const nextLeft = Math.max(RAND, Math.min(links, maxLeft))
      const nextTop = Math.max(RAND, Math.min(oben, maxTop))
      setGeklemmt((prev) =>
        prev.left === nextLeft && prev.top === nextTop ? prev : { top: nextTop, left: nextLeft },
      )
    }
    klemmen()
    const ro = new ResizeObserver(klemmen)
    ro.observe(el)
    return () => ro.disconnect()
  }, [oben, links, imBildHalten])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onScroll = (e: Event) => {
      if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return
      onClose()
    }
    const onKeyDown = (e: Event) => {
      if (!(e instanceof KeyboardEvent) || e.key !== 'Escape') return
      if (escapeAbfangen) {
        e.stopImmediatePropagation()
        e.stopPropagation()
      }
      onClose()
    }
    // window feuert in der Fangphase VOR document — nur so kommt dieses Fenster
    // vor den Horchern darunter an die Taste.
    const tastenZiel: EventTarget = escapeAbfangen ? window : document
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('scroll', onScroll, true)
    tastenZiel.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('scroll', onScroll, true)
      tastenZiel.removeEventListener('keydown', onKeyDown, true)
    }
  }, [onClose, escapeAbfangen])

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={bezeichnung}
      data-ff-editor-helper
      draggable={false}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onDragStart={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 50 }}
      className={cn(
        'overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  )
}
