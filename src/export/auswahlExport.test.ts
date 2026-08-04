// Export-Tests der AUSWAHL („Zeile anklicken -> die anderen folgen").
//
// Aus export.test.ts herausgeloest (2026-08-06), weil diese Datei ueber den
// 500-Zeilen-Deckel gewachsen war. Der Schnitt ist der natuerliche: hier
// alles, was mit dem Auswahl-Geber und seinen Folgern zu tun hat, drueben
// die allgemeinen Export-Grundsaetze. Dieselbe Testart, nur geteilt.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
// Side-Effect-Importe: registrieren die beteiligten Bausteine (Geber +
// Einzelwert-Folger).
import '../blocks/formfeld/FormFeldBlock'
import '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { registerTestBlocks, TEST_EVENT_BLOCK } from '../test/testBlocks'
import { exportMask } from './exportMask'
import { preflightMask } from './preflight'
import { failedChecks, validateMaskHtml } from './validator'

registerTestBlocks()

// Spalten fuer die Tabellen-Faelle: Umlaut + Komma + gebundene/ungebundene
// Spalte in einem — deckt Escaping UND Feldcodes ab.
const spalten = [
  { titel: 'Kunde', feld: '2_8' },
  { titel: 'Betrag, netto', feld: '10_12' },
  { titel: 'Größe', feld: '' },
]

describe('Auswahl im Export (Uebersicht -> Detail, 2026-08-05)', () => {
  // Zwei Tabellen: die zweite folgt der Auswahl der ersten. Der Fall des
  // Nutzers: Kunden-Tabelle + Belege-Tabelle, verbunden ueber die
  // Adressnummer.
  const folge = [{ geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '3_8' }] }]
  const paarTree = (folgtAuswahl: unknown): BlockTree => ({
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['geber', 'folger'] },
    geber: {
      id: 'geber',
      type: 'tabelle',
      props: { width: 'fill', spalten, rasterX: 0, rasterY: 0, rasterW: 24, rasterH: 4 },
      parentId: 'root',
      childIds: [],
    },
    folger: {
      id: 'folger',
      type: 'tabelle',
      props: { width: 'fill', spalten, folgtAuswahl, rasterX: 0, rasterY: 4, rasterW: 24, rasterH: 4 },
      parentId: 'root',
      childIds: [],
    },
  })

  it('Auswahl-Geber tragen ihre Baum-id als data-ff-id — auch ohne Folger', () => {
    const { html } = exportMask(paarTree([]))
    // BEIDE Tabellen sind Geber (Registry auswahlGeber) und werden gestempelt:
    // die Markierung funktioniert auch, wenn (noch) niemand folgt.
    expect(html).toMatch(/<ff-tabelle[^>]*\sdata-ff-id="geber"/)
    expect(html).toMatch(/<ff-tabelle[^>]*\sdata-ff-id="folger"/)
  })

  it('folgtAuswahl reist als JSON-Attribut und kommt unversehrt zurueck', () => {
    const { html } = exportMask(paarTree(folge))
    const attr = /<ff-tabelle[^>]*\sfolgtauswahl="([^"]*)"/.exec(html)?.[1] ?? ''
    expect(attr).not.toBe('')
    expect(JSON.parse(attr.replace(/&quot;/g, '"'))).toEqual(folge)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('eine LEERE Folge-Liste reist gar nicht mit (bestehende Masken bleiben byte-identisch)', () => {
    const { html } = exportMask(paarTree([]))
    expect(html).not.toContain('folgtauswahl')
  })

  it('auch ein EINZELWERT-Baustein folgt: folgtAuswahl reist am Formularfeld mit', () => {
    // 2026-08-06: bis dahin konnte nur die Tabelle folgen. Ohne dieses
    // Attribut im Export zeigte das Feld in SoftEngine weiter stur die erste
    // Zeile, waehrend der Editor die Einstellung anbietet — WYSIWYG-Bruch.
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['geber', 'feld'] },
      geber: {
        id: 'geber', type: 'tabelle',
        props: { width: 'fill', spalten },
        parentId: 'root', childIds: [],
      },
      feld: {
        id: 'feld', type: 'formfeld',
        props: {
          fieldType: 'text', placeholder: 'Tiername', options: '',
          source: '', value: '', valueField: '', width: 240, folgtAuswahl: folge,
        },
        parentId: 'root', childIds: [],
      },
    }
    const { html } = exportMask(tree)
    const attr = /<ff-formfeld[^>]*\sfolgtauswahl="([^"]*)"/.exec(html)?.[1] ?? ''
    expect(JSON.parse(attr.replace(/&quot;/g, '"'))).toEqual(folge)
    expect(preflightMask(tree, [], []).filter((r) => r.name.startsWith('Auswahl'))).toEqual([])
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Preflight blockt einen geloeschten Geber und ein halbes Feldpaar im Klartext', () => {
    const kaputt = preflightMask(paarTree([{ geberId: 'gibt-es-nicht', keyPairs: [{ fromField: '2_8', toField: '3_8' }] }]), [], [])
    expect(kaputt.some((r) => r.name === 'Auswahl-Geber fehlt')).toBe(true)
    const halb = preflightMask(paarTree([{ geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '' }] }]), [], [])
    expect(halb.some((r) => r.name === 'Auswahl-Folge unvollstaendig')).toBe(true)
    const sauber = preflightMask(paarTree(folge), [], [])
    expect(sauber.filter((r) => r.name.startsWith('Auswahl'))).toEqual([])
  })
})

describe('Parameterquelle „Feld der gewaehlten Zeile" (2026-08-06)', () => {
  // Der Fall: eine Tabelle zeigt Saetze, ein Knopf daneben schreibt auf den
  // ANGEKLICKTEN Satz. {PINDEX} traegt nur, wer das Ereignis ausloest — der
  // Knopf weiss von der Auswahl nichts. Ueber diese Quelle erreicht er den
  // Satz-Index (0_10) der gewaehlten Zeile.
  const relations = [{
    id: 'rel-put', name: 'Bemerkung schreiben', verb: 'PUT_RELATION', nr: '0174',
    params: ['{PINDEX}'], allowExtraParams: false,
  }] as const

  const knopfTree = (blockId: string): BlockTree => ({
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['geber', 'knopf'] },
    geber: {
      id: 'geber', type: 'tabelle',
      // Ungebundene Spalte: hier geht es um den KETTEN-Parameter, nicht um
      // die Anzeige — eine gebundene Spalte ohne Datenquelle brachte nur
      // Preflight-Meldungen, die mit diesem Fall nichts zu tun haben.
      props: { width: 'fill', spalten: [{ titel: 'Kunde', feld: '' }] },
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
    const { html } = exportMask(tree, 'Maske', [], relations)
    expect(html).toContain('&quot;source&quot;:&quot;gewaehlte_zeile&quot;')
    expect(html).toContain('&quot;blockId&quot;:&quot;geber&quot;')
    expect(html).toContain('&quot;value&quot;:&quot;0_10&quot;')
    // Der Geber traegt data-ff-id — genau darueber findet die Laufzeit seine
    // gewaehlte Zeile wieder.
    expect(html).toMatch(/<ff-tabelle[^>]*\sdata-ff-id="geber"/)
    expect(preflightMask(tree, [], relations)).toEqual([])
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Preflight blockt einen geloeschten Geber im Klartext', () => {
    const meldungen = preflightMask(knopfTree('gibt-es-nicht'), [], relations)
    expect(meldungen.some((r) => r.detail.includes('gewaehlte Zeile eines Bausteins'))).toBe(true)
  })

  it('Preflight blockt einen Parameter ohne gewaehltes Feld', () => {
    const tree = knopfTree('geber')
    const step = tree.knopf.events!.onClick[0]
    if (step.type === 'RELATION') step.params = [{ source: 'gewaehlte_zeile', blockId: 'geber', value: '' }]
    expect(preflightMask(tree, [], relations).some((r) =>
      r.detail.includes('Parameter 1 ist unvollstaendig'))).toBe(true)
  })
})
