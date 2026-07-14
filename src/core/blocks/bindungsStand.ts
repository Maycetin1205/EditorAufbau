// bindungsStand
// Pure Vollstaendigkeitspruefung fuer den Datenanschluss-Dialog und seinen
// Kurzzustand im Inspector. Beide lesen denselben Stand.
//
// Bewusst DOM-frei und ohne Store-Zugriff: der Aufrufer reicht den Knoten
// und die Vorlagen-Bibliothek aus dem DataSourceStore herein.

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
