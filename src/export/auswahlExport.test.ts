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

// Die Tabellen dieser Datei tragen eine ECHTE Quelle, seit die Geber-
// Eigenschaft hergeleitet wird (2026-08-06): ohne Datenquelle ist eine Tabelle
// kein Auswahl-Geber mehr — sie zeigt nur Platzhalter, es gibt keinen Satz
// abzugeben. Genau das prueft der letzte Fall unten ausdruecklich.
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
  // Zwei Tabellen: die zweite folgt der Auswahl der ersten. Der Fall des
  // Nutzers: Kunden-Tabelle + Belege-Tabelle, verbunden ueber die
  // Adressnummer.
  const folge = [{ geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '3_8' }] }]
  const paarTree = (folgtAuswahl: unknown, quelle = 'q-saetze'): BlockTree => ({
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['geber', 'folger'] },
    geber: {
      id: 'geber',
      type: 'tabelle',
      props: { width: 'fill', source: quelle, spalten, rasterX: 0, rasterY: 0, rasterW: 24, rasterH: 4 },
      parentId: 'root',
      childIds: [],
    },
    folger: {
      id: 'folger',
      type: 'tabelle',
      props: { width: 'fill', source: quelle, spalten, folgtAuswahl, rasterX: 0, rasterY: 4, rasterW: 24, rasterH: 4 },
      parentId: 'root',
      childIds: [],
    },
  })

  it('Auswahl-Geber tragen ihre Baum-id als data-ff-id — auch ohne Folger', () => {
    const { html } = exportMask(paarTree([]), 'Maske', QUELLEN)
    // BEIDE Tabellen sind Geber (Datenquelle + Zeilenklick) und werden
    // gestempelt: die Markierung funktioniert auch, wenn (noch) niemand folgt.
    expect(html).toMatch(/<ff-tabelle[^>]*\sdata-ff-id="geber"/)
    expect(html).toMatch(/<ff-tabelle[^>]*\sdata-ff-id="folger"/)
  })

  it('OHNE Datenquelle kein data-ff-id — eine Tabelle mit Platzhaltern gibt nichts ab', () => {
    // Hergeleitet statt angemeldet (2026-08-06). Vorher trug jede Tabelle die
    // Kennung, auch die ganz ohne Daten: der Inspector bot sie als Geber an,
    // und der Folger filterte in der Maske stumm nie.
    const { html } = exportMask(paarTree([], ''))
    // Am TAG geprueft, nicht am ganzen Dokument: das eingebettete
    // Laufzeit-Buendel enthaelt den Attributnamen als Code-Text.
    expect(html).not.toMatch(/<ff-tabelle[^>]*\sdata-ff-id=/)
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
    // 2026-08-06: bis dahin konnte nur die Tabelle folgen. Ohne dieses
    // Attribut im Export zeigte das Feld in SoftEngine weiter stur die erste
    // Zeile, waehrend der Editor die Einstellung anbietet — WYSIWYG-Bruch.
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
          source: '', value: '', valueField: '', width: 240, folgtAuswahl: folge,
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

  it('Preflight blockt einen geloeschten Geber und ein halbes Feldpaar im Klartext', () => {
    const kaputt = preflightMask(paarTree([{ geberId: 'gibt-es-nicht', keyPairs: [{ fromField: '2_8', toField: '3_8' }] }]), QUELLEN, [])
    expect(kaputt.some((r) => r.name === 'Auswahl-Geber fehlt')).toBe(true)
    const halb = preflightMask(paarTree([{ geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '' }] }]), QUELLEN, [])
    expect(halb.some((r) => r.name === 'Auswahl-Folge unvollstaendig')).toBe(true)
    const sauber = preflightMask(paarTree(folge), QUELLEN, [])
    expect(sauber.filter((r) => r.name.startsWith('Auswahl'))).toEqual([])
  })

  it('Preflight blockt einen Geber, dem die Datenquelle weggenommen wurde', () => {
    // Neuer Fall seit der Herleitung (2026-08-06): der Geber steht noch im
    // Baum, ist aber keiner mehr. Vorher blieb das voellig still — die Folge
    // sah eingestellt aus und filterte nie.
    const ohneQuelle = preflightMask(paarTree(folge, ''), QUELLEN, [])
    expect(ohneQuelle.some((r) => r.name === 'Auswahl-Geber fehlt')).toBe(true)
    expect(ohneQuelle.some((r) => r.detail.includes('keine Auswahl (mehr) gibt'))).toBe(true)
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
      // Ungebundene Spalte: hier geht es um den KETTEN-Parameter, nicht um die
      // Anzeige. Die QUELLE muss aber dran sein — ohne sie ist die Tabelle seit
      // 2026-08-06 kein Auswahl-Geber, und genau das prueft der Fall darunter.
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
    // Der Geber traegt data-ff-id — genau darueber findet die Laufzeit seine
    // gewaehlte Zeile wieder.
    expect(html).toMatch(/<ff-tabelle[^>]*\sdata-ff-id="geber"/)
    expect(preflightMask(tree, QUELLEN, relations)).toEqual([])
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Preflight blockt einen geloeschten Geber im Klartext', () => {
    const meldungen = preflightMask(knopfTree('gibt-es-nicht'), QUELLEN, relations)
    expect(meldungen.some((r) => r.detail.includes('gewaehlte Zeile eines Bausteins'))).toBe(true)
  })

  it('Preflight blockt einen Parameter ohne gewaehltes Feld', () => {
    const tree = knopfTree('geber')
    const step = tree.knopf.events!.onClick[0]
    if (step.type === 'RELATION') step.params = [{ source: 'gewaehlte_zeile', blockId: 'geber', value: '' }]
    expect(preflightMask(tree, QUELLEN, relations).some((r) =>
      r.detail.includes('Parameter 1 ist unvollstaendig'))).toBe(true)
  })
})
