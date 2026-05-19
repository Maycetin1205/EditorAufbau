// Statusbar: zeigt knappe Rueckmeldung aus dem zentralen Store.
import { Group, Text } from '@mantine/core'
import { useEditorStore } from '../../store/editorStore'

export function StatusBar() {
  const blockCount = useEditorStore((state) => state.rootBlockIds.length)
  const lastEventMessage = useEditorStore((state) => state.lastEventMessage)

  return (
    <Group h="100%" px="md" justify="space-between">
      <Text size="xs" c="dimmed">
        Blocks: {blockCount}
      </Text>
      <Text size="xs" c="dimmed">
        {lastEventMessage}
      </Text>
    </Group>
  )
}
