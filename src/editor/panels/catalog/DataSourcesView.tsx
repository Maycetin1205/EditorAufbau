// DataSourcesView
// Liste aller Datenquellen + Edit-Formular fuer einen ausgewaehlten Eintrag.
// Hier passiert die ganze Verwaltung: Typ waehlen, Bezeichnung, Quell-ID, Felder, Freiselekt.

import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import { IconChevronRight, IconPlus, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { catalog } from '../../../softengine/catalog/Catalog'
import { useCatalog } from '../../../softengine/catalog/useCatalog'
import type { SoftEngineFeld, SourceType } from '../../../softengine/catalog/types'
import {
  ALL_SOURCE_TYPES,
  getSourceIdLabel,
  getTypeLabel,
  getTypeShortBadge,
  supportsFreiselekt,
  supportsKey,
} from '../../../softengine/catalog/vorschlaege'

export function DataSourcesView() {
  const cat = useCatalog()
  const [editId, setEditId] = useState<string | null>(null)

  if (editId) {
    const entry = cat.getEntry(editId)
    if (!entry) {
      // Eintrag inzwischen geloescht -> zurueck zur Liste.
      setEditId(null)
      return null
    }
    return <EntryEditor entryId={editId} onBack={() => setEditId(null)} />
  }

  return (
    <Stack gap="xs" p="md">
      <Button
        size="xs"
        leftSection={<IconPlus size={14} />}
        onClick={() => {
          const created = catalog.addEntry('idb')
          setEditId(created.id)
        }}
      >
        Neue Datenquelle
      </Button>

      {cat.entries.length === 0 && (
        <Text c="dimmed" size="sm">
          Noch keine Datenquellen. Lege eine neue an.
        </Text>
      )}

      {cat.entries.map((e) => (
        <UnstyledButton
          key={e.id}
          onClick={() => setEditId(e.id)}
          style={{
            padding: '8px 10px',
            borderRadius: 6,
            border: '1px solid var(--mantine-color-default-border)',
          }}
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
              <Badge size="xs" variant="light">{getTypeShortBadge(e.type)}</Badge>
              <div style={{ minWidth: 0 }}>
                <Text size="sm" fw={500} truncate>{e.alias || '(ohne Bezeichnung)'}</Text>
                <Text size="xs" c="dimmed" truncate>
                  {e.sourceId || '(ohne ID)'} - {e.fields.length} Felder
                  {e.freiselektAktiv ? ' - Filter' : ''}
                </Text>
              </div>
            </Group>
            <IconChevronRight size={14} />
          </Group>
        </UnstyledButton>
      ))}
    </Stack>
  )
}

interface EntryEditorProps {
  entryId: string
  onBack: () => void
}

function EntryEditor({ entryId, onBack }: EntryEditorProps) {
  const cat = useCatalog()
  const entry = cat.getEntry(entryId)
  if (!entry) return null

  const typeOptions = ALL_SOURCE_TYPES.map((t) => ({ value: t, label: getTypeLabel(t) }))

  const updateField = (idx: number, patch: Partial<SoftEngineFeld>) => {
    const next = entry.fields.map((f, i) => (i === idx ? { ...f, ...patch } : f))
    catalog.updateEntry(entryId, { fields: next })
  }
  const removeField = (idx: number) => {
    const next = entry.fields.filter((_, i) => i !== idx)
    catalog.updateEntry(entryId, { fields: next })
  }
  const addField = () => {
    catalog.updateEntry(entryId, { fields: [...entry.fields, { name: '', field: '' }] })
  }

  return (
    <Stack gap="sm" p="md">
      <TextInput
        label="Bezeichnung"
        size="xs"
        value={entry.alias}
        onChange={(e) => catalog.updateEntry(entryId, { alias: e.currentTarget.value })}
      />

      <Select
        label="Typ"
        size="xs"
        data={typeOptions}
        value={entry.type}
        allowDeselect={false}
        comboboxProps={{ zIndex: 1500, withinPortal: true }}
        onChange={(v) => v && catalog.changeEntryType(entryId, v as SourceType)}
      />

      <TextInput
        label={getSourceIdLabel(entry.type)}
        size="xs"
        value={entry.sourceId}
        onChange={(e) => catalog.updateEntry(entryId, { sourceId: e.currentTarget.value })}
      />

      {supportsKey(entry.type) && (
        <TextInput
          label="Key-Feld (POS_LEN)"
          size="xs"
          placeholder="z.B. 10_8"
          value={entry.key}
          onChange={(e) => catalog.updateEntry(entryId, { key: e.currentTarget.value })}
        />
      )}

      <div>
        <Group justify="space-between" mb={4}>
          <Text size="xs" fw={500}>Felder ({entry.fields.length})</Text>
          <Button size="compact-xs" leftSection={<IconPlus size={12} />} onClick={addField}>
            Feld
          </Button>
        </Group>
        <Stack gap={4}>
          {entry.fields.map((f, i) => (
            <Group key={i} gap={4} wrap="nowrap" align="flex-end">
              <TextInput
                size="xs"
                placeholder="Name"
                value={f.name}
                onChange={(e) => updateField(i, { name: e.currentTarget.value })}
                style={{ flex: 1 }}
              />
              <TextInput
                size="xs"
                placeholder="POS_LEN"
                value={f.field}
                onChange={(e) => updateField(i, { field: e.currentTarget.value })}
                style={{ width: 90 }}
              />
              <ActionIcon
                size="sm"
                variant="subtle"
                color="red"
                onClick={() => removeField(i)}
                aria-label="Feld löschen"
              >
                <IconTrash size={12} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      </div>

      {supportsFreiselekt(entry.type) && (
        <div>
          <Checkbox
            label="Freiselekt verwenden"
            size="xs"
            checked={entry.freiselektAktiv}
            onChange={(e) =>
              catalog.updateEntry(entryId, { freiselektAktiv: e.currentTarget.checked })
            }
          />
          {entry.freiselektAktiv && (
            <TextInput
              mt={4}
              size="xs"
              placeholder="z.B. ADR_0_3='K'"
              value={entry.freiselekt}
              onChange={(e) => catalog.updateEntry(entryId, { freiselekt: e.currentTarget.value })}
            />
          )}
        </div>
      )}

      <Group mt="md" justify="space-between">
        <Button
          size="xs"
          color="red"
          variant="subtle"
          onClick={() => {
            catalog.deleteEntry(entryId)
            onBack()
          }}
        >
          Löschen
        </Button>
        <Button size="xs" onClick={onBack}>
          Fertig
        </Button>
      </Group>
    </Stack>
  )
}
