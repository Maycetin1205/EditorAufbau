import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

const RAND = 8

// Ein Zeigerdruck ausserhalb schliesst das Fenster — der Ausloeser liegt
// ausserhalb. Ohne weiteres Zutun oeffnet der Klick, der auf denselben Druck
// folgt, es sofort wieder: es wirkt, als ginge es nicht zu (Nutzer-Befund
// 2026-08-19). Also wird nach einem Druck AUF DEN AUSLOESER genau EIN Klick
// verschluckt.
//
// Der Schlucker wohnt modulweit, weil er das Fenster UEBERLEBEN muss: der
// Druck schliesst es (die Komponente verschwindet), der Klick kommt erst
// danach. Er verfaellt beim naechsten Zeigerdruck — sonst bliebe er liegen,
// wo kein Klick folgt (Touch, Wegziehen).
let klickSchlucker: (() => void) | null = null

function schluckeNaechstenKlick(): void {
  klickSchlucker?.()
  const ab = (): void => {
    document.removeEventListener('click', schlucke, true)
    document.removeEventListener('pointerdown', ab, true)
    if (klickSchlucker === ab) klickSchlucker = null
  }
  const schlucke = (e: Event): void => {
    // Haelt den Klick vor JEDEM anderen Horcher an — auch vor React (das an
    // #root horcht) und vor dem @click eines Bausteins in seinem Schatten.
    e.stopImmediatePropagation()
    ab()
  }
  document.addEventListener('click', schlucke, true)
  // Waehrend eines laufenden pointerdown angemeldet, hoert dieser Horcher erst
  // den NAECHSTEN — genau das ist gewollt.
  document.addEventListener('pointerdown', ab, true)
  klickSchlucker = ab
}

// Der Ausloeser kann im Schatten eines Bausteins liegen; dort zeigt e.target
// auf den Wirt. Der zusammengesetzte Pfad kennt ihn trotzdem.
function aufAusloeser(e: Event, ausloeser: Element): boolean {
  if (typeof e.composedPath === 'function' && e.composedPath().includes(ausloeser)) return true
  return e.target instanceof Node && ausloeser.contains(e.target)
}

interface AuswahlFensterProps {
  bezeichnung: string

  oben: number
  links: number

  // Der Knopf oder die Zelle, aus der dieses Fenster kam. Gesetzt, schliesst
  // ein Klick darauf das Fenster statt es neu zu oeffnen.
  ausloeser?: Element | null

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
  ausloeser,
  className,
  imBildHalten = false,
  escapeAbfangen = false,
  onClose,
  children,
}: AuswahlFensterProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [geklemmt, setGeklemmt] = useState({ top: oben, left: links })

  const position = imBildHalten ? geklemmt : { top: oben, left: links }

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
      if (!ref.current || ref.current.contains(e.target as Node)) return
      if (ausloeser != null && aufAusloeser(e, ausloeser)) schluckeNaechstenKlick()
      onClose()
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

    const tastenZiel: EventTarget = escapeAbfangen ? window : document
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('scroll', onScroll, true)
    tastenZiel.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('scroll', onScroll, true)
      tastenZiel.removeEventListener('keydown', onKeyDown, true)
    }
  }, [onClose, escapeAbfangen, ausloeser])

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
