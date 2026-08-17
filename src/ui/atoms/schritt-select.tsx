import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from '../zeichen'
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
        className="h-steuer w-full appearance-none rounded-md border border-input bg-background pl-2 pr-6 text-ui"
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
