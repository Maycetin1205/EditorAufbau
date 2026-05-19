// Sidebar: hier waehlt der Benutzer neue Blocks fuer das Live-Dokument.
import { Divider, ScrollArea, Stack, Text, Title } from '@mantine/core'
import { BlockPalette } from './BlockPalette'

export function Sidebar() {
  return (
    <ScrollArea h="100%">
      <Stack gap="md" p="md">
        <div>
          <Title order={4}>Bausteine</Title>
          <Text size="sm" c="dimmed">
            Neue Blocks entstehen aus der Registry.
          </Text>
        </div>
        <Divider />
        <BlockPalette />
      </Stack>
    </ScrollArea>
  )
}
