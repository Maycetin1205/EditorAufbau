// DataSection
// Datenquelle an den selektierten Block hängen.
// Erscheint nur für Blöcke, deren Registry-Eintrag acceptsDataSource setzt
// (kein `if type===`). Der Bediener sieht Anzeigenamen der Vorlagen;
// gespeichert wird der Technikwert (Vorlagen-id) in der source-Prop.
//
// DER EINE Weg zur Datenquelle (2026-07-27, Nutzer-Entscheidung): vorher
// hatten drei Bausteine (Kanban, Datum, Formularfeld) dafür eine eigene
// umgeblätterte Panel-Ansicht, die Tabelle dieses Dropdown — zwei
// Bedienarten für dasselbe. Die Ansicht ist entfallen; ihre einzige echte
// Zutat, die Warnung bei geloeschter Vorlage, wohnt jetzt hier und gilt
// damit fuer ALLE Bausteine statt fuer drei.

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
  // Gewaehlte Vorlage geloescht? Dann steht hier eine id, zu der es keine
  // Option gibt — das Dropdown bliebe leer und der Baustein zoege still
  // keine Daten mehr. Stattdessen benennen wir den Zustand (Regel 4).
  const verwaist = source !== '' && !sources.some((s) => s.id === source)

  return (
    <div className="flex flex-col gap-1.5">
      <SelectControl
        label="Datenquelle"
        description="Tabelle, aus der dieser Baustein seine Daten bekommt."
        value={source === '' ? KEINE : source}
        options={[
          { value: KEINE, label: '— keine —' },
          ...sources.map((s) => ({ value: s.id, label: s.name })),
          ...(verwaist ? [{ value: source, label: '(gelöschte Quelle)' }] : []),
        ]}
        onChange={(v) => ed.updateProperty(block.id, 'source', v === KEINE ? '' : v)}
      />
      {verwaist && (
        <p className="text-xs text-destructive">
          Die gewählte Datenquelle fehlt in der Bibliothek. Neu wählen — oder
          unter Steuerung → Datenquellen wieder anlegen.
        </p>
      )}
    </div>
  )
}
