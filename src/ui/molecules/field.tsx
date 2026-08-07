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
  // Beschreibungen sind KEIN Dauertext: mit Label liegen sie als Hover-Tooltip
  // (title) direkt auf dem Label — kein eigenes Icon, kein Extra-Platz
  // (Nutzer-Korrektur 2026-07-21; loest das fruehere angeklebte ⓘ ab). Fuer
  // Screenreader bleibt die Beschreibung als sr-only-Absatz verdrahtet
  // (aria-describedby unveraendert). Felder OHNE Label zeigen die Beschreibung
  // weiter sichtbar (ein title haette dort keinen sinnvollen Anker).
  const beschreibungAlsHinweis = Boolean(label) && typeof description === 'string'

  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      {label && (
        <label
          htmlFor={id}
          title={beschreibungAlsHinweis && !error ? (description as string) : undefined}
          // Die Beschriftung war 9,9 px und damit KLEINER als ihre eigene
          // Beschreibung darunter (10,8 px) — die Rangfolge stand auf dem Kopf.
          // Jetzt beide auf der Normalgroesse; den Vorrang macht die Fettung.
          className={cn(
            'text-ui font-medium text-foreground',
            beschreibungAlsHinweis && !error && 'cursor-help',
          )}
        >
          {label}
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
              : 'min-w-0 break-words text-ui text-muted-foreground'
          }
        >
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="min-w-0 break-words text-ui text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
