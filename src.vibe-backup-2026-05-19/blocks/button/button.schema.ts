// Button-Schema: diese Daten darf ein Button speichern und exportieren.
import { z } from 'zod'

export const buttonVariantSchema = z.enum(['primary', 'secondary', 'quiet'])

export const buttonPropsSchema = z.object({
  label: z.string().min(1).max(80),
  variant: buttonVariantSchema,
  disabled: z.boolean(),
  actionId: z.string().max(80),
})

export type ButtonProps = z.output<typeof buttonPropsSchema>
export type ButtonVariant = z.output<typeof buttonVariantSchema>

export const buttonDefaultProps: ButtonProps = buttonPropsSchema.parse({
  label: 'Speichern',
  variant: 'primary',
  disabled: false,
  actionId: 'save',
})
