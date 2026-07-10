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
// lockedWidth (K0, opt-in per Registry — ersetzt fillMinWidth): die Registry
// legt das Breitenverhalten des Blocks FEST, die width-Prop des Knotens wird
// ignoriert (kein Breite-Anfasser, keine Inspector-Breite). Kanban-Spalte:
// 'fill' → alle Spalten teilen sich die Zeile IMMER gleichmäßig
// (Entscheidung A: flex-basis 0 + min-width 0 — keine Mindestbreite, kein
// Umbruch, kein horizontaler Scroll). Vorlagen-Kasten: 'auto' → natürliche
// volle Breite in seiner eigenen Slot-Zeile. Ohne lockedWidth bleibt das
// Verhalten aller anderen Blöcke exakt wie bisher.
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
