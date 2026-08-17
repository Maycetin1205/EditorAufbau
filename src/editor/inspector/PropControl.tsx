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

// Die vier Auswahlen, die auf einen BESTAND zeigen (Feld, Quelle, Seite,
// Relation), laufen seit 2026-08-17 ueber DAS eine Waehler-Bauteil
// (ui/molecules/waehler): Klarname sichtbar, Kennung leise daneben, Suchzeile
// immer da. Vorher war jede davon ein eigenes SelectControl ohne Suche — vier
// von den 45 gezaehlten Bedienwegen. SelectControl bleibt fuer die Arten mit
// FESTER Optionsliste (select/segment), wo es nichts zu suchen gibt.
//
// Der frueher noetige Platzhalter KEIN_FELD ist damit weg: er stand nur da,
// weil Radix-Select kein leeres Option-Wort erlaubt. Der Waehler speichert
// den Leer-String direkt.

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
    // Bild als eingebetteter Daten-URI (N5). KEINE Eingabe-Sitzung: das
    // Waehlen ist EIN Schritt, kein Tippen — die Klammer, die viele
    // Tastendruecke zu einem Undo-Eintrag macht, hat hier nichts zu klammern.
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
            // EIN Bedienschritt = EIN Undo-Eintrag (Muster updateBlockEvents,
            // eingabeSitzung, zieheGroesse). Ohne die Klammer legte jeder
            // Teilschritt seinen eigenen Eintrag an: ein Dropdown-Klick am
            // Nachschlage-Feld kostete bis 2026-08-06 fuenf der 50
            // Undo-Plaetze — und EIN Strg+Z stellte genau den Mischzustand
            // her, den das Leeren unten verhindern soll (neue Quelle, alte
            // Feldcodes). Seit A7.2 ueber `transaktion`: das blanke
            // begin/end davor liess bei einem Wurf dazwischen den ganzen
            // Verlauf der Sitzung verstummen.
            ed.transaktion(() => {
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
            })
          }}
        />
      )
    // Feld einer Datenquelle: Klarnamen sichtbar, Feldcode (Technikwert)
    // wird gespeichert — Muster DataSection/FieldPicker.
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
            // Feldcode und Klarname gehoeren zusammen — EIN Undo-Eintrag fuer
            // beide (s. Klammer beim 'quelle'-Control oben). Getrennt liesse ein
            // Strg+Z den neuen Code mit dem alten Klarnamen stehen.
            ed.transaktion(() => {
              set(code)
              // klarnameProp: der KLARNAME des gewählten Feldes wandert
              // zusätzlich in eine eigene Prop. Die Maske kennt sonst nur
              // Feldcodes (Regel 3) — im Nachschlage-Fenster stünde „10_30"
              // als Spaltenkopf statt „Name".
              if (property.klarnameProp) {
                const klarname = feldQuelle?.fields.find((f) => f.code === code)?.label ?? ''
                ed.updateProperty(block.id, property.klarnameProp, klarname)
              }
            })
          }}
        />
      )
    // Seite DIESER Maske (Navi-Eintrag): waehlbar sind Hauptseite und
    // Ansichten — keine freien Links, keine externen Ziele (Nutzer-Vorgabe
    // 2026-08-12). Fenster-Seiten (Popups) stehen NICHT zur Wahl: sie
    // oeffnet eine Kette, nicht die Navi.
    // Gespeichert wird die id, sichtbar ist der Klarname — und derselbe
    // Klarname wandert ueber klarnameProp in eine eigene Prop, weil die
    // laufende Maske ihre Seite genau darueber findet (Editor-ids kennt sie
    // nicht). Eine geloeschte Seite faellt auf '— keine —' zurueck, ihr
    // Klarname bleibt aber am Eintrag stehen: er soll seine Beschriftung
    // nicht verlieren, nur weil woanders etwas geloescht wurde.
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
            // id und Klarname gehoeren zusammen — EIN Undo-Eintrag fuer
            // beide (Muster: das Feld-Control unten).
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
    // Relation-Vorlage aus der Bibliothek: Anzeigenamen sichtbar, Vorlagen-id
    // (Technikwert) wird gespeichert. '— keine —' schaltet den Schreibweg ab.
    // Gelöschte/unbekannte ids fallen auf '— keine —' zurück.
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
