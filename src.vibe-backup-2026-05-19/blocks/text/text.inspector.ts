// Inspector-Konfiguration fuer Text: Felder bleiben deklarativ und registry-faehig.
import type { InspectorControl } from '../../core/blocks/block.types'

export const textInspector: InspectorControl[] = [
  {
    kind: 'text',
    prop: 'content',
    label: 'Text',
    description: 'Inhalt, der auf der Canvas und im Export erscheint.',
    maxLength: 240,
  },
  {
    kind: 'select',
    prop: 'size',
    label: 'Groesse',
    description: 'Semantische Textgroesse fuer den Block.',
    options: [
      { value: 'body', label: 'Normal' },
      { value: 'lead', label: 'Hervorgehoben' },
      { value: 'heading', label: 'Ueberschrift' },
    ],
  },
  {
    kind: 'select',
    prop: 'tone',
    label: 'Farbe',
    description: 'Rolle des Textes im Dokument.',
    options: [
      { value: 'default', label: 'Standard' },
      { value: 'muted', label: 'Zurueckhaltend' },
      { value: 'accent', label: 'Akzent' },
    ],
  },
  {
    kind: 'select',
    prop: 'align',
    label: 'Ausrichtung',
    description: 'Horizontale Ausrichtung im Textblock.',
    options: [
      { value: 'left', label: 'Links' },
      { value: 'center', label: 'Zentriert' },
      { value: 'right', label: 'Rechts' },
    ],
  },
]
