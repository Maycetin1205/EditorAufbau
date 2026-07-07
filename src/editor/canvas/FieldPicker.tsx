// FieldPicker
// Kap. 5.2 (Bedienlogik 3): "Stelle anklicken → Feld wählen". Kleines
// Auswahlfeld direkt an der angeklickten Stelle — zeigt AUSSCHLIESSLICH
// Klarnamen aus dem Feld-Wörterbuch (nie Feldcodes) plus den Beispielwert;
// der Feldcode (Technikwert) wird unsichtbar in die Bindungs-Prop
// geschrieben. "— nicht gebunden —" löst die Bindung wieder.
//
// Reine Editor-Hilfe (Editor-UI-Tokens/Tailwind, KEIN Masken-Design):
// lebt im BlockHost über der Maske und erscheint nie im Export.

import { useEffect, useRef } from 'react'
import type { DataSourceField } from '../../core/data/dataSources'

interface FieldPickerProps {
  // Klarname der Stelle (aus bindableSpots, z. B. 'Titel').
  spotLabel: string
  // Anzeigename der Datenquelle (z. B. 'Terminplaner').
  sourceName: string
  fields: readonly DataSourceField[]
  // Aktuell gebundener Feldcode ('' = ungebunden).
  current: string
  // Position relativ zum BlockHost-Wrapper.
  top: number
  left: number
  // code = Feldcode oder '' für "nicht gebunden".
  onPick: (code: string) => void
  onClose: () => void
}

export function FieldPicker({
  spotLabel,
  sourceName,
  fields,
  current,
  top,
  left,
  onPick,
  onClose,
}: FieldPickerProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  // Außenklick + Escape schließen. pointerdown (nicht click), damit auch
  // ein Klick, der woanders eine Auswahl startet, sofort schließt.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [onClose])

  const eintrag = (code: string, name: string, sample?: string) => (
    <button
      key={code === '' ? '__keine__' : code}
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onPick(code)
      }}
      className={`flex w-full items-baseline justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground ${
        code === current ? 'font-semibold' : ''
      }`}
    >
      <span>{code === current ? '✓ ' : ''}{name}</span>
      {sample !== undefined && (
        <span className="shrink-0 text-muted-foreground">{sample}</span>
      )}
    </button>
  )

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Feld für ${spotLabel}`}
      data-ff-editor-helper
      draggable={false}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onDragStart={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      style={{ position: 'absolute', top, left, zIndex: 30 }}
      className="max-h-64 w-60 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
    >
      <p className="px-2 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {spotLabel} · Feld aus {sourceName}
      </p>
      {eintrag('', '— nicht gebunden —')}
      {fields.map((f) => eintrag(f.code, f.label, f.sample))}
    </div>
  )
}
