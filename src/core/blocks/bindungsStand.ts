// bindungsStand (V2/B3)
// EINE pure Vollstaendigkeitspruefung der Board-Bindung, gespeist aus dem
// bindingRoute-Registry-Konzept (BlockDefinition). Konsumenten: die
// Strecken-Haken + der Kurzzustand im Inspector (B3), der "noch nicht
// angeschlossen"-Hinweis am Board (B5) und die Export-Preflight (B6) —
// alle lesen DENSELBEN Stand, es gibt keine zweite Wahrheit.
//
// Bewusst DOM-frei und ohne Store-Zugriff: der Aufrufer reicht den Knoten
// und die Vorlagen-Bibliothek herein (Inspector/Strecke aus dem
// DataSourceStore, die Preflight aus ihrem Parameter).

import type { BlockNode } from './BlockData'
import type { BindingRoute } from './BlockDefinition'

export interface BindungsStand {
  // source-Prop ist gesetzt (der Bediener hat eine Quelle gewaehlt).
  quelleGewaehlt: boolean
  // ... und die Vorlage existiert (noch) in der Bibliothek.
  quelleBekannt: boolean
  // Das Einsortieren-Feld (route.fieldProp) ist gewaehlt.
  feldGewaehlt: boolean
  // Alles zusammen: das Board ist angeschlossen.
  angeschlossen: boolean
}

export function bindungsStand(
  node: Pick<BlockNode, 'props'>,
  route: BindingRoute,
  sources: readonly { id: string }[],
): BindungsStand {
  const source = typeof node.props.source === 'string' ? node.props.source : ''
  const feldWert = node.props[route.fieldProp]
  const feld = typeof feldWert === 'string' ? feldWert : ''
  const quelleGewaehlt = source !== ''
  const quelleBekannt = quelleGewaehlt && sources.some((s) => s.id === source)
  const feldGewaehlt = feld !== ''
  return {
    quelleGewaehlt,
    quelleBekannt,
    feldGewaehlt,
    angeschlossen: quelleBekannt && feldGewaehlt,
  }
}
