import { describe, expect, it } from 'vitest'

import { coerceSpalten } from '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { failedChecks, validateMaskHtml } from './validator'

const spaltenAusHtml = (html: string): unknown =>
  JSON.parse(
    (/<ff-tabelle[^>]*\sspalten="([^"]*)"/.exec(html)?.[1] ?? '').replace(
      /&#x([0-9A-Fa-f]+);|&quot;|&amp;/g,
      (m, h?: string) => (h ? String.fromCodePoint(parseInt(h, 16)) : m === '&quot;' ? '"' : '&'),
    ),
  )

const standardTestSpalten = [
  { titel: 'Kunde', feld: '2_8', art: 'text' },
  { titel: 'Betrag, netto', feld: '10_12', art: 'zahl' },
  {
    titel: 'Größe', feld: '', art: 'status',
    zuordnung: [
      { wert: 'W', name: 'Wartet', bedeutung: 'warning' },
      { wert: 'F', name: 'Fertig, geprüft', bedeutung: 'success' },
    ],
  },

  {
    titel: 'Patient', feld: '30_20', art: 'bild',
    felder: { bild: '50_10', unter: 'q-rasse::12_18' },
  },
]

const tabelleBaum = (props: Record<string, unknown>): BlockTree => ({
  root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
  tab: {
    id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
    props: { width: 'fill', spalten: standardTestSpalten, ...props },
  },
})

const tabelleTag = (html: string): string => /<ff-tabelle[^>]*>/i.exec(html)?.[0] ?? ''

describe('Tabelle (Fahrplan 4)', () => {
  it('Spalten (Titel + Feld + Art) ueberleben den Export als JSON — Komma und Umlaut sind die Fallen', () => {
    const { html } = exportMask(tabelleBaum({}))
    expect(html).toContain('<ff-tabelle ')
    expect(spaltenAusHtml(html)).toEqual(standardTestSpalten)

    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Tabelle: Einstellungen einer NICHT gewaehlten Darstellung reisen nicht mit', () => {
    const spalten = [
      { titel: 'Kunde', feld: '2_8', art: 'text', felder: { bild: '18_30', unter: '99_20' } },
      {
        titel: 'Menge', feld: '10_12', art: 'zahl',
        zuordnung: [{ wert: 'W', name: 'Wartet', bedeutung: 'warning' }],
      },
    ]
    const tree = tabelleBaum({ spalten })
    const { html } = exportMask(tree)
    expect(spaltenAusHtml(html)).toEqual([
      { titel: 'Kunde', feld: '2_8', art: 'text' },
      { titel: 'Menge', feld: '10_12', art: 'zahl' },
    ])

    expect(tree.tab.props.spalten).toBe(spalten)
    expect(spalten[0].felder).toEqual({ bild: '18_30', unter: '99_20' })
  })

  it('Tabelle: die Suchzeile-Einstellung ueberlebt den Export', () => {
    const { html } = exportMask(tabelleBaum({ suche: 'nein' }))
    expect(html).toMatch(/<ff-tabelle[^>]*\ssuche="nein"/i)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Tabelle: die Maskeneinstellungen ueberleben den Export', () => {
    const gesetzt = exportMask(tabelleBaum({ tagField: '118_10' })).html
    expect(tabelleTag(gesetzt)).toMatch(/\stagField="118_10"/i)
    expect(failedChecks(validateMaskHtml(gesetzt))).toEqual([])

    expect(tabelleTag(exportMask(tabelleBaum({ tagField: '' })).html)).not.toMatch(/tagField=/i)
  })

  it('Tabelle: der Zeilen-Waehler reist NICHT mehr mit (S2.1)', () => {
    const alt = tabelleTag(exportMask(tabelleBaum({ proSeite: '25', zeilenWaehler: 'ja' })).html)
    expect(alt).not.toMatch(/proSeite=/i)
    expect(alt).not.toMatch(/zeilenWaehler=/i)
  })

  it('Tabelle: „Text wenn leer" reist nur mit, wenn er vom Standard abweicht', () => {
    const gesetzt = exportMask(tabelleBaum({ leerText: 'Keine Patienten für heute.' })).html
    expect(tabelleTag(gesetzt)).toMatch(/\sleerText="Keine Patienten f&#xFC;r heute\."/i)
    expect(failedChecks(validateMaskHtml(gesetzt))).toEqual([])

    expect(tabelleTag(exportMask(tabelleBaum({ leerText: '' })).html)).toMatch(/\sleerText=""/i)

    const standard = tabelleTag(exportMask(tabelleBaum({ leerText: 'Keine Datensätze.' })).html)
    expect(standard).not.toMatch(/leerText=/i)
  })

  it('coerceSpalten faengt alte Staende defensiv ab (Titel-Strings, Zahl, kaputt)', () => {
    expect(coerceSpalten([{ titel: 'A', feld: '2_8', art: 'zahl' }]))
      .toEqual([{ titel: 'A', feld: '2_8', art: 'zahl' }])

    expect(coerceSpalten([{ titel: 'A', feld: '2_8' }]))
      .toEqual([{ titel: 'A', feld: '2_8', art: 'text' }])

    expect(coerceSpalten([{ titel: 'A', feld: '', art: 'gibt-es-nicht' }]))
      .toEqual([{ titel: 'A', feld: '', art: 'gibt-es-nicht' }])

    expect(coerceSpalten(['A', 'B'])).toEqual([
      { titel: 'A', feld: '', art: 'text' },
      { titel: 'B', feld: '', art: 'text' },
    ])

    expect(coerceSpalten(2)).toEqual([
      { titel: 'Spalte 1', feld: '', art: 'text' },
      { titel: 'Spalte 2', feld: '', art: 'text' },
    ])

    expect(coerceSpalten(null)).toHaveLength(3)
    expect(coerceSpalten('quatsch')).toHaveLength(3)

    expect(coerceSpalten([{ titel: 'X' }])).toEqual([{ titel: 'X', feld: '', art: 'text' }])
  })
})
