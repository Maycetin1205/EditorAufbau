// Textarea: Atom — reines mehrzeiliges Eingabefeld.
// Label/Beschreibung/Fehlertext kommen vom Field-Molekül.

import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 3, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        // Kein shadow-sm mehr: das einzeilige Feld daneben (TextInput) hat
        // keinen, und zwei Eingabefelder mit unterschiedlicher Tiefe im selben
        // Formular sehen nach Versehen aus. Keine Hoehe — das mehrzeilige Feld
        // waechst mit `rows`.
        'w-full rounded-md border border-input bg-background px-2 py-1.5 text-ui transition-colors',
        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
