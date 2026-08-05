// Inspector
// Property-Editor des selektierten Blocks. Liest die PropertyDescription des
// Blocks und baut daraus einfache Controls. Nutzt die gemeinsame SidePanel-Hülle.
//
// Unteraufgabe (R3-Feinschliff 2026-07-21): das Schritt-Formular blättert das
// Panel um, statt es als Modal/Overlay zu überlagern. („Daten anschließen"
// tat das bis 2026-07-27 auch — die Ansicht ist ersatzlos entfallen, die
// Datenquelle wird jetzt direkt hier im Panel gewählt, wie bei der Tabelle.)
// Der Inspector hält dafür genau EINEN Zustand `unteraufgabe`;
// ist er gesetzt, wechselt der Panel-Inhalt komplett zur Aufgabe (SidePanel
// im Rückzeilen-Modus, 340 px unverändert). Escape blättert zurück — capture
// + stopPropagation, exakt die Schichtung, die vorher FormularKarte/Modal
// hatten. Ein Baustein-Wechsel schließt eine offene Unteraufgabe.

import { useEffect, useMemo, useState } from 'react'
import { Copy, MousePointer2, Trash } from 'lucide-react'
import { bindingProp } from '../../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { editorAngabenVon } from '../../core/blocks/editorAngaben'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import type { ActionStep } from '../../core/data/aktionen'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { IconButton } from '@/ui/atoms/icon-button'
import { Field } from '@/ui/molecules/field'
import { SidePanel } from '@/ui/molecules/side-panel'
import { cn } from '@/lib/utils'
import { StepForm } from '../zentrale/StepForm'
import { eigenerText } from '../zentrale/helfer'
import { AktionenSektion } from './AktionenSektion'
import { AuswahlFolgeSektion } from './AuswahlFolgeSektion'
import { PropControl } from './PropControl'
import { QuellenListe } from './QuellenListe'

// Offene Unteraufgabe des Inspector-Panels (null = normale Property-Ansicht).
// Seit dem Wegfall der Datenanschluss-Ansicht (2026-07-27) gibt es nur noch
// EINE Unteraufgabe — das Schritt-Formular; deshalb kein Unterscheider mehr.
interface Unteraufgabe {
  eventKey: string
  step?: ActionStep
}

// Benachbarte Properties mit gleichem inspectorRow teilen sich EINE
// Inspector-Zeile (ein Label, Controls nebeneinander) — Registry-Daten,
// Regel 2: der Inspector kennt keinen Baustein, nur die Beschreibung.
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
  // Vorlagen-Änderungen müssen Feldlisten/Sichtbarkeit sofort
  // nachziehen — dataSourceFor liest aus dem DataSourceStore.
  useDataSources()
  // (Die Relation-Vorlagen abonniert PropControl selbst — nur dort werden
  // sie gelesen.)
  // Eine Tipp-Sitzung in einem Text-/Zahlenfeld = EIN Undo-Schritt. Dieselbe
  // Transaktions-Klammer wie beim Ziehen; die Controls entscheiden selbst,
  // wann sie sie oeffnen (siehe controls/eingabeSitzung.ts).
  const sitzung = useMemo(() => ({
    onBeginBearbeitung: () => ed.beginTransaction(),
    onEndeBearbeitung: () => ed.endTransaction(),
  }), [ed])
  const block = ed.selectedNode

  // Panel-Umblättern (R3-Feinschliff): welche Unteraufgabe ist offen?
  const [unteraufgabe, setUnteraufgabe] = useState<Unteraufgabe | null>(null)
  // Die Unteraufgabe gehört zum gewählten Baustein — wechselt (oder
  // verschwindet) die Auswahl, verwerfen wir sie noch WÄHREND des Renderns.
  // Reacts Muster „State beim Auswahl-Wechsel anpassen" (kein setState im
  // Effekt, keine Kaskaden), damit nie das Formular eines fremden Blocks bleibt.
  const [aufgabenBlock, setAufgabenBlock] = useState(block?.id)
  if (aufgabenBlock !== block?.id) {
    setAufgabenBlock(block?.id)
    setUnteraufgabe(null)
  }

  // Escape blättert zurück: capture + stopPropagation wie zuvor bei
  // FormularKarte/Modal (Escape-Schichtung erhalten). Nur aktiv, solange eine
  // Unteraufgabe offen ist — die normale Ansicht fängt kein Escape ab.
  useEffect(() => {
    if (!unteraufgabe) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setUnteraufgabe(null)
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [unteraufgabe])

  if (!block) {
    return (
      <SidePanel title="Inspector">
        {/* Leer-Zustand als kleine gestrichelte Hinweis-Karte — gleicher Stil
            wie der Canvas-Leerzustand, damit die Fuehrung im Editor eine
            Sprache spricht (R2 2026-07-21). */}
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
  // Hinweiszeile des Bausteins (blocks/<x>/editorAngaben.ts) — fehlt sie,
  // zeigt das Panel keine.
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

  // Sprechender Name im Kopf: der Eigentext des Bausteins (z. B. der
  // Formularfeld-Platzhalter „Vorname"), sonst der Baustein-Typ. Ein noch
  // unveränderter Default-Text zählt nicht als Eigenname (eigenerText mit
  // defaultProps), damit ein frisches Feld weiter „Formularfeld" heißt.
  const blockName = eigenerText(block.props, def.defaultProps) || (def.displayName ?? def.type)

  // Schritt speichern: dieselbe „ersetzen oder anhängen"-Regel wie zuvor in
  // der AktionenSektion — ein Bedienschritt = EIN Undo-Eintrag
  // (updateBlockEvents). StepForm ruft danach onClose (= zurückblättern).
  const speichereSchritt = (eventKey: string, bearbeitet: ActionStep | undefined, step: ActionStep) => {
    const node = ed.tree[block.id]
    if (!node) return
    const kette = node.events?.[eventKey] ?? []
    const next = bearbeitet
      ? kette.map((s) => (s.id === step.id ? step : s))
      : [...kette, step]
    ed.updateBlockEvents(block.id, { ...(node.events ?? {}), [eventKey]: next })
  }

  // Panel umgeblättert: der Inhalt IST die Unteraufgabe (kein Modal, keine
  // Abdunklung). Rückzeile „← <Baustein>" + Titel der Aufgabe, Formular
  // unverändert darunter. Escape/„Fertig"/„←" blättern zurück.
  if (unteraufgabe) {
    const titel = unteraufgabe.step ? 'Schritt bearbeiten' : 'Neuer Schritt'
    return (
      <SidePanel title={titel} backLabel={blockName} onBack={() => setUnteraufgabe(null)}>
        <StepForm
          step={unteraufgabe.step}
          kette={ed.tree[block.id]?.events?.[unteraufgabe.eventKey] ?? []}
          onClose={() => setUnteraufgabe(null)}
          onSave={(step) => speichereSchritt(unteraufgabe.eventKey, unteraufgabe.step, step)}
        />
      </SidePanel>
    )
  }

  // Datenquelle in Reichweite: steuert die Sichtbarkeit von
  // requiresDataSource-Controls und liefert die Feldliste für kind 'field'.
  const sourceInReach = ed.dataSourceFor(block.id)

  // Ein Control je Property — gebaut wird es in PropControl (Regel 2: dort
  // steht kein Bausteintyp, nur die Beschreibung). `kompakt` ist die Form
  // INNERHALB einer geteilten Zeile (inspectorRow): ohne eigenes Label, weil
  // das Zeilen-Label schon steht.
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

  // Ein Wert, EIN Schalter (2026-07-27, Nutzer-Entscheidung): Stellen, die am
  // Baustein selbst anklickbar sind (bindableSpots), tragen ihre Bindung in der
  // Prop `<Stelle>Field`. Dafür gehört KEIN zweites Bedienelement in den
  // Inspector — sonst setzen zwei Schalter denselben Wert und niemand weiß,
  // welcher gilt (Regel 7: Bedienung am Ding, Inspector nur für Unzeigbares).
  // Registry-getrieben über bindingProp = die EINE Namensstelle: greift
  // automatisch für jeden künftigen Baustein, niemand muss daran denken.
  // Bausteine ohne anklickbare Stelle (Kanban „Einsortieren nach") behalten
  // ihr Control — dort gibt es nichts zum Anklicken.
  const amBausteinGebunden = new Set<string>(
    (def.bindableSpots ?? []).map((spot) => bindingProp(spot.prop)),
  )
  const visibleProps = def.customProperties.filter((p) => {
    if (amBausteinGebunden.has(p.attributeName)) return false
    if (!p.visibleWhen) return true
    return Object.is(block.props[p.visibleWhen.attributeName], p.visibleWhen.equals)
  })
  // Daten-Controls gehören in die Sektion "Daten", nicht in
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
      title={blockName}
      // Keine Technik-Unterzeile mehr (Typ-Code · ID) — Technikwerte sind
      // unsichtbar (Regel 3, Nutzer-Entscheidung 2026-07-21). Der Klarname
      // im Kopf sagt dem Bediener, welcher Baustein gewählt ist.
      // Bedienung am Ding (Regel 7): Duplizieren/Löschen stehen bei der
      // Auswahl, nicht in der globalen Top-Bar (R1-Feinschliff 2026-07-21).
      actions={(
        <>
          <IconButton
            aria-label="Duplizieren (Ctrl+D)"
            title="Duplizieren"
            onClick={() => ed.duplicateBlock(block.id)}
          >
            <Copy size={14} />
          </IconButton>
          <IconButton
            aria-label="Löschen (Entf)"
            title="Löschen"
            onClick={() => ed.removeBlock(block.id)}
          >
            <Trash size={14} />
          </IconButton>
        </>
      )}
    >
      {/* Keine Abschnitts-Überschriften mehr (Nutzer-Entscheidung 2026-07-21):
          erst Inhalt (generalProps), dann Daten — die feste Ordnung bleibt,
          zwischen den Gruppen höchstens eine feine Trennlinie, sonst nichts. */}
      <div className="flex flex-col">
        {generalProps.length > 0 && (
          <div className="flex flex-col gap-3">
            {/* Zeilen-Gruppierung (inspectorRow): z. B. „Text-Stil" =
                Größe | Gewicht | Ausrichtung in EINER kompakten Zeile. */}
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
        {/* Datenquelle anhängen (Kap. 5.1) + Daten-Controls (Kap. 5.3) —
            nur für Blöcke, die das per Registry deklarieren. Kein Typ-Check.
            Feine Trennlinie NUR, wenn eine Inhalt-Gruppe darüber steht. */}
        {showDataSection && (
          <div
            className={cn(
              'flex flex-col gap-3',
              generalProps.length > 0 && 'mt-4 border-t border-border pt-4',
            )}
          >
            {def.acceptsDataSource && <QuellenListe block={block} />}
            {dataProps.map((p) => propControl(p))}
          </div>
        )}
        {/* Auswahl folgen (2026-08-05): nur fuer Bausteine, die es per
            Registry koennen (kannAuswahlFolgen) — kein Typ-Check. Die
            Sektion laesst sich selbst weg, wenn es keinen Geber gibt. */}
        {def.kannAuswahlFolgen && (
          <AuswahlFolgeSektion
            block={block}
            mitTrenner={generalProps.length > 0 || showDataSection}
          />
        )}
        {/* Aktionen (R3 2026-07-21): die Ereignis-Ketten des Bausteins wohnen
            jetzt hier, nicht mehr in der Steuerung. Nur für Bausteine, die per
            Registry Ereignisse deklarieren (blockEvents) — kein Typ-Check.
            Feine Trennlinie, wenn Inhalt/Daten darüber stehen. */}
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
              onEditStep={(eventKey, step) => setUnteraufgabe({ eventKey, step })}
            />
          </div>
        )}
        {/* Hinweiszeile aus der Registry — deklariert vom Baustein selbst in
            blocks/<x>/editorAngaben.ts: nur für Bausteine, deren Panel sonst
            leer/fast leer aussieht — sagt in EINEM Satz, wo die Bedienung
            stattdessen stattfindet (Regel 7). */}
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
        {/* KEINE Layout-Sektion (Nutzer-Anweisung 2026-07-14):
            Breite und Höhe zeigen sich am Block selbst — Zieh-Anfasser am
            selektierten Block, Doppelklick auf den Anfasser = Standard. */}
      </div>
    </SidePanel>
  )
}
