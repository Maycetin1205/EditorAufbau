// Switch-Control: Boolean-Props bleiben als echte Boolean-Daten im Store.
import { Switch } from '@mantine/core'
import type { SwitchInspectorControl } from '../../../core/blocks/block.types'

type Props = {
  control: SwitchInspectorControl
  value: unknown
  onChange: (value: boolean) => void
}

export function SwitchControl({ control, value, onChange }: Props) {
  return (
    <Switch
      label={control.label}
      description={control.description}
      checked={Boolean(value)}
      onChange={(event) => onChange(event.currentTarget.checked)}
    />
  )
}
