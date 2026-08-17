import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { RASTER, parseRasterPos, rasterSpecOf } from '../../core/blocks/rasterLayout'
import type { Editor } from '../../state/Editor'
import { zieheGroesse } from './zieheGroesse'

export function useBlockResize(
  editor: Editor,
  blockRef: RefObject<BlockNode>,
  elementRef: RefObject<HTMLElement | null>,
  rootRef: RefObject<HTMLElement | null>,
) {
  function startResize(
    e: ReactPointerEvent<HTMLDivElement>,
    prop: 'width' | 'height',
    min: number,
  ) {
    const host = elementRef.current
    if (!host) return
    zieheGroesse(editor, e, {
      achse: prop === 'width' ? 'x' : 'y',
      prop,
      getId: () => blockRef.current.id,
      start: host.getBoundingClientRect()[prop],
      min,
    })
  }

  function startRasterResize(e: ReactPointerEvent<HTMLDivElement>, achse: 'x' | 'y') {
    const el = rootRef.current
    if (!el) return
    const node = blockRef.current
    const pos = parseRasterPos(node.props)
    const spec = rasterSpecOf(getBlockDefinition(node.type), node.props)
    const rect = el.getBoundingClientRect()
    if (achse === 'x') {
      zieheGroesse(editor, e, {
        achse: 'x',
        prop: 'rasterW',
        getId: () => blockRef.current.id,
        start: pos.w,
        min: Math.max(1, spec.minW),
        schritt: (rect.width + RASTER.gapPx) / pos.w,

        anwenden: (id, wert) => editor.resizeNodeToCells(id, 'x', wert),
      })
    } else {
      zieheGroesse(editor, e, {
        achse: 'y',
        prop: 'rasterH',
        getId: () => blockRef.current.id,
        start: pos.h,
        min: Math.max(1, spec.minH),
        schritt: (rect.height + RASTER.gapPx) / pos.h,

        anwenden: (id, wert) => editor.resizeNodeToCells(id, 'y', wert),
      })
    }
  }

  return { startResize, startRasterResize }
}
