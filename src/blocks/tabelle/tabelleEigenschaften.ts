import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { jaNeinProperty } from '../shared/jaNeinProperty'
import { leerTextProperty } from '../shared/leerZustand'

export const TABELLE_EIGENSCHAFTEN: PropertyDescription[] = [
  jaNeinProperty(
    'suche',
    'Suchzeile',
    'Zeigt über der Tabelle ein Feld, mit dem der Bediener den Inhalt durchsucht.',
    { requiresDataSource: true },
  ),

  {
    attributeName: 'tagField',
    name: 'Tag filtern nach',
    description: 'Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt die Tabelle nur Sätze des Tages, den der Tageswähler zeigt. Leer = alle Sätze.',
    kind: 'field',
  },

  leerTextProperty(),
]
