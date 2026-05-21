// ColorInput: Label + nativer color-picker + Hex-Textfeld.

import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ColorInputProps {
  label?: ReactNode
  description?: ReactNode
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ColorInput({ label, description, value, onChange, className }: ColorInputProps) {
  const id = useId()
  const safe = value && /^#?[0-9a-fA-F]{3,8}$/.test(value)
    ? (value.startsWith('#') ? value : `#${value}`)
    : '#000000'
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-foreground">{label}</label>
      )}
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={safe}
          onChange={(e) => onChange(e.currentTarget.value)}
          className="h-9 w-9 cursor-pointer rounded border border-input bg-background"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder="#rrggbb"
          className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
