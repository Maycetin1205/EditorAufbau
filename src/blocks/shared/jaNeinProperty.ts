import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

// Die EINE Stelle fuer eine Ja/Nein-Eigenschaft: gleiche Antwortliste,
// gleiche Reihenfolge (Nein links = aus, Ja rechts = ein), gleiche
// Darstellung als Umschalter. Vorher lag dieselbe Liste dreimal im Code,
// in zwei Reihenfolgen und zwei Darstellungen.
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
    kind: 'segment',
    options: [
      { value: 'nein', label: 'Nein' },
      { value: 'ja', label: 'Ja' },
    ],
    ...extra,
  }
}
