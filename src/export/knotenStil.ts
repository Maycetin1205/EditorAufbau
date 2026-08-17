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

      ...flowItemHeightStyle(parseFlowHeight(node.props.height), parentDirection),
    }
  }
  const css = styleToCss(style)
  return css ? ` style="${escapeHtmlAttr(css)}"` : ''
}
