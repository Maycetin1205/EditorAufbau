import type { BlockDefinition } from './BlockDefinition'

export type FlowDirection = 'column' | 'row'
export type FlowWidth = 'auto' | 'fill' | number

export type FlowHeight = 'auto' | 'fill' | number

export function resolveChildDirection(
  def: Pick<BlockDefinition, 'childDirection'> | undefined,
  props: Record<string, unknown>,
): FlowDirection {
  if (props.direction === 'row') return 'row'
  if (props.direction === 'column') return 'column'
  return def?.childDirection ?? 'column'
}

export const ROOT_FLOW = { gap: 12, padding: 16 } as const

export const FLOW_DEFAULTS: Record<string, unknown> = { width: 'auto' }

export function parseFlowWidth(value: unknown): FlowWidth {
  if (value === 'fill') return 'fill'
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  return 'auto'
}

export function parseFlowHeight(value: unknown): FlowHeight {
  if (value === 'fill') return 'fill'
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  return 'auto'
}

export function flowItemHeightStyle(
  height: FlowHeight,
  parentDirection: FlowDirection,
): Record<string, string | number> {
  if (height === 'fill') {
    return parentDirection === 'column'
      ? { flexGrow: 1, flexBasis: 0, minHeight: 0 }
      : { alignSelf: 'stretch', minHeight: 0 }
  }
  if (typeof height === 'number') {
    return { height: `${height}px`, flexShrink: 0 }
  }
  return {}
}

export function flowItemStyle(
  width: FlowWidth,
  parentDirection: FlowDirection,
  lockedWidth?: FlowWidth,
): Record<string, string | number> {
  const effective = lockedWidth ?? width
  if (effective === 'fill') {
    return parentDirection === 'row'
      ? { flexGrow: 1, flexBasis: 0, minWidth: 0 }
      : { alignSelf: 'stretch' }
  }
  if (typeof effective === 'number') {
    return { width: `${effective}px`, flexShrink: 0 }
  }
  return {}
}
