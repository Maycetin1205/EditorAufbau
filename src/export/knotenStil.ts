// knotenStil — Layout eines Knotens als CSS.
//
// Aus exportMask herausgeloest (2026-08-06, 500-Zeilen-Deckel): dort entstehen
// Markup und Reihenfolge, hier die Umrechnung Fluss/Raster → CSS. Kein
// Verhalten geaendert, die Funktionen sind woertlich dieselben.
//
// WYSIWYG: DIESELBEN flowLayout-/rasterLayout-Quellen, die der Editor-Canvas
// benutzt — der exportierte Baustein steht auf denselben Pixeln wie im Editor.

import type { BlockNode } from '../core/blocks/BlockData'
import {
  flowItemHeightStyle,
  flowItemStyle,
  parseFlowHeight,
  parseFlowWidth,
  type FlowDirection,
  type FlowWidth,
} from '../core/blocks/flowLayout'
import { istRandBaustein, randItemStyle } from '../core/blocks/maskenRand'
import { parseRasterPos, rasterItemStyle } from '../core/blocks/rasterLayout'
import { styleToCss } from '../core/blocks/styleCss'
import { escapeHtmlAttr } from './serializer'

// Layout-Style eines Blocks als HTML-style-Attribut — DIESELBE Quelle wie der
// Canvas-Wrapper (WYSIWYG). Auf der Rasterebene (direkte Wurzel-Kinder)
// bestimmt die Zelle Platz+Größe (rasterItemStyle) — außer bei einem Baustein
// des Masken-RAHMENS (maskenRand, N2.1): der liegt am Rand der Fläche, nicht
// in einer Zelle (randItemStyle). Popup-Overlays (pageBlock) positionieren
// sich selbst über position:absolute (kein Layout-Style); INNERHALB von
// Containern gilt weiter der Fluss (flowItemStyle).
export function styleAttr(
  node: BlockNode,
  parentDirection: FlowDirection,
  lockedWidth: FlowWidth | undefined,
  rasterEbene: boolean,
  istPage: boolean,
): string {
  let style: Record<string, string | number>
  if (istPage) {
    style = {}
  } else if (istRandBaustein(node)) {
    style = randItemStyle()
  } else if (rasterEbene) {
    style = rasterItemStyle(parseRasterPos(node.props))
  } else {
    style = {
      ...flowItemStyle(parseFlowWidth(node.props.width), parentDirection, lockedWidth),
      // Feste Höhe — DIESELBE Quelle wie der Canvas-Wrapper.
      ...flowItemHeightStyle(parseFlowHeight(node.props.height), parentDirection),
    }
  }
  const css = styleToCss(style)
  return css ? ` style="${escapeHtmlAttr(css)}"` : ''
}
