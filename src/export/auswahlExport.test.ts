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
import { exportMask } from './exportMask'
import { preflightMask } from './preflight'
import { failedChecks, validateMaskHtml } from './validator'

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
