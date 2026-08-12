// useBindingPicker
// Klick-auf-Stelle-Binding (
// wörtlich aus BlockHost.tsx gezogen). Klick auf eine bindbare Stelle des
// SCHON selektierten Blocks öffnet den Feld-Picker. Verzögert (Timer),
// damit ein Doppelklick (= Inline-Edit einer ungebundenen Stelle) den
// Picker nicht zusätzlich aufreißt.
//
// Hier hängt AUSSERDEM der Klick, der die Auswahl meldet (onSelect) — der
// Host-Rahmen hat genau einen onClick, und diese Datei besitzt ihn. Seit U8
// meldet er mit, ob der Klick auf einer Stelle des Bausteins landete
// (aufBedienstelle, s. u.).

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, RefObject } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import { bindingProp, type BindableSpot } from '../../core/blocks/BlockDefinition'
import type { Editor } from '../../state/Editor'

// Gebundener Feldcode einer Stelle ('' = ungebunden) — Bindung liegt in der
// Prop `<prop>Field` (Bindungs-Konvention, bindingProp in BlockDefinition).
export function bindingCode(props: Record<string, unknown>, spot: BindableSpot): string {
  const code = props[bindingProp(spot.prop)]
  return typeof code === 'string' ? code : ''
}

interface BindingPickerArgs {
  editor: Editor
  blockRef: RefObject<BlockNode>
  selected: boolean | undefined
  bindableSpots: readonly BindableSpot[]
  // Gibt es an dieser Stelle überhaupt etwas zu wählen? Quelle(n) in
  // Reichweite ODER das Bibliotheks-Angebot (ohne zugewiesene Quelle bietet
  // FeldBindung die ganze Bibliothek an und setzt die Quelle beim Wählen
  // gleich mit — vorher tat der Klick dann still nichts, 2026-08-03).
  hatAngebot: boolean
  // Auswahl melden. `aufStelle` = der Klick landete auf einer bedienbaren
  // Stelle dieses Bausteins (data-ff-spot). Die Auswahl braucht das, weil ein
  // Klick auf eine Stelle des schon gewählten Bausteins bereits vergeben ist
  // (er öffnet den Picker) und darum NICHT zusätzlich eine Ebene nach außen
  // gehen darf — s. selectionOps.auswahlZiel.
  onSelect?: (aufStelle: boolean) => void
}

export function useBindingPicker({
  editor,
  blockRef,
  selected,
  bindableSpots,
  hatAngebot,
  onSelect,
}: BindingPickerArgs) {
  const [picker, setPicker] = useState<{ spot: BindableSpot; top: number; left: number } | null>(null)
  const pickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPickerTimer = () => {
    if (pickerTimer.current) {
      clearTimeout(pickerTimer.current)
      pickerTimer.current = null
    }
  }

  useEffect(() => clearPickerTimer, [])
  // Auswahl weg → Picker weg (State-Anpassung beim Rendern, kein Effect
  // nötig — react.dev "adjusting state when props change").
  if (!selected && picker !== null) setPicker(null)

  // Die angeklickte Stelle aus dem composedPath (Stellen liegen im Shadow
  // DOM des Blocks; der Block annotiert sie mit data-ff-spot=<prop>).
  function spotAt(e: ReactMouseEvent<HTMLDivElement>): { spot: BindableSpot; el: HTMLElement } | null {
    if (bindableSpots.length === 0) return null
    for (const t of e.nativeEvent.composedPath()) {
      if (t === e.currentTarget) return null
      if (t instanceof HTMLElement && t.hasAttribute('data-ff-spot')) {
        const spot = bindableSpots.find((s) => s.prop === t.getAttribute('data-ff-spot'))
        return spot ? { spot, el: t } : null
      }
    }
    return null
  }

  // Picker-Position: direkt unter der Stelle, in VIEWPORT-Koordinaten —
  // der Picker lebt per Portal als Overlay ueber der Seite (FieldPicker,
  // position:fixed), damit ihn kein Scroll-/Overflow-Container einfaengt
  // (der Spaltenrumpf scrollt und schnitt ihn vorher ab). Am Rand wird er
  // in den sichtbaren Bereich geschoben (Picker-Breite 240px, s. w-60).
  function pickerPos(spotEl: HTMLElement): { top: number; left: number } {
    const spotRect = spotEl.getBoundingClientRect()
    return {
      top: Math.max(8, spotRect.bottom + 4),
      left: Math.max(8, Math.min(spotRect.left, window.innerWidth - 248)),
    }
  }

  // Landete der Klick auf einer Stelle, die der BAUSTEIN selbst bedient — eine
  // bindbare Stelle (data-ff-spot) oder ein Inline-Edit-Ziel
  // (data-ff-editable)? Dann gehört der Klick ihm und nicht der Auswahl: an
  // einem schon gewählten Baustein öffnet er den Picker bzw. leitet den
  // Doppelklick zum Inline-Edit ein. Die Auswahl darf in dem Fall NICHT
  // zusätzlich eine Ebene nach außen gehen (s. selectionOps.auswahlZiel) —
  // sonst wäre der Baustein beim Eintreffen des Doppelklicks nicht mehr
  // gewählt und BasicBlock.inlineEdit stiege sofort wieder aus.
  //
  // Bewusst breiter als `spotAt`: das prüft die AKTUELL bindbaren Stellen
  // (am Nachschlage-Feld gehört seine Wert-Stelle nicht dazu, und der
  // Spaltentitel ist gar keine); hier zählt jede Stelle, die der Baustein
  // markiert hat.
  function aufBedienstelle(e: ReactMouseEvent<HTMLDivElement>): boolean {
    for (const t of e.nativeEvent.composedPath()) {
      if (t === e.currentTarget) return false
      if (t instanceof HTMLElement
        && (t.hasAttribute('data-ff-spot') || t.hasAttribute('data-ff-editable'))) return true
    }
    return false
  }

  function onClick(e: ReactMouseEvent<HTMLDivElement>) {
    e.stopPropagation() // Klick auf Elternteile / Canvas (= andere Auswahl) nicht auslösen
    onSelect?.(aufBedienstelle(e))
    clearPickerTimer()
    // Erst selektieren, dann binden: der Picker öffnet nur am Block, der
    // beim Klick schon selektiert war — und nur, wenn es etwas zu wählen gibt.
    if (!selected || !hatAngebot) return
    if (e.detail > 1) return // Teil eines Doppelklicks — der entscheidet.
    const hit = spotAt(e)
    if (!hit) return
    const pos = pickerPos(hit.el)
    // GEBUNDENE Stelle: sofort öffnen — auch der Doppelklick führt dort
    // zum Picker, es gibt keinen Inline-Edit-Konflikt und darum keinen
    // Grund zu warten (die pauschalen 300 ms fühlten sich träge an).
    if (bindingCode(blockRef.current.props, hit.spot) !== '') {
      setPicker({ spot: hit.spot, ...pos })
      return
    }
    // UNGEBUNDENE Stelle: kurz warten, damit ein Doppelklick (= Inline-
    // Edit) den Picker nicht zusätzlich aufreißt.
    pickerTimer.current = setTimeout(() => {
      pickerTimer.current = null
      if (editor.selectedId === blockRef.current.id) {
        setPicker({ spot: hit.spot, ...pos })
      }
    }, 300)
  }

  // Doppelklick auf eine GEBUNDENE Stelle: ihr Text kommt aus Daten, Inline-
  // Edit lässt das Event durch (BasicBlock) — stattdessen sofort den Picker.
  function onDoubleClick(e: ReactMouseEvent<HTMLDivElement>) {
    clearPickerTimer()
    if (!selected || !hatAngebot) return
    const hit = spotAt(e)
    if (!hit || bindingCode(blockRef.current.props, hit.spot) === '') return
    e.stopPropagation()
    setPicker({ spot: hit.spot, ...pickerPos(hit.el) })
  }

  return {
    picker,
    closePicker: () => setPicker(null),
    onClick,
    onDoubleClick,
  }
}
