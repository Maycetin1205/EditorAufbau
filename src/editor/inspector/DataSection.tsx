// DataSection
// Datenquelle an den selektierten Block hängen.
// Erscheint nur für Blöcke, deren Registry-Eintrag acceptsDataSource setzt
// (kein `if type===`). Der Bediener sieht Anzeigenamen der Vorlagen;
// gespeichert wird der Technikwert (Vorlagen-id) in der source-Prop.

import type { BlockNode } from '../../core/blocks/BlockData'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { SelectControl } from './controls/SelectControl'

// Radix-Select verbietet '' als Option-Wert — interner Platzhalter für
// "keine Quelle" (die Prop bleibt dabei der Leer-String).
const KEINE = '__keine__'

interface DataSectionProps {
  block: BlockNode
}

export function DataSection({ block }: DataSectionProps) {
  const ed = useEditor()
  const sources = useDataSources().list
  const source = typeof block.props.source === 'string' ? block.props.source : ''

  return (
    <SelectControl
      label="Datenquelle"
      description="Tabelle, aus der dieser Baustein seine Daten bekommt."
      value={source === '' ? KEINE : source}
      options={[
        { value: KEINE, label: '— keine —' },
        ...sources.map((s) => ({ value: s.id, label: s.name })),
      ]}
      onChange={(v) => ed.updateProperty(block.id, 'source', v === KEINE ? '' : v)}
    />
  )
}
