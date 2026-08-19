import { useMemo } from 'react'
import { Copy, MousePointer2 } from '@/ui/zeichen'
import { bindingProp } from '../../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { editorAngabenVon } from '../../core/blocks/editorAngaben'
import { propertySichtbar, type PropertyDescription } from '../../core/blocks/PropertyDescription'
import { darfAuswahlFolgen, traegtEigeneQuelle } from '../../core/blocks/treeQuery'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { IconButton } from '@/ui/atoms/icon-button'
import { Field } from '@/ui/molecules/field'
import { SidePanel } from '@/ui/molecules/side-panel'
import { cn } from '@/lib/utils'
import { bausteinName } from '../../core/blocks/bausteinName'
import { AktionenSektion } from './AktionenSektion'
import { AuswahlFolgeSektion } from './AuswahlFolgeSektion'
import { PropControl } from './PropControl'
import { QuellenListe } from './QuellenListe'

interface InspectorZeile {
  row?: string
  props: PropertyDescription[]
}

function inspectorZeilen(props: PropertyDescription[]): InspectorZeile[] {
  const zeilen: InspectorZeile[] = []
  for (const p of props) {
    const letzte = zeilen[zeilen.length - 1]
    if (p.inspectorRow && letzte?.row === p.inspectorRow) letzte.props.push(p)
    else zeilen.push({ row: p.inspectorRow, props: [p] })
  }
  return zeilen
}

export function Inspector() {
  const ed = useEditor()

  const quellen = useDataSources()

  const sitzung = useMemo(() => ({
    onBeginBearbeitung: () => ed.beginTransaction(),
    onEndeBearbeitung: () => ed.endTransaction(),
  }), [ed])
  const block = ed.selectedNode

  if (!block) {
    return (
      <SidePanel title="Inspector">

        <div className="flex flex-col items-center gap-1.5 rounded-md border border-dashed border-border bg-card/70 px-6 py-6 text-center">
          <MousePointer2 size={18} className="text-muted-foreground/60" />
          <p className="text-[0.8125rem] font-medium text-foreground/80">Kein Block ausgewählt.</p>
          <p className="text-xs text-muted-foreground">
            Wähle einen Baustein auf der Fläche.
          </p>
        </div>
      </SidePanel>
    )
  }

  const def = getBlockDefinition(block.type)

  const hinweis = editorAngabenVon(block.type).hinweis
  if (!def) {
    return (
      <SidePanel title="Inspector">
        <p className="text-xs text-destructive">
          Keine Definition für Block-Typ &quot;{block.type}&quot; gefunden.
        </p>
      </SidePanel>
    )
  }

  const blockName = bausteinName(block, quellen.list)

  const sourceInReach = ed.dataSourceFor(block.id)

  const propControl = (property: PropertyDescription, kompakt = false) => (
    <PropControl
      key={property.attributeName}
      block={block}
      property={property}
      sourceInReach={sourceInReach}
      sitzung={sitzung}
      kompakt={kompakt}
    />
  )

  const amBausteinGebunden = new Set<string>(
    (def.bindableSpots ?? []).map((spot) => bindingProp(spot.prop)),
  )

  const klarnameProps = new Set<string>(
    def.customProperties.map((p) => p.klarnameProp).filter((n): n is string => n !== undefined),
  )
  const visibleProps = def.customProperties.filter((p) => {
    if (amBausteinGebunden.has(p.attributeName)) return false
    if (klarnameProps.has(p.attributeName)) return false

    return propertySichtbar(p.visibleWhen, block.props)
  })

  const dataProps = visibleProps.filter(
    (p) => p.requiresDataSource || p.kind === 'field' || p.kind === 'quelle' || p.kind === 'relation',
  )
  const generalProps = visibleProps.filter((p) => !dataProps.includes(p))

  const showDataSection = traegtEigeneQuelle(block)
    || dataProps.some((p) => p.quelleProp !== undefined || sourceInReach !== undefined)

  return (
    <SidePanel
      title={blockName}

      actions={(
        <IconButton
          aria-label="Duplizieren (Ctrl+D)"
          title="Duplizieren"
          onClick={() => ed.duplicateBlock(block.id)}
        >
          <Copy size={14} />
        </IconButton>
      )}
    >

      <div className="flex flex-col">
        {generalProps.length > 0 && (
          <div className="flex flex-col gap-3">

            {inspectorZeilen(generalProps).map((zeile) =>
              zeile.row ? (
                <Field key={`zeile:${zeile.row}`} label={zeile.row}>
                  {() => (
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      {zeile.props.map((p) => propControl(p, true))}
                    </div>
                  )}
                </Field>
              ) : (
                propControl(zeile.props[0])
              ),
            )}
          </div>
        )}

        {showDataSection && (
          <div
            className={cn(
              'flex flex-col gap-3',
              generalProps.length > 0 && 'mt-4 border-t border-border pt-4',
            )}
          >

            {traegtEigeneQuelle(block) && <QuellenListe block={block} />}
            {dataProps.map((p) => propControl(p))}
          </div>
        )}

        {darfAuswahlFolgen(block) && (
          <AuswahlFolgeSektion
            block={block}
            mitTrenner={generalProps.length > 0 || showDataSection}
          />
        )}

        {def.blockEvents && def.blockEvents.length > 0 && (
          <div
            className={cn(
              'flex flex-col gap-3',
              (generalProps.length > 0 || showDataSection) && 'mt-4 border-t border-border pt-4',
            )}
          >
            <AktionenSektion
              block={block}
              events={def.blockEvents}
            />
          </div>
        )}

        {hinweis && (
          <p
            className={cn(
              'text-xs leading-relaxed text-muted-foreground',
              (generalProps.length > 0 || showDataSection
                || (def.blockEvents && def.blockEvents.length > 0)) && 'mt-3',
            )}
          >
            {hinweis}
          </p>
        )}

      </div>
    </SidePanel>
  )
}
