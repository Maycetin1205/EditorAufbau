// TextInput
// Atom fuer einzeilige Eingaben: Label, Feld, Beschreibung und Fehlertext.
// Alle Inspector-/Formular-Felder sollen auf diesem Baustein aufsetzen.

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode
  description?: ReactNode
  error?: ReactNode
  wrapperClassName?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({
    label,
    description,
    error,
    id,
    type = 'text',
    className,
    wrapperClassName,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  }, ref) => {
    const reactId = useId()
    const inputId = id ?? reactId
    const descriptionId = description && !error ? `${inputId}-description` : undefined
    const errorId = error ? `${inputId}-error` : undefined
    const describedBy = [ariaDescribedBy, errorId ?? descriptionId]
      .filter(Boolean)
      .join(' ') || undefined

    return (
      <div className={cn('flex min-w-0 flex-col gap-1', wrapperClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-describedby={describedBy}
          aria-invalid={error ? true : ariaInvalid}
          className={cn(
            'h-9 min-w-0 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className,
          )}
          {...props}
        />
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
  },
)
TextInput.displayName = 'TextInput'
