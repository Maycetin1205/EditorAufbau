// Select-Control: feste Optionen kommen aus der Block-Definition.
import { Select } from '@mantine/core'
import type { SelectInspectorControl } from '../../../core/blocks/block.types'

type Props = {
  control: SelectInspectorControl
  value: unknown
  onChange: (value: string) => void
}

export function SelectControl({ control, value, onChange }: Props) {
  return (
    <Select
      label={control.label}
      description={control.description}
      data={control.options}
      value={String(value ?? '')}
      allowDeselect={false}
      onChange={(next) => {
        if (next) onChange(next)
      }}
    />
  )
}
