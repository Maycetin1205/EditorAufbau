// Export-Tests des NACHSCHLAGE-Feldes („Kunde suchen, Nummer merken").
//
// Eigene Datei neben auswahlExport.test.ts, weil export.test.ts sonst wieder
// ueber den 500-Zeilen-Deckel waechst — dieselbe Testart, nur geteilt. Hier
// steht, was den Export ueberleben MUSS, sonst kann der Bediener in der Maske
// nichts nachschlagen, und zwar STILL: die Einstellungen als Attribute und
// die Nachschlage-Quelle in den SEvariablen.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import '../blocks/formfeld/FormFeldBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { preflightMask } from './preflight'

const ADRESSEN = [{
  id: 'q-adr',
  name: 'Adressen',
  kind: 'adressstamm' as const,
  indexField: '110_10',
  fields: [
    { code: '10_30', label: 'Name' },
    { code: '110_10', label: 'Adressnummer' },
  ],
}]

// Ein vollstaendig eingestelltes Nachschlage-Feld.
const KUNDE_PROPS = {
  fieldType: 'nachschlagen', placeholder: 'Kunde', options: '',
  source: '', value: '', valueField: '', width: 240,
  nachschlagQuelle: 'q-adr', anzeigeFeld: '10_30', anzeigeTitel: 'Name',
  speicherFeld: '110_10', speicherTitel: 'Adressnummer',
}

const TEXT_PROPS = {
  fieldType: 'text', placeholder: 'Notiz', options: '',
  source: '', value: '', valueField: '', width: 240,
}

const baumMit = (props: Record<string, unknown>): BlockTree => ({
  root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['kunde'] },
  kunde: { id: 'kunde', type: 'formfeld', props, parentId: 'root', childIds: [] },
})

describe('Nachschlage-Feld im Export', () => {
  it('Einstellungen als Attribute und die Quelle in den SEvariablen', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['kunde', 'notiz'] },
      kunde: { id: 'kunde', type: 'formfeld', props: KUNDE_PROPS, parentId: 'root', childIds: [] },
      notiz: { id: 'notiz', type: 'formfeld', props: TEXT_PROPS, parentId: 'root', childIds: [] },
    }
    const { html, sevariablen } = exportMask(tree, 'Maske', ADRESSEN)
    const kundeTag = /<ff-formfeld[^>]*placeholder="Kunde"[^>]*/.exec(html)?.[0] ?? ''
    // Ohne diese vier Attribute weiss das Fenster in der Maske nicht, WORAUS
    // es waehlen laesst und WAS es anzeigt bzw. merkt.
    expect(kundeTag).toContain('nachschlagquelle="q-adr"')
    expect(kundeTag).toContain('anzeigefeld="10_30"')
    expect(kundeTag).toContain('anzeigetitel="Name"')
    expect(kundeTag).toContain('speicherfeld="110_10"')
    // Und die Nachschlage-Quelle steht in den SEvariablen: sonst schickt
    // SoftEngine ihre Daten nie und das Fenster bleibt leer.
    expect(JSON.parse(sevariablen).SEFILELOOP).toHaveLength(1)
    expect(preflightMask(tree, ADRESSEN, [])).toEqual([])
  })

  it('halb eingestellt blockiert den Export im Klartext', () => {
    // Quelle gewaehlt, aber „Gespeichert wird" fehlt: die Lupe koennte in der
    // Maske nur den Fehlerbalken zeigen.
    const tree = baumMit({ ...KUNDE_PROPS, speicherFeld: '', speicherTitel: '' })
    const problem = preflightMask(tree, ADRESSEN, [])
    expect(problem.some((r) => r.detail.includes('Gespeichert wird'))).toBe(true)
  })

  it('geloeschtes Feld der Nachschlage-Quelle blockiert ebenfalls', () => {
    const tree = baumMit({ ...KUNDE_PROPS, speicherFeld: '999_9' })
    expect(preflightMask(tree, ADRESSEN, []).some((r) => r.detail.includes('999_9'))).toBe(true)
  })

  it('gar nichts eingestellt blockiert NICHT — angefangen ist nicht halbfertig', () => {
    const tree = baumMit({
      ...KUNDE_PROPS, nachschlagQuelle: '', anzeigeFeld: '', anzeigeTitel: '',
      speicherFeld: '', speicherTitel: '',
    })
    expect(preflightMask(tree, ADRESSEN, [])).toEqual([])
  })

  it('zurueckgestellter Feldtyp laesst die Nachschlage-Quelle daheim', () => {
    // Der Rest einer alten Einstellung darf keine ganze Tabelle in die Maske
    // laden, die kein Baustein liest — SoftEngine schoebe sie bei jedem
    // Refresh umsonst. Und blockieren darf er auch nicht: sichtbar ist die
    // Einstellung ja nicht mehr.
    const tree = baumMit({ ...KUNDE_PROPS, fieldType: 'text', speicherFeld: '999_9' })
    const { sevariablen } = exportMask(tree, 'Maske', ADRESSEN)
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([])
    expect(preflightMask(tree, ADRESSEN, [])).toEqual([])
  })
})
