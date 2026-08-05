// Was eine gebundene Stelle in der MASKE als Vorschau zeigt.
//
// Der Fall, den diese Datei festhaelt: ein gebundenes Feld, in dem noch kein
// Wert steht, zeigt den Feld-KLARNAMEN — nicht den getippten "Feldname" (der
// stuende an einer Datenstelle und log den Bediener an) und nicht nichts (dann
// verriete das leere Feld nicht mehr, wozu es gehoert).
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import type { BlockNode } from '../core/blocks/BlockData'
import type { BindableSpot } from '../core/blocks/BlockDefinition'
import type { DataSource } from '../core/data/dataSources'
import { feldKlarname, vorschauRoh } from './bindungsVorschau'

const QUELLEN: DataSource[] = [
  {
    id: 'adressen', name: 'Adressen', kind: 'adressstamm', idbId: '',
    indexField: '', fields: [{ code: '10_30', label: 'Name' }],
  },
  {
    id: 'tiere', name: 'Kundenhaustiere', kind: 'idb', idbId: 'IDBID0004',
    indexField: '', fields: [{ code: '10_30', label: 'Tiername' }],
  },
]

const STELLE: BindableSpot = { prop: 'value', label: 'Wert', vorschauProp: 'placeholder' }

function feld(props: Record<string, unknown>): BlockNode {
  return { id: 'f', type: 'formfeld', props, parentId: 'root', childIds: [] }
}

describe('feldKlarname', () => {
  it('loest den Feldcode gegen die eigene Quelle auf', () => {
    expect(feldKlarname('10_30', 'adressen', QUELLEN)).toBe('Name')
  })

  // Derselbe Feldcode heisst in zwei Quellen Verschiedenes. Wird eine WEITERE
  // Quelle genannt, entscheidet ihre id — nicht die Reihenfolge der Liste.
  it('loest gegen die GENANNTE weitere Quelle auf, nicht gegen die erste', () => {
    expect(feldKlarname('tiere::10_30', 'adressen', QUELLEN)).toBe('Tiername')
  })

  // Quelle geloescht, Feld aus dem Woerterbuch verschwunden: leer. Der
  // getippte Text darf hier NICHT einspringen.
  it('bleibt leer, wenn Quelle oder Feld unbekannt sind', () => {
    expect(feldKlarname('10_30', 'weg', QUELLEN)).toBe('')
    expect(feldKlarname('99_99', 'adressen', QUELLEN)).toBe('')
    expect(feldKlarname('', 'adressen', QUELLEN)).toBe('')
  })
})

describe('vorschauRoh', () => {
  it('laesst den getippten Text stehen, solange nichts gebunden ist', () => {
    const node = feld({ source: 'adressen', valueField: '', placeholder: 'Kundennummer' })
    expect(vorschauRoh(node, STELLE, QUELLEN, 'Feldname')).toBe('Kundennummer')
  })

  // Nie angefasst = die Prop fehlt im Baum; dann gilt der Registry-Standard.
  it('faellt ohne eigene Angabe auf den Standard zurueck', () => {
    expect(vorschauRoh(feld({}), STELLE, QUELLEN, 'Feldname')).toBe('Feldname')
  })

  it('ersetzt den getippten Text durch den Klarnamen, sobald gebunden ist', () => {
    const node = feld({ source: 'adressen', valueField: '10_30', placeholder: 'Kundennummer' })
    expect(vorschauRoh(node, STELLE, QUELLEN, 'Feldname')).toBe('Name')
  })

  // Gebunden, aber nicht aufloesbar: leer. Der getippte Text kommt auch hier
  // nicht zurueck — die Stelle zeigt Daten, und die gibt es nicht.
  it('bleibt leer, wenn die Bindung ins Leere zeigt', () => {
    const node = feld({ source: 'weg', valueField: '10_30', placeholder: 'Kundennummer' })
    expect(vorschauRoh(node, STELLE, QUELLEN, 'Feldname')).toBe('')
  })
})
