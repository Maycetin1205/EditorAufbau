// Palette: sie kennt Block-Definitionen, aber keine konkrete Canvas-Logik.
import { Button, Stack, Text } from '@mantine/core'
import { IconPlus, IconRectangle } from '@tabler/icons-react'
import { getBlockDefinitions } from '../../core/blocks/blockRegistry'
import { useEditorStore } from '../../store/editorStore'

export function BlockPalette() {
  const addBlock = useEditorStore((state) => state.addBlock)
  const definitions = getBlockDefinitions()

  return (
    <Stack gap="sm">
      {definitions.map((definition) => (
        <Button
          key={definition.type}
          variant="light"
          color="indigo"
          justify="space-between"
          leftSection={<IconRectangle size={18} />}
          rightSection={<IconPlus size={16} />}
          onClick={() => addBlock(definition.type)}
        >
          {definition.title}
        </Button>
      ))}
      <Text size="xs" c="dimmed">
        Drag & Drop kommt spaeter. Erst muss der Block sauber sein.
      </Text>
    </Stack>
  )
}
