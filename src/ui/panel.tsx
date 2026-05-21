// Panel: einfacher Card-/Paper-Ersatz mit Rahmen + Padding + optionalem Titel.
// Bewusst klein gehalten. Wenn shadcn Card spaeter gebraucht wird, kann es hier ersetzt werden.

import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

// title kollidiert mit dem nativen HTML-title-Attribut (string). Daher per Omit ausschliessen.
interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  bodyClassName?: string
}

export function Panel({
  title,
  description,
  className,
  bodyClassName,
  children,
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        'rounded-md border border-border bg-card text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    >
      {(title || description) && (
        <div className="border-b border-border px-4 py-3">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      )}
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </div>
  )
}
