// BlockDefinition
// Vertrag fuer einen registrierten Block-Typ.
// Definiert Tag-Name, Default-Props, Default-Layout, Inspector-Felder.
// Liegt in blockRegistry; Block-View-Klassen registrieren sich am Ende ihrer Datei.

import type { PropertyDescription } from './PropertyDescription'

export interface BlockDefinition {
  type: string                              // 'button', 'text', ...
  tagName: string                           // 'ff-button', 'ff-text', ...
  defaultProps: Record<string, unknown>     // initiale Props beim Anlegen
  defaultLayout?: { width: number; height: number }
  customProperties: PropertyDescription[]   // Inspector-Felder
}
