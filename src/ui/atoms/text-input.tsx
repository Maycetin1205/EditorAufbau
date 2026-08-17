import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ type = 'text', className, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-steuer min-w-0 w-full rounded-md border border-input bg-background px-2 py-1 text-ui transition-colors',
        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
        className,
      )}
      {...props}
    />
  ),
)
TextInput.displayName = 'TextInput'
