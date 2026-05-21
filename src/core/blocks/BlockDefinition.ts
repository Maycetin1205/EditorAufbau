// BlockDefinition
// Vertrag fuer einen registrierten Block-Typ.
// Definiert Tag-Name, Default-Props, Default-Layout, Inspector-Felder, Anzeigename.
// `exportHtml` darf der Block zusaetzlich exportieren (statische Funktion) —
// die Export-Pipeline ruft sie ueber die Registry auf.

import type { PropertyDescription } from './PropertyDescription'

export type BlockCategory = 'eingabe' | 'inhalt' | 'daten' | 'layout'

export interface BlockDefinition {
  type: string                              // 'button', 'feld', ...
  tagName: string                           // 'ff-button', 'ff-feld', ...
  displayName: string                       // 'Schaltflaeche'
  category: BlockCategory
  defaultProps: Record<string, unknown>     // initiale Props
  defaultLayout?: { width: number; height: number }
  customProperties: PropertyDescription[]   // Inspector-Felder
  // Static Export-Funktion: Props -> HTML-String. Wird in der Block-Datei
  // registriert; ein und dieselbe Funktion wird auch im Lit-render genutzt
  // (Single Source of Truth, keine doppelte Canvas/Export-Implementierung).
  exportHtml?: (props: Record<string, unknown>) => string
}
