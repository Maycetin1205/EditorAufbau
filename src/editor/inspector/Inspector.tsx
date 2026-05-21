// Inspector
// Liest den selektierten BlockData-State und die passende BlockDefinition.
// Baut daraus editierbare Controls fuer einfache Property-Typen.
// Migriert von Mantine auf src/ui (Tailwind + shadcn/ui-Style).

import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { useEditor } from '../../state/useEditor'
import { Panel } from '@/ui/panel'
import { NumberControl } from './controls/NumberControl'
import { TextControl } from './controls/TextControl'

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
      title="Inspector"
      description={`${def.type} · ${block.id.slice(0, 8)}`}
    >
      <div className="flex flex-col gap-3">
        {def.customProperties.map((property) => {
          const value = block.props[property.attributeName]

          if (typeof value === 'string') {
            return (
              <TextControl
                key={property.attributeName}
                property={property}
                value={value}
                onChange={(nextValue) =>
                  ed.updateProperty(block.id, property.attributeName, nextValue)
                }
              />
            )
          }

          if (typeof value === 'number') {
            return (
              <NumberControl
                key={property.attributeName}
                property={property}
                value={value}
                onChange={(nextValue) =>
                  ed.updateProperty(block.id, property.attributeName, nextValue)
                }
              />
            )
          }

          return (
            <p key={property.attributeName} className="text-sm text-muted-foreground">
              {property.name}: noch kein Control fuer diesen Werttyp
            </p>
          )
        })}
      </div>
    </Panel>
  )
}
