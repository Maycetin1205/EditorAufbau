// useLitElement
// Die EINE React↔Lit-Übergabestelle (Aufräumen A4 — wörtlich aus
// BlockHost.tsx gezogen). Erzeugen, Props setzen und Aufräumen des Custom
// Elements passieren ausschließlich hier:
//   - Erzeugen: Element zum Block-Typ, mit Editor-Kennung (data-ff-editor)
//     und Rückkanal 'ff-prop-change' → Editor-Store.
//   - Props: als DOM-Properties (Lit-Setter greifen), inkl. Bindungs-
//     Vorschau (Klarname statt statischem Text) und editable-Flag.
//   - Aufräumen: Listener ab, Element raus — bei Typwechsel und Unmount.

import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import { bindingProp, type BindableSpot } from '../../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { DataSource } from '../../core/data/dataSources'
import type { Editor } from '../../state/Editor'

interface PropChangeDetail {
  attr: string
  value: unknown
}

// Formular-Eingaben zeigen die Klarnamen-Vorschau als PLATZHALTER statt als
// Wert (Nutzer-Go 2026-07-22): das Feld wirkt leer — so wie die Maske ohne
// Daten startet — und verrät trotzdem grau, was angeschlossen ist. Das
// Formularfeld bringt die Platzhalter-Optik selbst mit (eigener .ph-Text,
// sichtbar solange value leer ist, alle Feldarten). Editor-Tabelle
// „Baustein-Typ.Stelle → Ziel-Property"; reine Anzeige an dieser EINEN
// Übergabestelle — Baum, Export und Bündel bleiben unberührt.
const VORSCHAU_ALS_PLATZHALTER: Record<string, string> = {
  'formfeld.value': 'placeholder',
}

interface LitElementArgs {
  editor: Editor
  // Aktueller Knoten in einer Ref, damit einmal registrierte Event-Listener
  // immer mit dem aktuellen Stand laufen (der BlockHost pflegt sie).
  blockRef: RefObject<BlockNode>
  block: BlockNode
  selected: boolean | undefined
  bindableSpots: readonly BindableSpot[]
  dataSource: DataSource | undefined
}

export function useLitElement({
  editor,
  blockRef,
  block,
  selected,
  bindableSpots,
  dataSource,
}: LitElementArgs) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  // Ref = Schreibziel für DOM-Properties; State = Render-Trigger fürs Portal
  // (das Portal-Ziel muss beim Rendern bekannt sein, eine Ref reicht dafür nicht).
  const elementRef = useRef<HTMLElement | null>(null)
  const [element, setElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const def = getBlockDefinition(block.type)
    if (!def) {
      console.warn(`BlockHost: keine BlockDefinition für Typ "${block.type}"`)
      return
    }
    const container = containerRef.current
    if (!container) return
    const el = document.createElement(def.tagName)
    // Editor-Kennung (Kap. 5.2): schaltet editor-exklusives Block-CSS frei
    // (Daten-Markierung gebundener Stellen). Der Export setzt sie nie.
    el.setAttribute('data-ff-editor', '')
    container.appendChild(el)
    elementRef.current = el
    setElement(el)

    // Inline-Doppelklick-Edit: Block emittiert 'ff-prop-change' { attr, value },
    // der Host schreibt das in den Store. Der Baustein bleibt editor-blind.
    // 'ff-prop-change' ist bubbles+composed; in verschachtelten Bereichen
    // erreicht das Event eines Kindes auch die Listener der Eltern-Hosts.
    // Nur das eigene Element behandeln, sonst schreibt der Bereich die
    // Prop des Kindes zusätzlich auf sich selbst.
    const onPropChange = (e: Event) => {
      if (e.target !== el) return
      const ce = e as CustomEvent<PropChangeDetail>
      const detail = ce.detail
      if (!detail || typeof detail.attr !== 'string') return
      editor.updateProperty(blockRef.current.id, detail.attr, detail.value)
    }
    el.addEventListener('ff-prop-change', onPropChange)

    return () => {
      el.removeEventListener('ff-prop-change', onPropChange)
      if (container.contains(el)) container.removeChild(el)
      elementRef.current = null
      setElement(null)
    }
    // editor ist app-lebenslang stabil (Provider) — der Effekt läuft
    // weiterhin nur bei Typwechsel.
  }, [block.type, editor, blockRef])

  useEffect(() => {
    const el = elementRef.current
    if (!el) return
    const elAny = el as unknown as Record<string, unknown>
    for (const [key, value] of Object.entries(block.props)) {
      elAny[key] = value
    }
    // Bindungs-Vorschau (Kap. 5.2, revidiert 2026-07-10): gebundene Stellen
    // zeigen den KLARNAMEN ihres Felds statt des statischen Texts — keine
    // erfundenen Beispielwerte. Nur die ANZEIGE (DOM-Properties), der Baum
    // bleibt unberührt. Ist die Bindung nicht auflösbar (keine Quelle in
    // Reichweite / Feld nicht im Wörterbuch), zeigt die Stelle ihren
    // statischen Text ohne Markierung; die Bindung selbst bleibt gespeichert
    // und lebt wieder auf, sobald die Quelle zurückkommt.
    for (const spot of bindableSpots) {
      const code = block.props[bindingProp(spot.prop)]
      if (typeof code !== 'string' || code === '') continue
      const field = dataSource?.fields.find((f) => f.code === code)
      if (field) {
        const ziel = VORSCHAU_ALS_PLATZHALTER[`${block.type}.${spot.prop}`] ?? spot.prop
        elAny[ziel] = field.label
      } else {
        elAny[bindingProp(spot.prop)] = ''
      }
    }
    elAny.editable = !!selected
  }, [element, block.type, block.props, selected, bindableSpots, dataSource])

  return { containerRef, elementRef, element }
}
