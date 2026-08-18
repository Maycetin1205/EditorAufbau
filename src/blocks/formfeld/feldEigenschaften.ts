import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { jaNeinProperty } from '../shared/jaNeinProperty'

const NUR_NACHSCHLAGEN = { attributeName: 'fieldType', equals: 'nachschlagen' } as const

export const FELD_EIGENSCHAFTEN: PropertyDescription[] = [
  {
    attributeName: 'fieldType',
    name: 'Feldtyp',
    description: 'Welche Art Eingabe das Feld annimmt.',
    kind: 'select',
    options: [
      { value: 'text', label: 'Text' },
      { value: 'number', label: 'Zahl' },
      { value: 'textarea', label: 'Mehrzeilig' },
      { value: 'select', label: 'Auswahl' },
      { value: 'date', label: 'Datum' },

      { value: 'time', label: 'Uhrzeit' },
      { value: 'checkbox', label: 'Ankreuzfeld' },
      { value: 'nachschlagen', label: 'Nachschlagen' },
    ],
  },
  {
    attributeName: 'options',
    name: 'Auswahl-Optionen',
    description: 'Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.',
    kind: 'text',
    visibleWhen: { attributeName: 'fieldType', equals: 'select' },
  },
  {
    attributeName: 'nachschlagQuelle',
    name: 'Quelle',
    description: 'Nur bei Feldtyp "Nachschlagen": aus dieser Datenquelle wählt der Bediener eine Zeile.',
    kind: 'quelle',
    visibleWhen: NUR_NACHSCHLAGEN,
  },
  {
    attributeName: 'speicherFeld',
    name: 'Gespeichert wird',
    description: 'Feld der Nachschlage-Quelle, dessen Wert die Maske sich merkt und die Kette "Wert geändert" weitergibt (z. B. die Nummer). Im Feld sichtbar ist die erste Spalte des Nachschlage-Fensters — ohne eigene Spalten ist das dieser Wert selbst.',
    kind: 'field',
    quelleProp: 'nachschlagQuelle',
    klarnameProp: 'speicherTitel',
    visibleWhen: NUR_NACHSCHLAGEN,
  },

  jaNeinProperty(
    'einzigerTreffer',
    'Einzigen Treffer übernehmen',
    'Bleibt in der Maske genau EIN Satz übrig (weil das Feld der Auswahl eines anderen folgt), übernimmt es diesen von selbst — ohne dass der Bediener die Lupe drückt. Nur in ein leeres Feld; die Lupe bleibt daneben bedienbar.',
    { visibleWhen: NUR_NACHSCHLAGEN },
  ),
  {
    attributeName: 'valueField',
    name: 'Feld',
    description: 'Feld der angeschlossenen Datenquelle, dessen Wert angezeigt und lokal aktualisiert wird.',
    kind: 'field',

    // Dieselbe Bedingung wie am bindableSpot: das Ankreuzfeld bleibt
    // unbindbar, bis der SE-Wert-Kontrakt (J/N? 1/0?) belegt ist.
    visibleWhen: { attributeName: 'fieldType', keinesVon: ['checkbox', 'nachschlagen'] },
  },
]
