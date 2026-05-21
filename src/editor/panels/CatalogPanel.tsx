// CatalogPanel
// Floating Werkzeug-Panel fuer SoftEngine-Datenquellen-Catalog.
// Position via Pointer-Drag am Header verschiebbar.
// Drei Ansichten: overview (2 Slots) -> list (Datenquellen / Relations) -> edit (Formular).

import { ActionIcon, Group, Paper, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { IconChevronLeft, IconChevronRight, IconGripVertical, IconX } from '@tabler/icons-react'
import { useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCatalog } from '../../softengine/catalog/useCatalog'
import { DataSourcesView } from './catalog/DataSourcesView'
import { RelationsView } from './catalog/RelationsView'

export interface PanelPosition {
  x: number
  y: number
}

interface CatalogPanelProps {
  pos: PanelPosition
  onPosChange: (pos: PanelPosition) => void
  onClose: () => void
}

type View = 'overview' | 'sources' | 'relations'

const PANEL_WIDTH = 420
const PANEL_HEIGHT = 560

export function CatalogPanel({ pos, onPosChange, onClose }: CatalogPanelProps) {
  const cat = useCatalog()
  const [view, setView] = useState<View>('overview')

  const startDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const start = { ...pos }

    const onMove = (ev: PointerEvent) => {
      const nx = Math.max(0, start.x + (ev.clientX - startX))
      const ny = Math.max(0, start.y + (ev.clientY - startY))
      onPosChange({ x: nx, y: ny })
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const headerTitle = view === 'overview' ? 'Datenquellen' : view === 'sources' ? 'Datenquellen' : 'Relations'

  return (
    <Paper
      withBorder
      shadow="lg"
      radius="md"
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--mantine-color-body)',
      }}
    >
      {/* Header: Drag-Griff + Zurueck-Button + Titel + Schliessen */}
      <Group
        justify="space-between"
        wrap="nowrap"
        onPointerDown={startDrag}
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--mantine-color-default-border)',
          cursor: 'grab',
          userSelect: 'none',
          background: 'var(--mantine-color-default-hover)',
        }}
      >
        <Group gap="xs" wrap="nowrap">
          <IconGripVertical size={16} />
          {view !== 'overview' && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setView('overview')}
              aria-label="Zurück zur Übersicht"
            >
              <IconChevronLeft size={14} />
            </ActionIcon>
          )}
          <Title order={5}>{headerTitle}</Title>
        </Group>
        <ActionIcon
          variant="subtle"
          color="gray"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
          aria-label="Panel schließen"
        >
          <IconX size={16} />
        </ActionIcon>
      </Group>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {view === 'overview' && (
          <Stack gap="xs" p="md">
            <SlotButton
              label="Datenquellen"
              hint="Variable / IDB / Beleg / Stamm / MEMTAB / Frei"
              count={cat.entries.length}
              onClick={() => setView('sources')}
            />
            <SlotButton
              label="Relations"
              hint="GET / PUT / PUTADD (Laufzeit)"
              count={cat.relations.length}
              onClick={() => setView('relations')}
            />
          </Stack>
        )}
        {view === 'sources' && <DataSourcesView />}
        {view === 'relations' && <RelationsView />}
      </div>
    </Paper>
  )
}

interface SlotButtonProps {
  label: string
  hint: string
  count: number
  onClick: () => void
}

function SlotButton({ label, hint, count, onClick }: SlotButtonProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        padding: '10px 12px',
        borderRadius: 6,
        border: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Text size="sm" fw={500}>{label}</Text>
          <Text size="xs" c="dimmed">{hint}</Text>
        </div>
        <Group gap={4} wrap="nowrap">
          <Text size="sm" c={count > 0 ? 'blue' : 'dimmed'}>{count}</Text>
          <IconChevronRight size={14} />
        </Group>
      </Group>
    </UnstyledButton>
  )
}
