// Canvas ist das Live-Dokument: hier erscheinen echte exportierbare Blocks.
import { Box, Center, Paper, Stack, Text } from '@mantine/core'
import { useEditorStore } from '../../store/editorStore'
import { BlockHost } from './BlockHost'

export function Canvas() {
  const rootBlockIds = useEditorStore((state) => state.rootBlockIds)
  const selectBlock = useEditorStore((state) => state.selectBlock)

  return (
    <Box
      h="100%"
      p="xl"
      bg="#eef0f4"
      style={{ overflow: 'auto' }}
      onClick={() => selectBlock(null)}
    >
      <Paper
        withBorder
        radius="sm"
        shadow="xs"
        p="xl"
        mx="auto"
        mih={620}
        style={{ maxWidth: 980, background: '#ffffff' }}
      >
        {rootBlockIds.length === 0 ? (
          <Center h={360}>
            <Stack gap={4} align="center">
              <Text fw={650}>Leere Canvas</Text>
              <Text size="sm" c="dimmed">
                Fuege links den ersten Button hinzu.
              </Text>
            </Stack>
          </Center>
        ) : (
          <Stack gap="md">
            {rootBlockIds.map((id) => (
              <BlockHost key={id} id={id} />
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  )
}
