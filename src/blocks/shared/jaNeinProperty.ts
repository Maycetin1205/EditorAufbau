// jaNeinProperty
// Kleiner Ja/Nein-Select fuer boolesche Eigenschaften (z. B. Auffangspalte).
// Bewusst als Select statt eigenem Boolean-Control: kein neues
// Inspector-Infra (DRY); ein echtes Toggle kann folgen, wenn die Faelle es
// rechtfertigen. Nutzer: die Kanban-Spalte (Herkunft:
// docs/decisions/2026-07-14-kahlschlag-bausteine.md).
//
// Technikwert = 'ja' | 'nein' (String, nie Boolean): reist verlustfrei als
// Export-Attribut und durch den Persistenz-Lader (normalizeProps).

import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

export function jaNeinProperty(
  attributeName: string,
  name: string,
  description: string,
  extra?: Partial<PropertyDescription>,
): PropertyDescription {
  return {
    attributeName,
    name,
    description,
    isArray: false,
    maxLength: 0,
    kind: 'select',
    options: [
      { value: 'nein', label: 'Nein' },
      { value: 'ja', label: 'Ja' },
    ],
    ...extra,
  }
}
