// Kopfbereich: globale Editor-Aktionen bleiben getrennt von den exportierbaren Blocks.
import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core'
import { IconCode, IconDeviceFloppy } from '@tabler/icons-react'

export function Header() {
  return (
    <Group h="100%" px="md" justify="space-between">
      <Group gap="sm">
        <Text fw={700}>Aufbau Editor</Text>
        <Badge variant="light" color="indigo">
          Etappe 2: Text + Button
        </Badge>
      </Group>
      <Group gap="xs">
        <Tooltip label="Speichern kommt spaeter">
          <ActionIcon variant="subtle" color="gray" aria-label="Speichern">
            <IconDeviceFloppy size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="HTML-Export steht im Inspector">
          <ActionIcon variant="subtle" color="gray" aria-label="Export">
            <IconCode size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  )
}
