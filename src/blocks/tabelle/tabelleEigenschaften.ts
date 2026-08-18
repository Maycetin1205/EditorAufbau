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

  jaNeinProperty(
    'erfassung',
    'Erfassungszeile',
    'Zeigt als nächste freie Zeile eine leere Zeile, in der der Bediener eine neue Position tippt. Was eine Zelle dort tut, wird an ihr eingestellt: Klick auf die Zelle wählt die Rolle (Frei, Nachschlagen, Folgt) und bei den nachschlagenden ihre eigene Quelle samt Feld; Doppelklick auf eine Frei-Zelle tippt ihre Vorbelegung.',
  ),
  {
    attributeName: 'tagField',
    name: 'Tag filtern nach',
    description: 'Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt die Tabelle nur Sätze des Tages, den der Tageswähler zeigt. Leer = alle Sätze.',
    kind: 'field',
  },

  leerTextProperty(),
]
