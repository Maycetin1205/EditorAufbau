// Inspector-Konfiguration: der rechte Bereich rendert daraus Eingabefelder.
import type { InspectorControl } from '../../core/blocks/block.types'

export const buttonInspector: InspectorControl[] = [
  {
    kind: 'text',
    prop: 'label',
    label: 'Beschriftung',
    description: 'Text, der auf dem Button steht.',
    maxLength: 80,
  },
  {
    kind: 'select',
    prop: 'variant',
    label: 'Variante',
    description: 'Visueller Stil des Buttons.',
    options: [
      { value: 'primary', label: 'Primaer' },
      { value: 'secondary', label: 'Sekundaer' },
      { value: 'quiet', label: 'Leise' },
    ],
  },
  {
    kind: 'text',
    prop: 'actionId',
    label: 'Action ID',
    description: 'Spaeterer Anker fuer SoftEngine-Aktionen.',
    maxLength: 80,
  },
  {
    kind: 'switch',
    prop: 'disabled',
    label: 'Deaktiviert',
    description: 'Der Button ist sichtbar, aber nicht klickbar.',
  },
]
