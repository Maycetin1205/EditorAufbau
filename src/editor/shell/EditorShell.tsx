// EditorShell
// Erstes echtes Editor-Layout: links Sidebar, Mitte Canvas, rechts Inspector.
// Mantine AppShell liefert nur den Rahmen; die Editor-Organe bleiben eigene Komponenten.

import { AppShell, Button, Group, Text, Title } from '@mantine/core'
import { IconDatabase } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useKeyboardShortcuts } from '../../state/useKeyboardShortcuts'
import { Canvas } from '../canvas/Canvas'
import { Inspector } from '../inspector/Inspector'
import { CatalogPanel, type PanelPosition } from '../panels/CatalogPanel'
import { Sidebar } from '../sidebar/Sidebar'

const CATALOG_POS_KEY = 'aufbau_catalog_panel_pos_v1'
const DEFAULT_CATALOG_POS: PanelPosition = { x: 80, y: 80 }

function loadCatalogPos(): PanelPosition {
  try {
    const raw = localStorage.getItem(CATALOG_POS_KEY)
    if (!raw) return DEFAULT_CATALOG_POS
    const parsed = JSON.parse(raw) as Partial<PanelPosition>
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
      return { x: parsed.x, y: parsed.y }
    }
  } catch {
    // ignore
  }
  return DEFAULT_CATALOG_POS
}

export function EditorShell() {
  useKeyboardShortcuts()
  const [catalogOpen, setCatalogOpen] = useState(false)
  // Position lebt im Shell, ueberlebt Close/Open + Page-Refresh via localStorage.
  const [catalogPos, setCatalogPos] = useState<PanelPosition>(loadCatalogPos)
  useEffect(() => {
    try {
      localStorage.setItem(CATALOG_POS_KEY, JSON.stringify(catalogPos))
    } catch {
      // ignore
    }
  }, [catalogPos])
  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: 'sm' }}
      aside={{ width: 340, breakpoint: 'md' }}
      padding="md"
    >
      <AppShell.Header px="md">
        <Group h="100%" justify="space-between" wrap="nowrap">
          <Title order={3}>Aufbau Editor</Title>
          {/* Toolbar-Slot: hier kommen weitere Werkzeug-Buttons rein. */}
          <Group gap="xs" wrap="nowrap">
            <Button
              size="xs"
              variant={catalogOpen ? 'filled' : 'default'}
              leftSection={<IconDatabase size={14} />}
              onClick={() => setCatalogOpen((open) => !open)}
            >
              Datenquellen
            </Button>
            <Text c="dimmed" size="sm">
              SoftEngine HTML
            </Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Canvas />
      </AppShell.Main>

      <AppShell.Aside p="md">
        <Inspector />
      </AppShell.Aside>

      {catalogOpen && (
        <CatalogPanel
          pos={catalogPos}
          onPosChange={setCatalogPos}
          onClose={() => setCatalogOpen(false)}
        />
      )}
    </AppShell>
  )
}
