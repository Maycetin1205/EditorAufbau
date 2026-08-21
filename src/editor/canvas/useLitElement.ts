import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import {
  bindingProp,
  zerlegeBindung,
  type BindableSpot,
} from '../../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { DataSource } from '../../core/data/dataSources'
import type { QuelleInReichweite } from '../../core/data/sourceLinks'
import type { Editor } from '../../state/Editor'
import type { GestenKlammer } from '../../state/history'

const FREMD_ZEICHEN = ' ↗'

interface PropChangeDetail {
  attr: string
  value: unknown

  // Ein Baustein, der eine ZUSAMMENHAENGENDE Handlung meldet (Ziehen), setzt
  // sie: 'beginn' beim ersten, 'ende' beim letzten Wert. Der Editor klammert
  // alles dazwischen zu EINEM Undo-Schritt — sonst waere ein Zug ueber 200
  // Pixel auch 200 Mal Strg+Z.
  geste?: 'beginn' | 'ende'
}

interface LitElementArgs {
  editor: Editor

  blockRef: RefObject<BlockNode>
  block: BlockNode
  selected: boolean | undefined
  bindableSpots: readonly BindableSpot[]

  quellen: readonly QuelleInReichweite[]

  // Die GANZE Bibliothek. Gebraucht fuer Bindungen, die ihre Quelle beim
  // Namen nennen (`quelle::code`) — die gelten auch ohne Verknuepfung, seit
  // eine Spalte ein Feld einer Hilfstabelle zeigen darf (2026-08-20).
  bibliothek: readonly DataSource[]

  raster: boolean
}

export function useLitElement({
  editor,
  blockRef,
  block,
  selected,
  bindableSpots,
  quellen,
  bibliothek,
  raster,
}: LitElementArgs) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const klammer = useRef<GestenKlammer | null>(null)

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

    el.setAttribute('data-ff-editor', '')
    container.appendChild(el)
    elementRef.current = el
    setElement(el)

    const onPropChange = (e: Event) => {
      if (e.target !== el) return
      const ce = e as CustomEvent<PropChangeDetail>
      const detail = ce.detail
      if (!detail || typeof detail.attr !== 'string') return
      if (detail.geste === 'beginn' && !klammer.current) {
        klammer.current = editor.oeffneGeste()
      }
      klammer.current?.oeffne()
      editor.updateProperty(blockRef.current.id, detail.attr, detail.value)
      if (detail.geste === 'ende') {
        klammer.current?.schliesse()
        klammer.current = null
      }
    }
    el.addEventListener('ff-prop-change', onPropChange)

    return () => {
      // Stirbt das Element mitten im Zug, bleibt die Klammer sonst offen und
      // schluckt jede spaetere Aenderung in denselben Undo-Schritt.
      klammer.current?.schliesse()
      klammer.current = null
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

    for (const spot of bindableSpots) {
      const wert = block.props[bindingProp(spot.prop)]
      if (typeof wert !== 'string' || wert === '') continue

      const { quelleId, code } = zerlegeBindung(wert)
      // Nennt die Bindung ihre Quelle beim NAMEN, gilt sie — auch wenn diese
      // nicht in Reichweite haengt. Bis 2026-08-21 suchte der Editor hier nur
      // unter den erreichbaren Quellen und LOESCHTE die Bindung am Element,
      // wenn er nichts fand: er zeigte „nicht gebunden", waehrend der Export
      // dieselbe Bindung sehr wohl schreibt (export/bindungsVorschau ->
      // feldKlarname sucht in der ganzen Bibliothek). Der Editor log also
      // ueber den Zustand — Regel 1.
      const quelle = quelleId === ''
        ? quellen[0]?.source
        : bibliothek.find((s) => s.id === quelleId)
      const field = quelle?.fields.find((f) => f.code === code)
      if (field) {
        elAny[spot.vorschauProp ?? spot.prop] = field.label
          + (quelleId === '' ? '' : FREMD_ZEICHEN)
      } else {
        elAny[bindingProp(spot.prop)] = ''
      }
    }
    elAny.editable = !!selected

    el.toggleAttribute('fuellt', !!raster)
  }, [element, block.type, block.props, selected, bindableSpots, quellen, bibliothek, raster])

  return { containerRef, elementRef, element }
}
