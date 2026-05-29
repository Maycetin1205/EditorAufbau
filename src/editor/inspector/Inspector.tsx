// Inspector
// Property-Editor des selektierten Blocks.
// Liest die PropertyDescription des Blocks und baut daraus einfache Controls.

import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type {
  PropertyDescription,
  PropertyKind,
} from '../../core/blocks/PropertyDescription'
import { useEditor } from '../../state/useEditor'
import { Panel } from '@/ui/molecules/panel'
import { SelectControl } from './controls/SelectControl'
import { TextareaControl } from './controls/TextareaControl'
import { TextControl } from './controls/TextControl'

function resolveKind(property: PropertyDescription, value: unknown): PropertyKind {
  if (property.kind) return property.kind
  if (typeof value === 'string') return 'text'
  return 'text'
}

export function Inspector() {
  const ed = useEditor()
  const block = ed.selectedBlock

  if (!block) {
    return (
      <Panel title="Inspector">
        <p className="text-sm text-muted-foreground">Kein Block ausgewählt.</p>
      </Panel>
    )
  }

  const def = getBlockDefinition(block.type)
  if (!def) {
    return (
      <Panel title="Inspector">
        <p className="text-sm text-destructive">
          Keine Definition für Block-Typ &quot;{block.type}&quot; gefunden.
        </p>
      </Panel>
    )
  }

  const renderPropControl = (property: PropertyDescription) => {
    const value = block.props[property.attributeName]
    const kind = resolveKind(property, value)
    const set = (v: unknown) => ed.updateProperty(block.id, property.attributeName, v)

    switch (kind) {
      case 'text':
        return <TextControl key={property.attributeName} property={property} value={String(value ?? '')} onChange={set} />
      case 'textarea':
        return <TextareaControl key={property.attributeName} property={property} value={String(value ?? '')} onChange={set} />
      case 'select':
        return <SelectControl key={property.attributeName} property={property} value={String(value ?? '')} onChange={set} />
      default:
        return null
    }
  }

  return (
    <Panel
      title={def.displayName ?? def.type}
      description={`${def.type} · ${block.id.slice(0, 8)}`}
    >
      {def.customProperties.length === 0 ? (
        <p className="text-xs text-muted-foreground">Keine Eigenschaften.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {def.customProperties.map(renderPropControl)}
        </div>
      )}
    </Panel>
  )
}
