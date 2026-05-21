// Switch: Label + Checkbox als Toggle.
// shadcn-Switch nutzt Radix; hier reicht ein Checkbox-Toggle, da wir Radix
// nicht installiert haben. UX-Niveau ist Editor-Inspektor: knapp und solide.

import { forwardRef, useId, type ChangeEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps {
  label?: ReactNode
  description?: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
  disabled?: boolean
  id?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, checked, onChange, className, disabled, id }, ref) => {
    const reactId = useId()
    const inputId = id ?? reactId
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.currentTarget.checked)
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            className={cn('h-4 w-4 rounded border-input', className)}
          />
          {label}
        </label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    )
  },
)
Switch.displayName = 'Switch'
