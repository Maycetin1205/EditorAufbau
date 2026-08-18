import { describe, expect, it } from 'vitest'

import '../blocks/formfeld/FormFeldBlock'
import '../blocks/tabelle/TabelleBlock'
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

const TIERE = [{
  id: 'q-tiere',
  name: 'Kundenhaustiere',
  kind: 'idb' as const,
  idbId: 'IDBID0018',
  indexField: '0_10',
  fields: [
    { code: '0_10', label: 'Satz-Nr.' },
    { code: '18_30', label: 'Tiername' },
    { code: '2_8', label: 'Adressnummer' },
  ],
}]

const BEIDE = [...ADRESSEN, ...TIERE]

const KUNDE_PROPS = {
  fieldType: 'nachschlagen', placeholder: 'Kunde', options: '',
  source: '', value: '', valueField: '', width: 240,
  nachschlagQuelle: 'q-adr',
  speicherFeld: '110_10', speicherTitel: 'Adressnummer',
  nachschlagSpalten: [
    { titel: 'Name', feld: '10_30', art: 'text' },
    { titel: 'Adressnummer', feld: '110_10', art: 'text' },
  ],
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

    expect(kundeTag).toContain('nachschlagquelle="q-adr"')
    expect(kundeTag).toContain('speicherfeld="110_10"')
    // Was im Feld steht, ist Spalte 1 des Fensters — sie reist als Spalte mit,
    // nicht mehr als eigene Eigenschaft „Angezeigt wird" (V0).
    expect(kundeTag).toContain('10_30')
    expect(kundeTag).not.toContain('anzeigefeld=')

    expect(JSON.parse(sevariablen).SEFILELOOP).toHaveLength(1)
    expect(preflightMask(tree, ADRESSEN, [])).toEqual([])
  })

  it('„Einzigen Treffer übernehmen" ueberlebt den Export', () => {
    const tag = (html: string): string => /<ff-formfeld[^>]*>/.exec(html)?.[0] ?? ''
    const an = tag(exportMask(baumMit({ ...KUNDE_PROPS, einzigerTreffer: 'ja' }), 'M', ADRESSEN).html)
    expect(an).toMatch(/\seinzigerTreffer="ja"/i)

    const aus = tag(exportMask(baumMit(KUNDE_PROPS), 'M', ADRESSEN).html)
    expect(aus).not.toMatch(/einzigerTreffer=/i)
  })

  it('halb eingestellt blockiert den Export im Klartext', () => {
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
      ...KUNDE_PROPS, nachschlagQuelle: '', nachschlagSpalten: [],
      speicherFeld: '', speicherTitel: '',
    })
    expect(preflightMask(tree, ADRESSEN, [])).toEqual([])
  })

  it('das Feld ist Auswahl-GEBER und traegt data-ff-id — ein Textfeld nicht', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['kunde', 'notiz'] },
      kunde: { id: 'kunde', type: 'formfeld', props: KUNDE_PROPS, parentId: 'root', childIds: [] },
      notiz: { id: 'notiz', type: 'formfeld', props: TEXT_PROPS, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree, 'Maske', ADRESSEN)
    expect(html).toMatch(/<ff-formfeld[^>]*\sdata-ff-id="kunde"/)
    expect(html).not.toMatch(/<ff-formfeld[^>]*\sdata-ff-id="notiz"/)
  })

  it('ohne eingestellte Nachschlage-Quelle kein data-ff-id — es gibt kein Fenster', () => {
    const { html } = exportMask(
      baumMit({ ...KUNDE_PROPS, nachschlagQuelle: '', nachschlagSpalten: [], speicherFeld: '', speicherTitel: '' }),
      'Maske', ADRESSEN,
    )

    expect(html).not.toMatch(/<ff-formfeld[^>]*\sdata-ff-id=/)
  })

  it('eine Tabelle darf dem Nachschlage-Feld FOLGEN (Preflight sagt ja)', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['kunde', 'belege'] },
      kunde: { id: 'kunde', type: 'formfeld', props: KUNDE_PROPS, parentId: 'root', childIds: [] },
      belege: {
        id: 'belege', type: 'tabelle',
        props: {
          width: 'fill', source: 'q-adr', spalten: [{ titel: 'Name', feld: '10_30' }],

          folgtAuswahl: [{ geberId: 'kunde', keyPairs: [{ fromField: '110_10', toField: '110_10' }] }],
        },
        parentId: 'root', childIds: [],
      },
    }
    expect(preflightMask(tree, ADRESSEN, [])).toEqual([])

    tree.kunde.props = { ...KUNDE_PROPS, fieldType: 'text' }
    expect(preflightMask(tree, ADRESSEN, []).some((r) => r.name === 'Auswahl-Geber fehlt')).toBe(true)
  })

  const kundeUndTier = (toField: string): BlockTree => ({
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['kunde', 'tier'] },
    kunde: { id: 'kunde', type: 'formfeld', props: KUNDE_PROPS, parentId: 'root', childIds: [] },
    tier: {
      id: 'tier', type: 'formfeld',
      props: {
        fieldType: 'nachschlagen', placeholder: 'Haustier', options: '',
        source: '', value: '', valueField: '', width: 240,
        nachschlagQuelle: 'q-tiere',
        speicherFeld: '0_10', speicherTitel: 'Satz-Nr.',
        nachschlagSpalten: [
          { titel: 'Tiername', feld: '18_30', art: 'text' },
          { titel: 'Satz-Nr.', feld: '0_10', art: 'text' },
        ],

        folgtAuswahl: [{ geberId: 'kunde', keyPairs: [{ fromField: '110_10', toField }] }],
      },
      parentId: 'root', childIds: [],
    },
  })

  it('ein Nachschlage-Feld folgt einem anderen: die Folge reist mit', () => {
    const tree = kundeUndTier('2_8')
    const { html, sevariablen } = exportMask(tree, 'Maske', BEIDE)
    const tierTag = /<ff-formfeld[^>]*placeholder="Haustier"[^>]*/.exec(html)?.[0] ?? ''
    expect(tierTag).toContain('folgtauswahl=')

    expect(JSON.parse(sevariablen).SEFILELOOP).toHaveLength(2)
    expect(preflightMask(tree, BEIDE, [])).toEqual([])
  })

  it('Preflight prueft das Schluesselfeld gegen die NACHSCHLAGE-Quelle', () => {
    const falsch = preflightMask(kundeUndTier('110_10'), BEIDE, [])
    expect(falsch.some((r) => r.name === 'Auswahl-Folge Feld fehlt')).toBe(true)
    expect(falsch.some((r) => r.detail.includes('Kundenhaustiere'))).toBe(true)
  })

  it('eine alte EIGENE Bindung bleibt daheim: ein Quellen-Waehler, ein SEFILELOOP', () => {
    const tree = baumMit({ ...KUNDE_PROPS, source: 'q-tiere', valueField: '18_30' })
    const { html, sevariablen } = exportMask(tree, 'Maske', BEIDE)
    const tag = /<ff-formfeld[^>]*/.exec(html)?.[0] ?? ''
    expect(tag).toContain('nachschlagquelle="q-adr"')
    expect(tag).not.toContain('source=')
    expect(tag).not.toContain('valuefield=')

    expect(JSON.parse(sevariablen).SEFILELOOP.map((s: { ALIAS: string }) => s.ALIAS)).toEqual(['Adressen'])

    expect(preflightMask(tree, BEIDE, [])).toEqual([])
  })

  it('Ankreuzfeld: eine alte Bindung bleibt ebenso daheim (U6, 2026-08-12)', () => {
    const tree = baumMit({ ...TEXT_PROPS, fieldType: 'checkbox', source: 'q-tiere', valueField: '18_30' })
    const tag = /<ff-formfeld[^>]*/.exec(exportMask(tree, 'Maske', BEIDE).html)?.[0] ?? ''
    expect(tag).toContain('fieldtype="checkbox"')
    expect(tag).not.toContain('valuefield=')
  })

  it('Gegenprobe Textfeld: dieselbe Bindung reist mit und laedt ihre Quelle', () => {
    const tree = baumMit({ ...TEXT_PROPS, source: 'q-tiere', valueField: '18_30' })
    const { html, sevariablen } = exportMask(tree, 'Maske', BEIDE)
    const tag = /<ff-formfeld[^>]*/.exec(html)?.[0] ?? ''
    expect(tag).toContain('source="q-tiere"')
    expect(tag).toContain('valuefield="18_30"')
    expect(JSON.parse(sevariablen).SEFILELOOP.map((s: { ALIAS: string }) => s.ALIAS)).toEqual(['Kundenhaustiere'])
  })

  it('eine ins Leere zeigende alte Bindung blockiert am Nachschlage-Feld NICHT', () => {
    const tree = baumMit({ ...KUNDE_PROPS, source: 'gibt-es-nicht', valueField: '999_9' })
    expect(preflightMask(tree, BEIDE, [])).toEqual([])

    const text = baumMit({ ...TEXT_PROPS, source: 'gibt-es-nicht', valueField: '999_9' })
    expect(preflightMask(text, BEIDE, []).some((r) => r.name === 'Datenquelle fehlt')).toBe(true)
  })

  it('zurueckgestellter Feldtyp laesst die Nachschlage-Quelle daheim', () => {
    const tree = baumMit({ ...KUNDE_PROPS, fieldType: 'text', speicherFeld: '999_9' })
    const { sevariablen } = exportMask(tree, 'Maske', ADRESSEN)
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([])
    expect(preflightMask(tree, ADRESSEN, [])).toEqual([])
  })
})
