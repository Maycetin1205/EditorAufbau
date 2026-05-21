// RelationsView
// Syntax-Import-Feld + Liste aller Relations + Detail-Anzeige.
// User klebt GET_RELATION[...] / PUT_RELATION[...] / PUTADD_RELATION[...] ein,
// parseRelationSyntax + addRelation erledigen Rest.

import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import { IconChevronRight, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { catalog } from '../../../softengine/catalog/Catalog'
import { useCatalog } from '../../../softengine/catalog/useCatalog'

export function RelationsView() {
  const cat = useCatalog()
  const [syntaxInput, setSyntaxInput] = useState('')
  const [parseError, setParseError] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  if (editId) {
    const rel = cat.getRelation(editId)
    if (!rel) {
      setEditId(null)
      return null
    }
    return <RelationDetail relationId={editId} onBack={() => setEditId(null)} />
  }

  const handleImport = () => {
    const created = catalog.importRelationFromSyntax(syntaxInput)
    if (!created) {
      setParseError('Ungültige Syntax. Format: GET_RELATION[NR!P1!P2!...] oder PUT_RELATION[...]')
      return
    }
    setParseError('')
    setSyntaxInput('')
  }

  return (
    <Stack gap="sm" p="md">
      <div>
        <Text size="xs" fw={500} mb={4}>Relation per Syntax</Text>
        <Textarea
          size="xs"
          placeholder={'GET_RELATION[666!1!2!L!!IDBID0005]\nPUT_RELATION[174!1!2!L!!IDBID0005!STATUS]'}
          value={syntaxInput}
          onChange={(e) => {
            setSyntaxInput(e.currentTarget.value)
            setParseError('')
          }}
          minRows={2}
          autosize
        />
        <Group mt={4} justify="space-between">
          <Button size="compact-xs" onClick={handleImport} disabled={!syntaxInput.trim()}>
            Importieren
          </Button>
          {parseError && (
            <Text c="red" size="xs">{parseError}</Text>
          )}
        </Group>
      </div>

      {cat.relations.length === 0 && (
        <Text c="dimmed" size="sm">Noch keine Relations.</Text>
      )}

      {cat.relations.map((r) => (
        <UnstyledButton
          key={r.id}
          onClick={() => setEditId(r.id)}
          style={{
            padding: '8px 10px',
            borderRadius: 6,
            border: '1px solid var(--mantine-color-default-border)',
          }}
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
              <Badge size="xs" variant="light" color={r.kind === 'GET' ? 'blue' : 'orange'}>
                {r.kind}
              </Badge>
              <div style={{ minWidth: 0 }}>
                <Text size="sm" fw={500} truncate>{r.name}</Text>
                <Text size="xs" c="dimmed" truncate>{r.syntax}</Text>
              </div>
            </Group>
            <IconChevronRight size={14} />
          </Group>
        </UnstyledButton>
      ))}
    </Stack>
  )
}

interface RelationDetailProps {
  relationId: string
  onBack: () => void
}

function RelationDetail({ relationId, onBack }: RelationDetailProps) {
  const cat = useCatalog()
  const r = cat.getRelation(relationId)
  if (!r) return null

  // Vorlage ist read-only bzgl. Syntax. Konkrete Parameter-Werte werden
  // erst bei Nutzung (Aktionsschritt) belegt, nicht hier.
  return (
    <Stack gap="sm" p="md">
      <TextInput
        label="Name"
        size="xs"
        value={r.name}
        onChange={(e) => catalog.updateRelation(relationId, { name: e.currentTarget.value })}
      />

      <div>
        <Text size="xs" fw={500} mb={2}>Vorlage-Syntax</Text>
        <Text
          size="xs"
          style={{
            wordBreak: 'break-all',
            fontFamily: 'monospace',
            padding: '6px 8px',
            background: 'var(--mantine-color-default-hover)',
            borderRadius: 4,
          }}
        >
          {r.syntax}
        </Text>
      </div>

      <div>
        <Group justify="space-between" mb={2}>
          <Text size="xs" fw={500}>Platzhalter ({r.syntaxParams.length})</Text>
          {r.syntaxParams.length === 0 && (
            <Text size="xs" c="dimmed">keine — Vorlage ohne Variable</Text>
          )}
        </Group>
        {r.syntaxParams.length > 0 && (
          <Group gap={4}>
            {r.syntaxParams.map((p) => (
              <Badge
                key={p.key}
                size="xs"
                variant={p.source === 'variable' ? 'light' : 'outline'}
                color={p.source === 'variable' ? 'blue' : 'gray'}
                title={p.source === 'variable' ? 'wird bei Nutzung belegt' : 'fester Wert in Vorlage'}
              >
                {p.source === 'variable' ? `{${p.key}}` : p.value}
              </Badge>
            ))}
          </Group>
        )}
        <Text size="xs" c="dimmed" mt={4}>
          Platzhalter werden bei Nutzung im Aktionsschritt mit konkreten Werten gefüllt.
        </Text>
      </div>

      <Textarea
        label="Beschreibung"
        size="xs"
        value={r.description}
        onChange={(e) => catalog.updateRelation(relationId, { description: e.currentTarget.value })}
        autosize
        minRows={2}
      />

      <Group justify="space-between" mt="md">
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={() => {
            catalog.deleteRelation(relationId)
            onBack()
          }}
          aria-label="Relation löschen"
        >
          <IconTrash size={14} />
        </ActionIcon>
        <Button size="xs" onClick={onBack}>Fertig</Button>
      </Group>
    </Stack>
  )
}
