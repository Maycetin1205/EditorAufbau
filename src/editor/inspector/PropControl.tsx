// PropControl
// Baut aus EINER PropertyDescription das passende Inspector-Control.
//
// Herausgeloest aus Inspector.tsx (2026-08-05): die Datei stand bei 418 von
// 500 erlaubten Zeilen, und die Control-Erzeugung ist der Teil, der mit jeder
// neuen Property-Art weiterwaechst — waehrend der Rest des Inspectors
// (Panel-Kopf, Sektionen, Unteraufgabe) stehen bleibt. Getrennt wachsen sie
// nicht mehr gegeneinander.
//
// Reine Verschiebung: Verhalten, Reihenfolge und Texte sind unveraendert.
// Regel 2 gilt hier besonders streng — dieses Modul kennt KEINEN Bausteintyp,
// nur die Beschreibung, die der Baustein selbst mitliefert.

import type { BlockNode } from '../../core/blocks/BlockData'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import type { DataSource } from '../../core/data/dataSources'
import { useRelations } from '../../state/useRelations'
import { useEditor } from '../../state/useEditor'
import { ColorTileControl } from './controls/ColorTileControl'
import { NumberControl } from './controls/NumberControl'
import { SegmentControl } from './controls/SegmentControl'
import { SelectControl } from './controls/SelectControl'
import { TextareaControl } from './controls/TextareaControl'
import { TextControl } from './controls/TextControl'
import { allOptionsHaveColor } from './optionColors'

// Radix-Select verbietet '' als Option-Wert — interner Platzhalter für
// "kein Feld gewählt" (die Prop bleibt dabei der Leer-String).
const KEIN_FELD = '__keins__'

// Eine Tipp-Sitzung in einem Text-/Zahlenfeld = EIN Undo-Schritt; der
// Inspector reicht die Klammer durch (siehe controls/eingabeSitzung.ts).
export interface Eingabesitzung {
  onBeginBearbeitung: () => void
  onEndeBearbeitung: () => void
}

export interface PropControlProps {
  block: BlockNode
  property: PropertyDescription
  /** Datenquelle in Reichweite — steuert Sichtbarkeit und Feldliste. */
  sourceInReach: DataSource | undefined
  sitzung: Eingabesitzung
  /**
   * Kompakt-Form INNERHALB einer geteilten Zeile (inspectorRow): ohne eigenes
   * Label — das Zeilen-Label steht schon, der Klarname bleibt als
   * zugaenglicher Name am Control. Arten ohne Kompakt-Form fallen auf die
   * normale volle Zeile zurueck.
   */
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
  // Relation-Vorlagen: die Auswahl im kind-'relation'-Control muss
  // neue/umbenannte Vorlagen sofort zeigen — liest aus dem RelationStore.
  const relations = useRelations()

  const value = block.props[property.attributeName]
  const kind = property.kind
  const set = (v: unknown) => ed.updateProperty(block.id, property.attributeName, v)

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

  // Ohne Quelle in Reichweite bleiben Daten-Controls unsichtbar — die
  // gespeicherten Werte bleiben erhalten und leben mit der Quelle wieder auf.
  if ((property.requiresDataSource || kind === 'field') && !sourceInReach) return null

  switch (kind) {
    case 'text':
      return <TextControl property={property} value={String(value ?? '')} onChange={set} {...sitzung} />
    case 'textarea':
      return <TextareaControl property={property} value={String(value ?? '')} onChange={set} {...sitzung} />
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
      // Sind ALLE Options-Werte in der Farb-Tabelle (optionColors)? Dann
      // Farb-Kacheln statt Dropdown — rein Editor-seitig, Regel 2 (kein
      // `if attr === 'variant'`). Sonst das normale Auswahl-Dropdown.
      return allOptionsHaveColor(opts)
        ? <ColorTileControl {...gemeinsam} />
        : <SelectControl {...gemeinsam} />
    }
    // Feld der Datenquelle in Reichweite: Klarnamen sichtbar,
    // Feldcode (Technikwert) wird gespeichert — Muster DataSection/FieldPicker.
    case 'field':
      return (
        <SelectControl
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
    // Relation-Vorlage aus der Bibliothek: Anzeigenamen sichtbar, Vorlagen-id
    // (Technikwert) wird gespeichert. '— keine —' schaltet den Schreibweg ab.
    // Gelöschte/unbekannte ids fallen auf '— keine —' zurück.
    case 'relation':
      return (
        <SelectControl
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
