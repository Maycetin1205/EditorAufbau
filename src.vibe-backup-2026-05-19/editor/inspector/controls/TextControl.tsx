// Text-Control: kleine Mantine-Huelle fuer String-Props.
import { TextInput } from '@mantine/core'
import type { TextInspectorControl } from '../../../core/blocks/block.types'

type Props = {
  control: TextInspectorControl
  value: unknown
  onChange: (value: string) => void
}

export function TextControl({ control, value, onChange }: Props) {
  return (
    <TextInput
      label={control.label}
      description={control.description}
      value={String(value ?? '')}
      maxLength={control.maxLength}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  )
}
