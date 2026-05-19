// Text-Schema: diese Daten darf ein Textblock speichern und exportieren.
import { z } from 'zod'

export const textSizeSchema = z.enum(['body', 'lead', 'heading'])
export const textToneSchema = z.enum(['default', 'muted', 'accent'])
export const textAlignSchema = z.enum(['left', 'center', 'right'])

export const textPropsSchema = z.object({
  content: z.string().min(1).max(240),
  size: textSizeSchema,
  tone: textToneSchema,
  align: textAlignSchema,
})

export type TextProps = z.output<typeof textPropsSchema>
export type TextSize = z.output<typeof textSizeSchema>
export type TextTone = z.output<typeof textToneSchema>
export type TextAlign = z.output<typeof textAlignSchema>

export const textDefaultProps: TextProps = textPropsSchema.parse({
  content: 'Neuer Text fuer SoftEngine',
  size: 'body',
  tone: 'default',
  align: 'left',
})
