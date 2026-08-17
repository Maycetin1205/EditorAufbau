import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

const RAND = 8

interface AuswahlFensterProps {
  bezeichnung: string

  oben: number
  links: number

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
