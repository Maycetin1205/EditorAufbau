// Generischer Inspector: Feldliste kommt aus der Block-Definition.
import { Stack } from '@mantine/core'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { EditorBlock } from '../../core/blocks/block.types'
import { useEditorStore } from '../../store/editorStore'
import { SelectControl } from './controls/SelectControl'
import { SwitchControl } from './controls/SwitchControl'
import { TextControl } from './controls/TextControl'

export function InspectorRenderer({ block }: { block: EditorBlock }) {
  const updateBlockProps = useEditorStore((state) => state.updateBlockProps)
  const definition = getBlockDefinition(block.type)

  return (
    <Stack gap="md">
      {definition.inspector.map((control) => {
        const value = block.props[control.prop]

        if (control.kind === 'text') {
          return (
            <TextControl
              key={control.prop}
              control={control}
              value={value}
              onChange={(next) =>
                updateBlockProps(block.id, { [control.prop]: next })
              }
            />
          )
        }

        if (control.kind === 'select') {
          return (
            <SelectControl
              key={control.prop}
              control={control}
              value={value}
              onChange={(next) =>
                updateBlockProps(block.id, { [control.prop]: next })
              }
            />
          )
        }

        return (
          <SwitchControl
            key={control.prop}
            control={control}
            value={value}
            onChange={(next) =>
              updateBlockProps(block.id, { [control.prop]: next })
            }
          />
        )
      })}
    </Stack>
  )
}
