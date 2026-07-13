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

  // Beschreibungen sind KEIN Dauertext mehr (Nutzer-Korrektur 2026-07-13,
  // V1b): neben dem Label sitzt ein dezentes ⓘ — der Text erscheint nur
  // beim Daraufzeigen (title). Fuer Screenreader bleibt er als sr-only-
  // Absatz verdrahtet (aria-describedby unveraendert). Felder OHNE Label
  // zeigen die Beschreibung weiterhin sichtbar (das ⓘ haette keinen Anker).
  const beschreibungAlsHinweis = Boolean(label) && typeof description === 'string'

  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-foreground">
          {label}
          {beschreibungAlsHinweis && !error && (
            <span
              title={description as string}
              aria-hidden="true"
              className="ml-1 cursor-help font-normal text-muted-foreground"
            >
              ⓘ
            </span>
          )}
        </label>
      )}
      {children({
        id,
        'aria-describedby': (errorId ?? descriptionId) || undefined,
        'aria-invalid': error ? true : undefined,
      })}
      {description && !error && (
        <p
          id={descriptionId}
          className={
            beschreibungAlsHinweis
              ? 'sr-only'
              : 'min-w-0 break-words text-xs text-muted-foreground'
          }
        >
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
