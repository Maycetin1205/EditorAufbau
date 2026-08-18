import type { BlockNode } from '../../core/blocks/BlockData'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { quellenKennung, type DataSource } from '../../core/data/dataSources'
import { useDataSources } from '../../state/useDataSources'
import { useRelations } from '../../state/useRelations'
import { useEditor } from '../../state/useEditor'
import { BildControl } from './controls/BildControl'
import { ColorTileControl } from './controls/ColorTileControl'
import { NumberControl } from './controls/NumberControl'
import { SegmentControl } from './controls/SegmentControl'
import { SelectControl } from './controls/SelectControl'
import { TextareaControl } from './controls/TextareaControl'
import { TextControl } from './controls/TextControl'
import { WaehlerKnopf } from '@/ui/molecules/waehler'
import { allOptionsHaveColor } from './optionColors'

// Die zwei Rueckrufe, die der Inspector durchreicht: sie klammern eine
// Eingabe zu EINEM Undo-Schritt. Nicht zu verwechseln mit der
// `Eingabesitzung` in controls/eingabeSitzung — das ist der Hook, der
// diese Rueckrufe fuer ein einzelnes Eingabefeld auf/zu macht.
export interface BearbeitungsRueckrufe {
  onBeginBearbeitung: () => void
  onEndeBearbeitung: () => void
}

export interface PropControlProps {
  block: BlockNode
  property: PropertyDescription

  sourceInReach: DataSource | undefined
  sitzung: BearbeitungsRueckrufe

  kompakt?: boolean
}

export function PropControl({
  block,
  property,
  sourceInReach,
  sitzung,
  kompakt = false,
}: PropControlProps) {
  const ed = useEditor()

  const relations = useRelations()

  const quellen = useDataSources()
  const def = getBlockDefinition(block.type)

  const value = block.props[property.attributeName]
  const kind = property.kind
  const set = (v: unknown) => ed.updateProperty(block.id, property.attributeName, v)

  const feldQuelle = property.quelleProp
    ? quellen.get(String(block.props[property.quelleProp] ?? ''))
    : sourceInReach

  if (kompakt) {
    if (kind === 'number') {
      return <NumberControl property={property} value={value} onChange={set} {...sitzung} />
    }
    if (kind === 'segment') {
      return (
        <SegmentControl
          name={property.name}
          description={property.description}
          options={property.options ?? []}
          value={String(value ?? '')}
          onChange={set}
        />
      )
    }
    // Andere Arten haben keine Kompakt-Form — weiter in die volle Zeile.
  }

  if (property.requiresDataSource && !sourceInReach) return null
  if (kind === 'field' && !feldQuelle) return null

  switch (kind) {
    case 'text':
      return <TextControl property={property} value={String(value ?? '')} onChange={set} {...sitzung} />
    case 'textarea':
      return <TextareaControl property={property} value={String(value ?? '')} onChange={set} {...sitzung} />

    case 'bild':
      return <BildControl property={property} value={String(value ?? '')} onChange={set} />
    case 'number':
      return <NumberControl label={property.name} property={property} value={value} onChange={set} {...sitzung} />
    case 'segment':
      return (
        <SegmentControl
          label={property.name}
          name={property.name}
          description={property.description}
          options={property.options ?? []}
          value={String(value ?? '')}
          onChange={set}
        />
      )
    case 'select': {
      const opts = property.options ?? []
      const gemeinsam = {
        label: property.name,
        description: property.description,
        options: opts,
        value: String(value ?? ''),
        onChange: set,
      }

      return allOptionsHaveColor(opts)
        ? <ColorTileControl {...gemeinsam} />
        : <SelectControl {...gemeinsam} />
    }

    case 'quelle':
      return (
        <WaehlerKnopf
          label={property.name}
          description={property.description}
          bezeichnung={`Quelle für ${property.name}`}
          gruppen={[{
            key: 'quellen',
            eintraege: quellen.list.map((q) => ({
              wert: q.id,
              name: q.name,
              kennung: quellenKennung(q),
            })),
          }]}
          wert={typeof value === 'string' && quellen.get(value) ? value : ''}
          leerText="— keine —"
          onWaehle={(neueId) => {
            if (neueId === String(value ?? '')) return

            ed.transaktion(() => {
              set(neueId)

              for (const andere of def?.customProperties ?? []) {
                if (andere.quelleProp !== property.attributeName) continue
                ed.updateProperty(block.id, andere.attributeName, '')
                if (andere.klarnameProp) {
                  ed.updateProperty(block.id, andere.klarnameProp, '')
                }
              }
            })
          }}
        />
      )

    case 'field':
      return (
        <WaehlerKnopf
          label={property.name}
          description={property.description}
          bezeichnung={`Feld für ${property.name}`}
          gruppen={[{
            key: 'felder',
            name: feldQuelle?.name,
            kennung: feldQuelle ? quellenKennung(feldQuelle) : undefined,
            eintraege: (feldQuelle?.fields ?? []).map((f) => ({
              wert: f.code,
              name: f.label,
              kennung: f.code,
            })),
          }]}
          wert={value == null ? '' : String(value)}
          leerText="— keins —"
          onWaehle={(code) => {
            ed.transaktion(() => {
              set(code)

              if (property.klarnameProp) {
                const klarname = feldQuelle?.fields.find((f) => f.code === code)?.label ?? ''
                ed.updateProperty(block.id, property.klarnameProp, klarname)
              }
            })
          }}
        />
      )

    case 'seite': {
      const seiten = ed.pages.filter((s) => s.istFlaeche)
      return (
        <WaehlerKnopf
          label={property.name}
          description={property.description}
          bezeichnung={`Seite für ${property.name}`}
          gruppen={[{
            key: 'seiten',
            eintraege: seiten.map((s) => ({ wert: s.id, name: s.name })),
          }]}
          wert={seiten.some((s) => s.id === value) ? String(value) : ''}
          leerText="— keine —"
          onWaehle={(id) => {
            ed.transaktion(() => {
              set(id)
              if (property.klarnameProp) {
                ed.updateProperty(block.id, property.klarnameProp,
                  seiten.find((s) => s.id === id)?.name ?? '')
              }
            })
          }}
        />
      )
    }

    case 'relation':
      return (
        <WaehlerKnopf
          label={property.name}
          description={property.description}
          bezeichnung={`Relation für ${property.name}`}
          gruppen={[{
            key: 'relationen',
            eintraege: relations.list.map((r) => ({
              wert: r.id,
              name: r.name,
              kennung: r.nr,
            })),
          }]}
          wert={typeof value === 'string' && relations.get(value) ? value : ''}
          leerText="— keine —"
          onWaehle={set}
        />
      )
    default:
      return null
  }
}
