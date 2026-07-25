import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { TextInput } from '@/ui/atoms/text-input'
import type {
  FeldUebernahmeZiel,
  UebernahmeFeld,
  UebernahmeQuelle,
} from './feldUebernahme'

interface FeldUebernahmePickerProps {
  sources: readonly UebernahmeQuelle[]
  fields: readonly UebernahmeFeld[]
  ziel: FeldUebernahmeZiel
  current: string
  top: number
  left: number
  onPick: (sourceId: string, code: string) => void
  onClose: () => void
}

export function FeldUebernahmePicker({
  sources,
  fields,
  ziel,
  current,
  top,
  left,
  onPick,
  onClose,
}: FeldUebernahmePickerProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [suche, setSuche] = useState('')
  const [quelle, setQuelle] = useState<UebernahmeQuelle | null>(null)
  const needle = suche.trim().toLocaleLowerCase('de')
  const [pos, setPos] = useState({ top, left })

  // Im Sichtfenster halten (Nutzer-Fund 2026-07-22): der Inspector ist rechts
  // angedockt und schmal — ein an der Knopf-Position geöffnetes Fenster liefe
  // sonst rechts (und bei kleinen Höhen unten) aus dem Bild und wäre halb
  // unlesbar. Nach dem Messen an den Rand klemmen; der ResizeObserver deckt
  // Stufenwechsel (Quellen → Felder) und Such-Filter (Höhenänderung) mit ab.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const klemmen = () => {
      const rect = el.getBoundingClientRect()
      const rand = 8
      const maxLeft = Math.max(rand, window.innerWidth - rand - rect.width)
      const maxTop = Math.max(rand, window.innerHeight - rand - rect.height)
      const nextLeft = Math.max(rand, Math.min(left, maxLeft))
      const nextTop = Math.max(rand, Math.min(top, maxTop))
      setPos((prev) =>
        prev.left === nextLeft && prev.top === nextTop ? prev : { top: nextTop, left: nextLeft },
      )
    }
    klemmen()
    const ro = new ResizeObserver(klemmen)
    ro.observe(el)
    return () => ro.disconnect()
  }, [top, left])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onScroll = (e: Event) => {
      if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return
      onClose()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      e.stopPropagation()
      onClose()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('scroll', onScroll, true)
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [onClose])

  const sichtbareQuellen = useMemo(
    () => sources.filter((source) => needle === '' || source.sourceName.toLocaleLowerCase('de').includes(needle)),
    [needle, sources],
  )
  const sichtbareFelder = useMemo(
    () => fields.filter((field) => field.sourceId === quelle?.sourceId && (
      needle === ''
      || `${field.label} ${field.sourceName}`.toLocaleLowerCase('de').includes(needle)
    )),
    [fields, needle, quelle?.sourceId],
  )

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label="Feld übernehmen"
      data-ff-editor-helper
      draggable={false}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onDragStart={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 50 }}
      className="max-h-72 w-64 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
    >
      <TextInput
        aria-label="Feld oder Quelle suchen"
        autoFocus
        value={suche}
        placeholder="Feld oder Quelle suchen"
        onChange={(e) => setSuche(e.target.value)}
        className="mb-1"
      />

      {quelle && ziel === 'feld' ? (
        <>
          <button
            type="button"
            className="px-2 py-1 text-xs text-primary hover:underline"
            onClick={() => {
              setQuelle(null)
              setSuche('')
            }}
          >
            ← Quellen
          </button>
          <p className="px-2 pb-0.5 pt-1 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {quelle.sourceName}
          </p>
          {sichtbareFelder.map((field) => (
            <button
              key={`${field.sourceId}:${field.code}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onPick(field.sourceId, field.code)
              }}
              className="flex w-full items-baseline gap-3 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
            >
              <span>{field.label}</span>
              {field.code === current && <span className="text-muted-foreground">✓</span>}
            </button>
          ))}
          {sichtbareFelder.length === 0 && (
            <p className="px-2 py-2 text-xs text-muted-foreground">Keine Felder.</p>
          )}
        </>
      ) : (
        <>
          <p className="px-2 pb-0.5 pt-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Datenquelle wählen
          </p>
          {sichtbareQuellen.map((source) => (
            <button
              key={source.sourceId}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (ziel === 'idb') {
                  onPick(source.sourceId, '')
                } else {
                  setQuelle(source)
                  setSuche('')
                }
              }}
              className="flex w-full rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
            >
              {source.sourceName}
            </button>
          ))}
          {sichtbareQuellen.length === 0 && (
            <p className="px-2 py-2 text-xs text-muted-foreground">Keine IDB-Quellen.</p>
          )}
        </>
      )}
    </div>,
    document.body,
  )
}
