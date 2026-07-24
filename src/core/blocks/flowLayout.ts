// flowLayout
// EINE Quelle für die Breiten-Logik eines Blocks im Fluss seines Containers.
// Wird vom Editor (CanvasNode-Wrapper) benutzt und in vom Export —
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
// Höhe (opt-in): nur Blöcke mit resizableHeight in der Registry
// deklarieren eine height-Prop (Kanban: Karten scrollen dann IN der
// Spalte statt das Board endlos wachsen zu lassen — Empfang-Vorbild).
//   'auto'  → natürliche Höhe
//   'fill'  → verbleibende Höhe des Eltern-Flusses
//   number  → feste Höhe in px
export type FlowHeight = 'auto' | 'fill' | number

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

export function parseFlowHeight(value: unknown): FlowHeight {
  if (value === 'fill') return 'fill'
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  return 'auto'
}

// CSS für die Höhe eines Blocks — DIESELBE Quelle für den Editor
// (Canvas-Wrapper) und den Export (style-Attribut am Element). In einer
// Spalte nimmt fill den verbleibenden Platz; in einer Zeile streckt es den
// Block auf die verfügbare Elternhöhe. Feste Pixelhöhen schrumpfen nicht.
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

// CSS für das Flex-Item (im Editor der Wrapper um den Block, im Export das
// Block-Element selbst). camelCase-Schlüssel; der Export wandelt in
// kebab-case um.
//
// lockedWidth (opt-in per Registry — ersetzt fillMinWidth): die Registry
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
