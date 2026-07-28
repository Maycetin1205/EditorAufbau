// FeldBindung — „Stelle anklicken → Feld wählen", vollständig an EINEM Ort.
//
// Bis 2026-07-28 lag das in zwei Hälften im BlockHost: der Picker für feste
// Stellen (bindableSpots) und der für bindbare Listen (listenBindung), dazu
// die Helfer für beide. Beide beantworten dieselbe Frage — „welche Felder
// bietet diese Stelle an, und was passiert bei der Wahl" — und beide bekamen
// dieselbe Datenquelle zweimal zusammengebaut.
//
// Herausgezogen, BEVOR die Mehr-Quellen-Auswahl dazukommt: die Antwort auf
// „welche Felder" wächst dort, und sie soll an einer Stelle wachsen, nicht an
// zwei. Der BlockHost behält Auswahl, Anfasser, Drag&Drop und Plus-Knopf.
//
// Generischer Editor-Code: importiert KEINEN Baustein (Regel 2) und kennt
// weder „Tabelle" noch „Spalte" — Prop-Name und Schlüssel kommen aus dem
// Registry-Eintrag. Reine Editor-Hilfe, erscheint nie im Export.

import { useCallback, useEffect, useState, type ReactNode, type RefObject } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import {
  bindingProp,
  listenStandardTitel,
  listeLesen,
  type BindableSpot,
  type ListenBindung,
} from '../../core/blocks/BlockDefinition'
import { zerlegeBindung } from '../../core/blocks/BlockDefinition'
import { paarKlartext, type QuelleInReichweite } from '../../core/data/sourceLinks'
import type { Editor } from '../../state/Editor'
import { FieldPicker, type PickerGruppe } from './FieldPicker'
import { bindingCode, useBindingPicker } from './useBindingPicker'

interface FeldBindungArgs {
  editor: Editor
  blockRef: RefObject<BlockNode>
  block: BlockNode
  selected: boolean | undefined
  bindableSpots: readonly BindableSpot[]
  listenBindung: ListenBindung | undefined
  // Alle Quellen in Reichweite, erste zuerst (Editor.quellenFor). Leer =
  // keine Quelle -> kein Picker.
  quellen: readonly QuelleInReichweite[]
  // Container-Element des Hosts: dort läuft das `ff-listen-bind`-Ereignis auf.
  containerRef: RefObject<HTMLDivElement | null>
  onSelect?: () => void
}

// Aus den erreichbaren Quellen die Abschnitte des Pickers bauen. Die ERSTE
// bleibt unqualifiziert (quelleId '') — sonst gäbe es zwei Schreibweisen für
// dasselbe Ziel; bei den weiteren steht der Verknüpfungs-Hinweis dabei.
function pickerGruppen(quellen: readonly QuelleInReichweite[]): PickerGruppe[] {
  const erste = quellen[0]?.source
  return quellen.map((q, i) => (i === 0
    ? { quelleId: '', name: q.source.name, fields: q.source.fields }
    : {
        quelleId: q.source.id,
        name: q.source.name,
        hinweis: paarKlartext(q.paare ?? [], erste),
        fields: q.source.fields,
      }))
}

// Klarname eines gebundenen Werts — aufgelöst gegen die GENANNTE Quelle.
// Unbekannt (Quelle weg, Feld weg) -> '' , damit der Aufrufer entscheidet.
function klarnameVon(wert: string, quellen: readonly QuelleInReichweite[]): string {
  const { quelleId, code } = zerlegeBindung(wert)
  const quelle = quelleId === ''
    ? quellen[0]?.source
    : quellen.find((q) => q.source.id === quelleId)?.source
  return quelle?.fields.find((f) => f.code === code)?.label ?? ''
}

// Liefert die Klick-Behandler für den Host-Rahmen und die fertig gerenderten
// Picker. Ein Hook statt einer Komponente, weil onClick/onDoubleClick am
// äußeren Rahmen des BlockHost hängen müssen — dieselbe Bauart wie die
// Nachbarn useBindingPicker / useBlockResize / useLitElement.
export function useFeldBindung({
  editor,
  blockRef,
  block,
  selected,
  bindableSpots,
  listenBindung,
  quellen,
  containerRef,
  onSelect,
}: FeldBindungArgs): {
  onClick: (e: ReactMouseEvent<HTMLDivElement>) => void
  onDoubleClick: (e: ReactMouseEvent<HTMLDivElement>) => void
  pickers: ReactNode
} {
  // Ohne erste Quelle gibt es nichts zu binden — dieselbe Bedingung wie zuvor
  // („Quelle in Reichweite"), nur aus der Liste gelesen.
  const hatQuelle = quellen.length > 0

  // ---- Klick-auf-Stelle-Binding (feste Stellen) ----
  const { picker, closePicker, onClick, onDoubleClick } = useBindingPicker({
    editor,
    blockRef,
    selected,
    bindableSpots,
    hatQuelle,
    onSelect,
  })

  // ---- Feld-Picker fuer bindbare LISTEN ----
  // Ein Baustein mit `listenBindung` (Registry) meldet per Custom Event
  // `ff-listen-bind`, dass der Bediener einen Listen-Eintrag an ein Feld
  // binden will — die Tabelle tut das an ihren Spaltenkoepfen. Gelesen werden
  // Prop-Name und Schluessel aus dem Registry-Eintrag (Regel 2 — Faehigkeiten
  // sind Registry-Eintraege), nie ein Bausteintyp.
  const [listenPicker, setListenPicker] = useState<{
    index: number
    top: number
    left: number
  } | null>(null)
  const closeListenPicker = useCallback(() => setListenPicker(null), [])
  if (!selected && listenPicker !== null) setListenPicker(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || !listenBindung) return
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        prop?: string
        index?: number
        top?: number
        left?: number
      }
      // Nur die eigene Liste bedienen (ein Baustein koennte spaeter mehrere haben).
      if (detail?.prop !== listenBindung.prop || typeof detail.index !== 'number') return
      setListenPicker({
        index: detail.index,
        top: Math.max(8, detail.top ?? 0),
        left: Math.max(8, Math.min(detail.left ?? 0, window.innerWidth - 248)),
      })
    }
    el.addEventListener('ff-listen-bind', handler)
    return () => el.removeEventListener('ff-listen-bind', handler)
  }, [containerRef, listenBindung])

  const gruppen = pickerGruppen(quellen)

  const pickers = (
    <>
      {selected && picker && hatQuelle && (
        <FieldPicker
          spotLabel={picker.spot.label}
          gruppen={gruppen}
          current={bindingCode(block.props, picker.spot)}
          top={picker.top}
          left={picker.left}
          onPick={(wert) => {
            editor.updateProperty(blockRef.current.id, bindingProp(picker.spot.prop), wert)
            closePicker()
          }}
          onClose={closePicker}
        />
      )}
      {selected && listenPicker && hatQuelle && listenBindung && (() => {
        const liste = listeLesen(block.props[listenBindung.prop], listenBindung)
        const eintrag = liste[listenPicker.index]
        if (!eintrag) return null
        const titelJetzt = String(eintrag[listenBindung.titelKey] ?? '')
        return (
          <FieldPicker
            spotLabel={titelJetzt}
            gruppen={gruppen}
            current={String(eintrag[listenBindung.feldKey] ?? '')}
            top={listenPicker.top}
            left={listenPicker.left}
            onPick={(wert) => {
              const next = listeLesen(block.props[listenBindung.prop], listenBindung)
              const ziel = next[listenPicker.index]
              if (ziel) {
                // Feld gewaehlt = Klarname in den Titel, IMMER (Nutzer-
                // Entscheidung 2026-07-27). Die Vorfassung schuetzte selbst
                // getippte Titel — nach dem ersten Binden galt aber der
                // eingesetzte Klarname selbst als getippt, und ein Umstellen
                // auf ein anderes Feld liess den alten Titel stehen: die
                // Spalte hiess „Tiername" und zeigte Zimmer. Lieber einmal
                // zu viel umbenennen als eine Spalte, die luegt; wer einen
                // eigenen Titel will, tippt ihn nach dem Binden.
                //
                // Der Titel ist REINER Klarname, ohne Quellenzusatz und ohne
                // Fremd-Zeichen: die Spaltenueberschrift ist echter
                // Masken-Inhalt, den der Bediener in SoftEngine sieht — dort
                // hat kein Editor-Hinweis etwas zu suchen (Regel 1). Aufgeloest
                // wird gegen die GENANNTE Quelle, sonst hiesse die Spalte nach
                // einem gleich codierten Feld der ersten.
                ziel[listenBindung.titelKey] = wert === ''
                  ? listenStandardTitel(listenBindung, listenPicker.index)
                  : klarnameVon(wert, quellen) || wert
                ziel[listenBindung.feldKey] = wert
                editor.updateProperty(block.id, listenBindung.prop, next)
              }
              closeListenPicker()
            }}
            onClose={closeListenPicker}
          />
        )
      })()}
    </>
  )

  return { onClick, onDoubleClick, pickers }
}
