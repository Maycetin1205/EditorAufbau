// Inspector: bearbeitet Props im Store und zeigt den HTML-Export.
import {
  Button,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import { buildSoftEngineHtml } from '../../softengine/export/buildSoftEngineHtml'
import { useEditorStore } from '../../store/editorStore'
import { selectSelectedBlock } from '../../store/selectors'
import { InspectorRenderer } from './InspectorRenderer'

export function Inspector() {
  const block = useEditorStore(selectSelectedBlock)
  const blocks = useEditorStore((state) => state.blocks)
  const rootBlockIds = useEditorStore((state) => state.rootBlockIds)
  const deleteSelectedBlock = useEditorStore((state) => state.deleteSelectedBlock)
  const html = buildSoftEngineHtml({ blocks, rootBlockIds })

  return (
    <ScrollArea h="100%">
      <Stack gap="md" p="md">
        <div>
          <Title order={4}>Eigenschaften</Title>
          <Text size="sm" c="dimmed">
            Aendert nur Daten, nicht die Komponente selbst.
          </Text>
        </div>
        <Divider />
        {block ? (
          <Stack gap="md">
            <InspectorRenderer block={block} />
            <Group justify="flex-end">
              <Button
                color="red"
                variant="light"
                leftSection={<IconTrash size={16} />}
                onClick={deleteSelectedBlock}
              >
                Block loeschen
              </Button>
            </Group>
          </Stack>
        ) : (
          <Text size="sm" c="dimmed">
            Kein Block ausgewaehlt.
          </Text>
        )}
        <Divider />
        <div>
          <Title order={5}>HTML-Export Etappe 1</Title>
          <Text size="xs" c="dimmed" mb="xs">
            Erster kontrollierter Export. SoftEngine-Adapter kommen spaeter.
          </Text>
          <Textarea value={html} readOnly autosize minRows={6} />
        </div>
      </Stack>
    </ScrollArea>
  )
}
