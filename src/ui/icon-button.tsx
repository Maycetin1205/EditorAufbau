// IconButton: quadratischer Icon-only Button.
// Nur ein duenner Wrapper um <Button size="icon"> mit optionalem aria-label-Hinweis,
// damit Icon-only-Buttons im Editor barrierefrei bleiben.

import { forwardRef, type ReactNode } from 'react'
import { Button, type ButtonProps } from '@/ui/button'

interface IconButtonProps extends Omit<ButtonProps, 'size' | 'children'> {
  'aria-label': string
  children: ReactNode
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', children, ...props }, ref) => {
    return (
      <Button ref={ref} size="icon" variant={variant} {...props}>
        {children}
      </Button>
    )
  },
)
IconButton.displayName = 'IconButton'
