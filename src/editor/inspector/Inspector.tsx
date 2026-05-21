// Inspector
// Liest den selektierten BlockData-State und die passende BlockDefinition.
// Baut daraus editierbare Controls dispatched via property.kind.
// Fallback per typeof, damit alte Block-Definitions ohne kind weiter funktionieren.

import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { PropertyDescription, PropertyKind } from '../../core/blocks/PropertyDescription'
import { useEditor } from '../../state/useEditor'
import { Panel } from '@/ui/panel'
import { ColorControl } from './controls/ColorControl'
import { ColumnsControl } from './controls/ColumnsControl'
import { DataSourceControl } from './controls/DataSourceControl'
import { FieldControl } from './controls/FieldControl'
import { FieldListControl } from './controls/FieldListControl'
import { NumberControl } from './controls/NumberControl'
import { SectionsControl } from './controls/SectionsControl'
import { SelectControl } from './controls/SelectControl'
import { SwitchControl } from './controls/SwitchControl'
import { TextareaControl } from './controls/TextareaControl'
import { TextControl } from './controls/TextControl'

function resolveKind(property: PropertyDescription, value: unknown): PropertyKind {
  if (property.kind) return property.kind
  if (typeof value === 'string') return 'text'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  return 'text'
}

export function Inspector() {
  const ed = useEditor()
  const block = ed.selectedBlock

  if (!block) {
    return (
      <Panel title="Inspector">
        <p className="text-sm text-muted-foreground">Kein Block ausgewaehlt.</p>
      </Panel>
    )
  }

  const def = getBlockDefinition(block.type)
  if (!def) {
    return (
      <Panel title="Inspector">
        <p className="text-sm text-destructive">
          Keine Definition fuer Block-Typ &quot;{block.type}&quot; gefunden.
        </p>
      </Panel>
    )
  }

  return (
    <Panel
      title={def.displayName ?? def.type}
      description={`${def.type} · ${block.id.slice(0, 8)}`}
    >
      <div className="flex flex-col gap-3">
        {def.customProperties.map((property) => {
          const value = block.props[property.attributeName]
          const kind = resolveKind(property, value)
          const set = (v: unknown) => ed.updateProperty(block.id, property.attributeName, v)

          switch (kind) {
            case 'text':
              return <TextControl key={property.attributeName} property={property} value={String(value ?? '')} onChange={set} />
            case 'textarea':
              return <TextareaControl key={property.attributeName} property={property} value={String(value ?? '')} onChange={set} />
            case 'number':
              return <NumberControl key={property.attributeName} property={property} value={typeof value === 'number' ? value : 0} onChange={set} />
            case 'boolean':
              return <SwitchControl key={property.attributeName} property={property} value={!!value} onChange={set} />
            case 'select':
              return <SelectControl key={property.attributeName} property={property} value={String(value ?? '')} onChange={set} />
            case 'color':
              return <ColorControl key={property.attributeName} property={property} value={String(value ?? '')} onChange={set} />
            case 'datasource':
              return <DataSourceControl key={property.attributeName} property={property} value={String(value ?? '')} onChange={set} />
            case 'field':
              return <FieldControl key={property.attributeName} property={property} value={String(value ?? '')} onChange={set} blockProps={block.props} />
            case 'fieldList':
              return <FieldListControl key={property.attributeName} property={property} value={Array.isArray(value) ? value : []} onChange={set} />
            case 'columns':
              return <ColumnsControl key={property.attributeName} property={property} value={Array.isArray(value) ? value : []} onChange={set} />
            case 'sections':
              return <SectionsControl key={property.attributeName} property={property} value={Array.isArray(value) ? value : []} onChange={set} />
            default:
              return null
          }
        })}
      </div>
    </Panel>
  )
}
