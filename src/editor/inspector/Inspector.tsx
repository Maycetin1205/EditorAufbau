// Inspector
// Property-Editor des selektierten Blocks. Liest die PropertyDescription des
// Blocks und baut daraus einfache Controls. Nutzt die gemeinsame SidePanel-Hülle.

import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type {
  PropertyDescription,
  PropertyKind,
} from '../../core/blocks/PropertyDescription'
import { useEditor } from '../../state/useEditor'
import { SidePanel } from '@/ui/molecules/side-panel'
import { DataSection } from './DataSection'
import { LayoutSection } from './LayoutSection'
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
  const block = ed.selectedNode

  if (!block) {
    return (
      <SidePanel title="Inspector">
        <p className="text-xs text-muted-foreground">Kein Block ausgewählt.</p>
      </SidePanel>
    )
  }

  const def = getBlockDefinition(block.type)
  if (!def) {
    return (
      <SidePanel title="Inspector">
        <p className="text-xs text-destructive">
          Keine Definition für Block-Typ &quot;{block.type}&quot; gefunden.
        </p>
      </SidePanel>
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
        return (
          <SelectControl
            key={property.attributeName}
            label={property.name}
            description={property.description}
            options={property.options ?? []}
            value={String(value ?? '')}
            onChange={set}
          />
        )
      default:
        return null
    }
  }

  return (
    <SidePanel
      title={def.displayName ?? def.type}
      description={`${def.type} · ${block.id.slice(0, 8)}`}
    >
      <div className="flex flex-col gap-5">
        {def.customProperties.length > 0 && (
          <div className="flex flex-col gap-3">
            {def.customProperties.map(renderPropControl)}
          </div>
        )}
        {/* Datenquelle anhängen (Kap. 5.1) — nur für Blöcke, die das per
            Registry-Flag können (Kanban). Kein Typ-Check. */}
        {def.acceptsDataSource && (
          <section className="flex flex-col gap-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Daten
            </h3>
            <DataSection block={block} />
          </section>
        )}
        <section className="flex flex-col gap-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Layout
          </h3>
          {/* Richtung/Abstände nur für Container, die diese Props auch
              deklarieren — spezialisierte Container (Kanban) haben festes
              Layout und bieten sie nicht an (kein Typ-Check, Registry-Daten). */}
          <LayoutSection
            block={block}
            isContainer={def.acceptsChildren && 'direction' in def.defaultProps}
          />
        </section>
      </div>
    </SidePanel>
  )
}
