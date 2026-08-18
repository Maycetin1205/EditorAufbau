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

describe('Tabelle: Erfassungszeile (G2)', () => {
  it('ohne Erfassungszeile aendert sich am Export NICHTS', () => {
    const tag = tabelleTag(exportMask(tabelleBaum({})).html)
    expect(tag).not.toMatch(/erfassung/i)
    expect(spaltenAusHtml(exportMask(tabelleBaum({})).html)).toEqual(standardTestSpalten)
  })

  it('der Schalter ueberlebt den Export — eine Quelle an der TABELLE gibt es nicht', () => {
    const html = exportMask(tabelleBaum({ erfassung: 'ja' })).html
    expect(tabelleTag(html)).toMatch(/\serfassung="ja"/i)

    // Die Nachschlage-Quelle haengt an der SPALTE (Nutzer-Korrektur
    // 2026-08-18); eine tabellenweite Eigenschaft darf es nicht geben.
    expect(tabelleTag(html)).not.toMatch(/erfassungquelle=/i)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Rolle, eigene Quelle und Feld reisen JE SPALTE mit', () => {
    // Zwei Nachschlage-Spalten mit VERSCHIEDENEN Quellen — genau der Fall,
    // an dem eine tabellenweite Quelle scheitern wuerde.
    const spalten = [
      {
        titel: 'Artikel', feld: '', art: 'text',
        rolle: 'nachschlagen', rollenQuelle: 'q-art', erfassung: { feld: '3_18' },
      },
      {
        titel: 'Bezeichnung', feld: '', art: 'text',
        rolle: 'folgt', rollenQuelle: 'q-art', erfassung: { feld: '30_40' },
      },
      { titel: 'Menge', feld: '', art: 'zahl', rolle: 'frei', vorbelegung: '1' },
      {
        titel: 'Gabe', feld: '', art: 'text',
        rolle: 'nachschlagen', rollenQuelle: 'q-gabe', erfassung: { feld: '5_4' },
      },
    ]
    const html = exportMask(tabelleBaum({ erfassung: 'ja', spalten })).html
    expect(spaltenAusHtml(html)).toEqual(spalten)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Reste einer verworfenen Rolle reisen NICHT mit', () => {
    // Erst „Nachschlagen" gestellt, dann auf „Frei" zurueck: weder Quelle
    // noch Feld duerfen in der Maske landen. Umgekehrt genauso: eine
    // Vorbelegung gilt nur bei „Frei".
    const spalten = [
      {
        titel: 'Artikel', feld: '', art: 'text',
        rolle: 'frei', rollenQuelle: 'q-art', erfassung: { feld: '3_18' },
        vorbelegung: 'X',
      },
      {
        titel: 'Bezeichnung', feld: '', art: 'text',
        rolle: 'folgt', rollenQuelle: 'q-art', erfassung: { feld: '30_40' },
        vorbelegung: 'weg',
      },
    ]
    const tree = tabelleBaum({ erfassung: 'ja', spalten })
    expect(spaltenAusHtml(exportMask(tree).html)).toEqual([
      { titel: 'Artikel', feld: '', art: 'text', rolle: 'frei', vorbelegung: 'X' },
      {
        titel: 'Bezeichnung', feld: '', art: 'text',
        rolle: 'folgt', rollenQuelle: 'q-art', erfassung: { feld: '30_40' },
      },
    ])

    // Der Baum selbst bleibt unangetastet — der Export putzt nur seine Kopie.
    expect(tree.tab.props.spalten).toBe(spalten)
    expect(spalten[0].erfassung).toEqual({ feld: '3_18' })
    expect(spalten[0].rollenQuelle).toBe('q-art')
  })

  it('coerceSpalten faengt kaputte Rollen-Angaben ab', () => {
    expect(coerceSpalten([{ titel: 'A', feld: '', art: 'text', rolle: '' }]))
      .toEqual([{ titel: 'A', feld: '', art: 'text' }])

    expect(coerceSpalten([{ titel: 'A', feld: '', art: 'text', erfassung: { feld: 7 } }]))
      .toEqual([{ titel: 'A', feld: '', art: 'text' }])

    expect(coerceSpalten([{ titel: 'A', feld: '', art: 'text', rollenQuelle: 'q-art' }]))
      .toEqual([{ titel: 'A', feld: '', art: 'text', rollenQuelle: 'q-art' }])

    expect(coerceSpalten([{ titel: 'A', feld: '', art: 'text', vorbelegung: '1' }]))
      .toEqual([{ titel: 'A', feld: '', art: 'text', vorbelegung: '1' }])
  })
})

describe('Tabelle: Zeilenklick als Ketten-Ausloeser (V4)', () => {
  it('eine Kette an "Zeile gewaehlt" reist als Ereignis mit', () => {
    const baum = tabelleBaum({})
    baum.tab.events = {
      onRowClick: [{
        id: 's1', type: 'POPUP_OPEN', resultKey: '', popupId: 'Beleg',
      }],
    }
    const { html } = exportMask(baum)
    expect(tabelleTag(html)).toContain('data-ff-aktionen=')
    expect(html).toContain('onRowClick')
    expect(html).toContain('POPUP_OPEN')
  })

  it('ein unbekanntes Ereignis faellt weg — nur deklarierte reisen mit', () => {
    const baum = tabelleBaum({})
    baum.tab.events = {
      onGibtEsNicht: [{ id: 's1', type: 'POPUP_OPEN', resultKey: '', popupId: 'Beleg' }],
    }
    expect(exportMask(baum).html).not.toContain('onGibtEsNicht')
  })
})
