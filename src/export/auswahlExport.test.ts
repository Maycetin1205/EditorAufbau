import { describe, expect, it } from 'vitest'

import '../blocks/formfeld/FormFeldBlock'
import '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { registerTestBlocks, TEST_EVENT_BLOCK } from '../test/testBlocks'
import { exportMask } from './exportMask'
import { preflightMask } from './preflight'
import { failedChecks, validateMaskHtml } from './validator'

registerTestBlocks()

const spalten = [
  { titel: 'Kunde', feld: '2_8' },
  { titel: 'Betrag, netto', feld: '10_12' },
  { titel: 'Größe', feld: '' },
]

const QUELLEN = [{
  id: 'q-saetze',
  name: 'Saetze',
  kind: 'idb' as const,
  idbId: 'IDBID0001',
  indexField: '0_10',
  fields: [
    { code: '0_10', label: 'Satz-Nr.' },
    { code: '2_8', label: 'Kundennummer' },
    { code: '3_8', label: 'Kunde im Beleg' },
    { code: '10_12', label: 'Betrag' },
  ],
}]

describe('Auswahl im Export (Uebersicht -> Detail, 2026-08-05)', () => {
  const folge = [{ geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '3_8' }] }]

  const paarTree = (
    folgtAuswahl: unknown,
    geberQuelle = 'q-saetze',
    folgerQuelle = 'q-saetze',
  ): BlockTree => ({
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['geber', 'folger'] },
    geber: {
      id: 'geber',
      type: 'tabelle',
      props: { width: 'fill', source: geberQuelle, spalten, rasterX: 0, rasterY: 0, rasterW: 24, rasterH: 4 },
      parentId: 'root',
      childIds: [],
    },
    folger: {
      id: 'folger',
      type: 'tabelle',
      props: { width: 'fill', source: folgerQuelle, spalten, folgtAuswahl, rasterX: 0, rasterY: 4, rasterW: 24, rasterH: 4 },
      parentId: 'root',
      childIds: [],
    },
  })

  it('Auswahl-Geber tragen ihre Baum-id als data-ff-id — auch ohne Folger', () => {
    const { html } = exportMask(paarTree([]), 'Maske', QUELLEN)

    expect(html).toMatch(/<ff-tabelle[^>]*\sdata-ff-id="geber"/)
    expect(html).toMatch(/<ff-tabelle[^>]*\sdata-ff-id="folger"/)
  })

  it('OHNE Datenquelle kein data-ff-id — eine Tabelle mit Platzhaltern gibt nichts ab', () => {
    const { html } = exportMask(paarTree([], '', ''))

    expect(html).not.toMatch(/<ff-tabelle[^>]*\sdata-ff-id=/)
  })

  it('OHNE eigene Datenquelle reist die Folge nicht mit — es gibt keine Zeilen zu filtern', () => {
    const ohne = paarTree(folge, 'q-saetze', '')
    const { html } = exportMask(ohne, 'Maske', QUELLEN)
    expect(html).not.toMatch(/<ff-tabelle[^>]*\sfolgtauswahl=/)

    expect(preflightMask(ohne, QUELLEN, []).filter((r) => r.name.startsWith('Auswahl'))).toEqual([])
  })

  it('folgtAuswahl reist als JSON-Attribut und kommt unversehrt zurueck', () => {
    const { html } = exportMask(paarTree(folge), 'Maske', QUELLEN)
    const attr = /<ff-tabelle[^>]*\sfolgtauswahl="([^"]*)"/.exec(html)?.[1] ?? ''
    expect(attr).not.toBe('')
    expect(JSON.parse(attr.replace(/&quot;/g, '"'))).toEqual(folge)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('eine LEERE Folge-Liste reist gar nicht mit (bestehende Masken bleiben byte-identisch)', () => {
    const { html } = exportMask(paarTree([]), 'Maske', QUELLEN)
    expect(html).not.toContain('folgtauswahl')
  })

  it('auch ein EINZELWERT-Baustein folgt: folgtAuswahl reist am Formularfeld mit', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['geber', 'feld'] },
      geber: {
        id: 'geber', type: 'tabelle',
        props: { width: 'fill', source: 'q-saetze', spalten },
        parentId: 'root', childIds: [],
      },
      feld: {
        id: 'feld', type: 'formfeld',
        props: {
          fieldType: 'text', placeholder: 'Tiername', options: '',

          source: 'q-saetze', value: '', valueField: '10_12', width: 240, folgtAuswahl: folge,
        },
        parentId: 'root', childIds: [],
      },
    }
    const { html } = exportMask(tree, 'Maske', QUELLEN)
    const attr = /<ff-formfeld[^>]*\sfolgtauswahl="([^"]*)"/.exec(html)?.[1] ?? ''
    expect(JSON.parse(attr.replace(/&quot;/g, '"'))).toEqual(folge)
    expect(preflightMask(tree, QUELLEN, []).filter((r) => r.name.startsWith('Auswahl'))).toEqual([])
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  const nachschlagFeldTree = (nachschlagQuelle: string): BlockTree => ({
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['geber', 'feld'] },
    geber: {
      id: 'geber', type: 'tabelle',
      props: { width: 'fill', source: 'q-saetze', spalten },
      parentId: 'root', childIds: [],
    },
    feld: {
      id: 'feld', type: 'formfeld',
      props: {
        fieldType: 'nachschlagen', placeholder: 'Kunde', options: '',

        source: '', value: '', valueField: '', width: 240,
        nachschlagQuelle,
        speicherFeld: nachschlagQuelle === '' ? '' : '0_10',
        speicherTitel: nachschlagQuelle === '' ? '' : 'Satz-Nr.',
        folgtAuswahl: [{ geberId: 'gibt-es-nicht', keyPairs: [{ fromField: '2_8', toField: '3_8' }] }],
      },
      parentId: 'root', childIds: [],
    },
  })

  it('am NACHSCHLAGE-Feld reist die Folge MIT — dort folgt das FENSTER', () => {
    const tree = nachschlagFeldTree('q-saetze')
    const { html } = exportMask(tree, 'Maske', QUELLEN)
    expect(html).toMatch(/<ff-formfeld[^>]*\sfolgtauswahl=/)

    expect(preflightMask(tree, QUELLEN, []).some((r) => r.name === 'Auswahl-Geber fehlt')).toBe(true)
  })

  it('ohne Nachschlage-Quelle bleibt sie daheim: kein Fenster, keine Zeilen', () => {
    const tree = nachschlagFeldTree('')
    const { html } = exportMask(tree, 'Maske', QUELLEN)

    expect(html).not.toMatch(/<ff-formfeld[^>]*\sfolgtauswahl=/)
    expect(preflightMask(tree, QUELLEN, [])).toEqual([])
  })

  it('Preflight blockt einen geloeschten Geber und ein halbes Feldpaar im Klartext', () => {
    const kaputt = preflightMask(paarTree([{ geberId: 'gibt-es-nicht', keyPairs: [{ fromField: '2_8', toField: '3_8' }] }]), QUELLEN, [])
    expect(kaputt.some((r) => r.name === 'Auswahl-Geber fehlt')).toBe(true)
    const halb = preflightMask(paarTree([{ geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '' }] }]), QUELLEN, [])
    expect(halb.some((r) => r.name === 'Auswahl-Folge unvollständig')).toBe(true)
    const sauber = preflightMask(paarTree(folge), QUELLEN, [])
    expect(sauber.filter((r) => r.name.startsWith('Auswahl'))).toEqual([])
  })

  it('Preflight blockt einen Geber, dem die Datenquelle weggenommen wurde', () => {
    const ohneQuelle = preflightMask(paarTree(folge, '', 'q-saetze'), QUELLEN, [])
    expect(ohneQuelle.some((r) => r.name === 'Auswahl-Geber fehlt')).toBe(true)
    expect(ohneQuelle.some((r) => r.detail.includes('keine Auswahl (mehr) gibt'))).toBe(true)
  })

  it('Preflight blockt ein Schluesselfeld, das es in der eigenen Quelle nicht gibt', () => {
    const meldungen = preflightMask(
      paarTree([{ geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '999_9' }] }]),
      QUELLEN, [],
    )
    expect(meldungen.some((r) => r.name === 'Auswahl-Folge Feld fehlt')).toBe(true)
    expect(meldungen.some((r) => r.detail.includes('999_9'))).toBe(true)
  })
})

describe('Parameterquelle „Feld der gewaehlten Zeile" (2026-08-06)', () => {
  const relations = [{
    id: 'rel-put', name: 'Bemerkung schreiben', verb: 'PUT_RELATION', nr: '0174',
    params: ['{PINDEX}'], allowExtraParams: false,
  }] as const

  const knopfTree = (blockId: string): BlockTree => ({
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['geber', 'knopf'] },
    geber: {
      id: 'geber', type: 'tabelle',

      props: { width: 'fill', source: 'q-saetze', spalten: [{ titel: 'Kunde', feld: '' }] },
      parentId: 'root', childIds: [],
    },
    knopf: {
      id: 'knopf', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [],
      events: {
        onClick: [{
          id: 'put', type: 'RELATION', resultKey: '', relationId: 'rel-put',
          params: [{ source: 'gewaehlte_zeile', blockId, value: '0_10' }],
          extraParams: [],
        }],
      },
    },
  })

  it('reist in der Kette mit und nennt Geber + Feldcode', () => {
    const tree = knopfTree('geber')
    const { html } = exportMask(tree, 'Maske', QUELLEN, relations)
    expect(html).toContain('&quot;source&quot;:&quot;gewaehlte_zeile&quot;')
    expect(html).toContain('&quot;blockId&quot;:&quot;geber&quot;')
    expect(html).toContain('&quot;value&quot;:&quot;0_10&quot;')

    expect(html).toMatch(/<ff-tabelle[^>]*\sdata-ff-id="geber"/)
    expect(preflightMask(tree, QUELLEN, relations)).toEqual([])
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Preflight blockt einen geloeschten Geber im Klartext', () => {
    const meldungen = preflightMask(knopfTree('gibt-es-nicht'), QUELLEN, relations)
    expect(meldungen.some((r) => r.detail.includes('gewählte Zeile eines Bausteins'))).toBe(true)
  })

  it('Preflight blockt einen Parameter ohne gewaehltes Feld', () => {
    const tree = knopfTree('geber')
    const step = tree.knopf.events!.onClick[0]
    if (step.type === 'RELATION') step.params = [{ source: 'gewaehlte_zeile', blockId: 'geber', value: '' }]
    expect(preflightMask(tree, QUELLEN, relations).some((r) =>
      r.detail.includes('Parameter 1 ist unvollständig'))).toBe(true)
  })
})
