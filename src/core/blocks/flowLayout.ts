// flowLayout
// EINE Quelle für die Breiten-Logik eines Blocks im Fluss seines Containers.
// Wird vom Editor (CanvasNode-Wrapper) benutzt und in Kap. 3 vom Export —
// beide leiten aus demselben Mapping ab, damit Editor und Maske identisch
// sitzen (WYSIWYG).
//
// width-Werte (universelle Flow-Prop, liegt in node.props.width):
//   'auto'  → natürliche Größe (Default)
//   'fill'  → nimmt verfügbaren Platz (in Zeilen: Restbreite teilen,
//             in Spalten: volle Breite)
//   number  → feste Breite in px

import type { BlockDefinition } from './BlockDefinition'

export type FlowDirection = 'column' | 'row'
export type FlowWidth = 'auto' | 'fill' | number

// Fluss-Richtung der KINDER eines Containers — EINE Quelle für Canvas und
// Export. Der generische Bereich steuert sie über seine `direction`-Prop;
// spezialisierte Container (Kanban-Board = row) legen sie fest in der
// Registry ab (childDirection), ohne eine Prop anzubieten.
export function resolveChildDirection(
  def: Pick<BlockDefinition, 'childDirection'> | undefined,
  props: Record<string, unknown>,
): FlowDirection {
  if (props.direction === 'row') return 'row'
  if (props.direction === 'column') return 'column'
  return def?.childDirection ?? 'column'
}

// Wurzel-Fluss der Maske: IDENTISCHE Werte für Editor-Canvas und Export-Root
// (sonst säßen Blöcke im Editor anders als in SoftEngine).
export const ROOT_FLOW = { gap: 12, padding: 16 } as const

// Universelle Flow-Defaults: werden in defineAndRegister unter die
// defaultProps JEDES Blocks gemischt (damit Persistenz/normalizeProps
// die Werte kennt und erhält).
export const FLOW_DEFAULTS: Record<string, unknown> = { width: 'auto' }

export function parseFlowWidth(value: unknown): FlowWidth {
  if (value === 'fill') return 'fill'
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  return 'auto'
}

// CSS für das Flex-Item (im Editor der Wrapper um den Block, im Export das
// Block-Element selbst). camelCase-Schlüssel; der Export wandelt in
// kebab-case um.
//
// fillMinWidth (S3, opt-in per Registry): Blöcke wie die Kanban-Spalte
// verteilen sich IMMER fließend über die Breite des Zeilen-Containers —
// mindestens fillMinWidth px, Umbruch in die nächste Zeile statt Scrollen
// (der Container bricht per flex-wrap um). Die width-Prop des Knotens wird
// dann ignoriert (die Spalte hat keine einstellbare Breite). Ohne
// fillMinWidth bleibt das Verhalten aller anderen Blöcke exakt wie bisher.
export function flowItemStyle(
  width: FlowWidth,
  parentDirection: FlowDirection,
  fillMinWidth?: number,
): Record<string, string | number> {
  if (fillMinWidth !== undefined) {
    return parentDirection === 'row'
      ? { flexGrow: 1, flexBasis: `${fillMinWidth}px` }
      : { alignSelf: 'stretch' }
  }
  if (width === 'fill') {
    return parentDirection === 'row'
      ? { flexGrow: 1, flexBasis: 0, minWidth: 0 }
      : { alignSelf: 'stretch' }
  }
  if (typeof width === 'number') {
    return { width: `${width}px`, flexShrink: 0 }
  }
  return {}
}
