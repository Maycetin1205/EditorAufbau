// NumberInput: numerisches Eingabefeld.
// onChange liefert ausschliesslich endliche number-Werte. Leere Eingabe wird ignoriert,
// damit der Wert im Editor-State nicht versehentlich NaN wird.

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'size'> {
  label?: ReactNode
  description?: ReactNode
  error?: ReactNode
  value: number
  onChange: (value: number) => void
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, description, error, id, className, value, onChange, min, ...props }, ref) => {
    const reactId = useId()
    const inputId = id ?? reactId
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type="number"
          min={min ?? 0}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => {
            const next = e.currentTarget.valueAsNumber
            if (Number.isFinite(next)) onChange(next)
          }}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className,
          )}
          {...props}
        />
        {description && !error && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  },
)
NumberInput.displayName = 'NumberInput'
