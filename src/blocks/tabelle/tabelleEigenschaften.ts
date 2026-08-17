import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { leerTextProperty } from '../shared/leerZustand'

const JA_NEIN = [{ value: 'ja', label: 'Ja' }, { value: 'nein', label: 'Nein' }]

export const TABELLE_EIGENSCHAFTEN: PropertyDescription[] = [
  {
    attributeName: 'suche',
    name: 'Suchzeile',
    description: 'Zeigt über der Tabelle ein Feld, mit dem der Bediener den Inhalt durchsucht.',
    kind: 'segment',
    options: JA_NEIN,
    requiresDataSource: true,
  },

  {
    attributeName: 'tagField',
    name: 'Tag filtern nach',
    description: 'Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt die Tabelle nur Sätze des Tages, den der Tageswähler zeigt. Leer = alle Sätze.',
    kind: 'field',
  },

  leerTextProperty(),
]
