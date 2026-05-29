// Field: Molekül — Label + Beschreibung + Fehlertext um EIN beliebiges Control.
// Erzeugt id + aria-Verdrahtung genau einmal und reicht sie per Render-Prop an
// das Control. Beendet die Dreifach-Wiederholung (war in TextInput, Textarea und
// handgeschrieben im SelectControl). Atome bleiben dadurch reine Controls.

import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface FieldChildProps {
  id: string
  'aria-describedby': string | undefined
  'aria-invalid': boolean | undefined
}

interface FieldProps {
  label?: ReactNode
  description?: ReactNode
  error?: ReactNode
  className?: string
  children: (props: FieldChildProps) => ReactNode
}

export function Field({ label, description, error, className, children }: FieldProps) {
  const id = useId()
  const descriptionId = description && !error ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-foreground">
          {label}
        </label>
      )}
      {children({
        id,
        'aria-describedby': (errorId ?? descriptionId) || undefined,
        'aria-invalid': error ? true : undefined,
      })}
      {description && !error && (
        <p id={descriptionId} className="min-w-0 break-words text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="min-w-0 break-words text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
