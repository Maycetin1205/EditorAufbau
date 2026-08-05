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
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import type { DataSource } from '../../core/data/dataSources'
import { useDataSources } from '../../state/useDataSources'
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
  // Die Datenquellen-Bibliothek: kind 'quelle' waehlt daraus, und ein
  // 'field' mit quelleProp holt seine Feldliste aus der so gewaehlten Quelle.
  const quellen = useDataSources()
  const def = getBlockDefinition(block.type)

  const value = block.props[property.attributeName]
  const kind = property.kind
  const set = (v: unknown) => ed.updateProperty(block.id, property.attributeName, v)

  // Welche Quelle liefert die waehlbaren Felder? Normalerweise die Quelle in
  // Reichweite des Bausteins — mit quelleProp die Quelle, die in DIESER
  // Nachbar-Prop steht (die zweite Quelle, z. B. die Nachschlage-Liste).
  // Beides ueber dasselbe Feld-Control, kein zweites Bedienelement (Regel 2).
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

  // Ohne Quelle bleiben Daten-Controls unsichtbar — die gespeicherten Werte
  // bleiben erhalten und leben mit der Quelle wieder auf. Ein Feld-Control
  // haengt an SEINER Quelle (feldQuelle), nicht zwangslaeufig an der des
  // Bausteins: das Nachschlage-Feld hat oft gar keine eigene.
  if (property.requiresDataSource && !sourceInReach) return null
  if (kind === 'field' && !feldQuelle) return null

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
    // Datenquelle als Property: eine ZWEITE Quelle am Baustein für einen
    // eigenen Zweck — z. B. die Liste, aus der das Nachschlage-Feld wählen
    // lässt. Anzeigename sichtbar, Vorlagen-id (Technikwert) gespeichert;
    // gelöschte ids fallen auf '— keine —' zurück. Der Export sammelt diese
    // Quelle mit in die SEvariablen.
    case 'quelle':
      return (
        <SelectControl
          label={property.name}
          description={property.description}
          options={[
            { value: KEIN_FELD, label: '— keine —' },
            ...quellen.list.map((q) => ({ value: q.id, label: q.name })),
          ]}
          value={typeof value === 'string' && quellen.get(value) ? value : KEIN_FELD}
          onChange={(v) => {
            const neueId = v === KEIN_FELD ? '' : v
            if (neueId === String(value ?? '')) return
            set(neueId)
            // Die Felder, die AN dieser Quelle hängen, samt ihrer Klarnamen
            // leeren: sie zeigen sonst weiter auf Felder der VORHERIGEN
            // Quelle. Sichtbar wäre das nicht — im Inspector stünde ein
            // Feldname, den die neue Quelle gar nicht kennt, und erst der
            // Export blockte mit „Feld gibt es nicht (mehr)".
            for (const andere of def?.customProperties ?? []) {
              if (andere.quelleProp !== property.attributeName) continue
              ed.updateProperty(block.id, andere.attributeName, '')
              if (andere.klarnameProp) {
                ed.updateProperty(block.id, andere.klarnameProp, '')
              }
            }
          }}
        />
      )
    // Feld einer Datenquelle: Klarnamen sichtbar, Feldcode (Technikwert)
    // wird gespeichert — Muster DataSection/FieldPicker.
    case 'field':
      return (
        <SelectControl
          label={property.name}
          description={property.description}
          options={[
            { value: KEIN_FELD, label: '— keins —' },
            ...(feldQuelle?.fields.map((f) => ({ value: f.code, label: f.label })) ?? []),
          ]}
          value={value === '' || value == null ? KEIN_FELD : String(value)}
          onChange={(v) => {
            const code = v === KEIN_FELD ? '' : v
            set(code)
            // klarnameProp: der KLARNAME des gewählten Feldes wandert
            // zusätzlich in eine eigene Prop. Die Maske kennt sonst nur
            // Feldcodes (Regel 3) — im Nachschlage-Fenster stünde „10_30"
            // als Spaltenkopf statt „Name".
            if (property.klarnameProp) {
              const klarname = feldQuelle?.fields.find((f) => f.code === code)?.label ?? ''
              ed.updateProperty(block.id, property.klarnameProp, klarname)
            }
          }}
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
