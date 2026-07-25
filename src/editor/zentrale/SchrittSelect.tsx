// SchrittSelect — das EINE handgebaute Auswahlfeld der Schritt-Bedienung.
//
// Eigener Pfeil mit reserviertem Platz rechts (pr-6), damit der gewaehlte
// Text NIE unter dem Aufklapp-Pfeil verschwindet (Nutzer-Korrektur
// 2026-07-22 — der Browser-Pfeil liegt sonst AUF dem Text).
//
// Layout-Klassen (Breite/Flex) gehoeren auf die Huelle; das <select> fuellt
// sie immer ganz.

import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SchrittSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn('relative', className)}>
      <select
        {...props}
        className="h-7 w-full appearance-none rounded border border-input bg-background pl-2 pr-6 text-xs"
      >
        {children}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}
