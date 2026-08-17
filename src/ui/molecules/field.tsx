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

  const beschreibungAlsHinweis = Boolean(label) && typeof description === 'string'

  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      {label && (
        <label
          htmlFor={id}
          title={beschreibungAlsHinweis && !error ? (description as string) : undefined}

          className={cn(
            'text-[0.6875rem] font-medium leading-4 text-foreground',
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
