// Inspector
// Property-Editor des selektierten Blocks. Liest die PropertyDescription des
// Blocks und baut daraus einfache Controls. Nutzt die gemeinsame SidePanel-Hülle.

import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type {
  PropertyDescription,
  PropertyKind,
} from '../../core/blocks/PropertyDescription'
import { useDataSources } from '../../state/useDataSources'
import { useRelations } from '../../state/useRelations'
import { useEditor } from '../../state/useEditor'
import { SidePanel } from '@/ui/molecules/side-panel'
import { BindungsAnschluss } from '../strecke/BindungsAnschluss'
import { DataSection } from './DataSection'
import { LayoutSection } from './LayoutSection'
import { SelectControl } from './controls/SelectControl'
import { TextareaControl } from './controls/TextareaControl'
import { TextControl } from './controls/TextControl'

// Radix-Select verbietet '' als Option-Wert — interner Platzhalter für
// "kein Feld gewählt" (die Prop bleibt dabei der Leer-String).
const KEIN_FELD = '__keins__'

function resolveKind(property: PropertyDescription, value: unknown): PropertyKind {
  if (property.kind) return property.kind
  if (typeof value === 'string') return 'text'
  return 'text'
}

export function Inspector() {
  const ed = useEditor()
  // Vorlagen-Änderungen (Kap. 5.4) müssen Feldlisten/Sichtbarkeit sofort
  // nachziehen — dataSourceFor liest aus dem DataSourceStore.
  useDataSources()
  // Relation-Vorlagen (Kap. 5.5): die Auswahl im kind-'relation'-Control muss
  // neue/umbenannte Vorlagen sofort zeigen — liest aus dem RelationStore.
  const relations = useRelations()
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

  // Datenquelle in Reichweite (Kap. 5.3): steuert die Sichtbarkeit von
  // requiresDataSource-Controls und liefert die Feldliste für kind 'field'.
  const sourceInReach = ed.dataSourceFor(block.id)

  const renderPropControl = (property: PropertyDescription) => {
    const value = block.props[property.attributeName]
    const kind = resolveKind(property, value)
    const set = (v: unknown) => ed.updateProperty(block.id, property.attributeName, v)
    // Ohne Quelle in Reichweite bleiben Daten-Controls unsichtbar — die
    // gespeicherten Werte bleiben erhalten und leben mit der Quelle wieder auf.
    if ((property.requiresDataSource || kind === 'field') && !sourceInReach) return null

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
      // Feld der Datenquelle in Reichweite (Kap. 5.3): Klarnamen sichtbar,
      // Feldcode (Technikwert) wird gespeichert — Muster DataSection/FieldPicker.
      case 'field':
        return (
          <SelectControl
            key={property.attributeName}
            label={property.name}
            description={property.description}
            options={[
              { value: KEIN_FELD, label: '— keins —' },
              ...(sourceInReach?.fields.map((f) => ({ value: f.code, label: f.label })) ?? []),
            ]}
            value={value === '' || value == null ? KEIN_FELD : String(value)}
            onChange={(v) => set(v === KEIN_FELD ? '' : v)}
          />
        )
      // Relation-Vorlage aus der Bibliothek (Kap. 5.5): Anzeigenamen sichtbar,
      // Vorlagen-id (Technikwert) wird gespeichert. '— keine —' schaltet den
      // Schreibweg ab. Gelöschte/unbekannte ids fallen auf '— keine —' zurück.
      case 'relation':
        return (
          <SelectControl
            key={property.attributeName}
            label={property.name}
            description={property.description}
            options={[
              { value: KEIN_FELD, label: '— keine —' },
              ...relations.list.map((r) => ({ value: r.id, label: r.name })),
            ]}
            value={
              typeof value === 'string' && relations.get(value) ? value : KEIN_FELD
            }
            onChange={(v) => set(v === KEIN_FELD ? '' : v)}
          />
        )
      default:
        return null
    }
  }

  // Im eigenen Datenanschluss-Dialog gepflegte Props bekommen kein
  // zweites Inspector-Control.
  const visibleProps = def.customProperties.filter((p) => !p.hiddenInInspector)
  // Daten-Controls (Kap. 5.3/5.5) gehören in die Sektion "Daten", nicht in
  // die allgemeine Gruppe: alles, was nur mit Quelle in Reichweite sinnvoll ist.
  const dataProps = visibleProps.filter(
    (p) => p.requiresDataSource || p.kind === 'field' || p.kind === 'relation',
  )
  const generalProps = visibleProps.filter((p) => !dataProps.includes(p))
  // Sektion zeigen, wenn der Block eine Quelle anhängen kann (Kanban) ODER
  // seine Daten-Controls gerade sichtbar wären (z. B. Spalte unter einem
  // Board mit Quelle). Kein Typ-Check, alles Registry-Daten.
  const showDataSection = def.acceptsDataSource
    || (dataProps.length > 0 && sourceInReach !== undefined)

  return (
    <SidePanel
      title={def.displayName ?? def.type}
      description={`${def.type} · ${block.id.slice(0, 8)}`}
    >
      <div className="flex flex-col gap-5">
        {generalProps.length > 0 && (
          <div className="flex flex-col gap-3">
            {generalProps.map(renderPropControl)}
          </div>
        )}
        {/* Datenquelle anhängen (Kap. 5.1) + Daten-Controls (Kap. 5.3) —
            nur für Blöcke, die das per Registry deklarieren. Kein Typ-Check. */}
        {showDataSection && (
          <section className="flex flex-col gap-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Daten
            </h3>
            {/* Board-Datenanschluss: Quelle + Einsortieren-Feld im eigenen Dialog. */}
            {def.bindingRoute
              ? <BindungsAnschluss block={block} />
              : def.acceptsDataSource && <DataSection block={block} />}
            {dataProps.map(renderPropControl)}
          </section>
        )}
        {/* Blöcke mit festgelegter Breite und ohne Richtungs-Props (Kanban-
            Spalte/Vorlagen-Kasten, K0) haben keine Layout-Einstellungen —
            Sektion ganz weg statt leer. */}
        {(def.lockedWidth === undefined
          || (def.acceptsChildren && 'direction' in def.defaultProps)) && (
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
        )}
      </div>
    </SidePanel>
  )
}
