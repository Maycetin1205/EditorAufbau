import { describe, expect, it } from 'vitest'

// Registriert alle Bausteine — der Knopf-Fall (G4) exportiert sonst nichts.
import '../blocks/register'
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

describe('Tabelle: Erfassungszeile (G3)', () => {
  it('ohne Erfassungszeile aendert sich am Export NICHTS', () => {
    const tag = tabelleTag(exportMask(tabelleBaum({})).html)
    expect(tag).not.toMatch(/erfassung/i)
    expect(spaltenAusHtml(exportMask(tabelleBaum({})).html)).toEqual(standardTestSpalten)
  })

  it('der Schalter ueberlebt den Export — mehr wird nicht eingestellt', () => {
    const html = exportMask(tabelleBaum({ erfassung: 'ja' })).html
    expect(tabelleTag(html)).toMatch(/\serfassung="ja"/i)

    // Weder an der Tabelle noch an der Zelle steht eine eigene Angabe: was
    // eine Zelle tut, leitet sie aus der Bindung der Spalte und der
    // Verknuepfung des Bausteins ab (G3).
    expect(tabelleTag(html)).not.toMatch(/erfassungquelle=/i)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('eine Spalte auf einer VERKNUEPFTEN Quelle reist unversehrt', () => {
    // Genau die Bindung, aus der die Erfassungszelle ihre Einschraenkung
    // ableitet: Quelle::Feldcode statt nacktem Feldcode.
    const spalten = [
      { titel: 'Artikel', feld: '3_18', art: 'text' },
      { titel: 'Menge', feld: '', art: 'zahl' },
      { titel: 'Gabe', feld: 'q-tier::5_4', art: 'text' },
    ]
    const html = exportMask(tabelleBaum({ erfassung: 'ja', spalten })).html
    expect(spaltenAusHtml(html)).toEqual(spalten)
    expect(coerceSpalten(spaltenAusHtml(html))).toEqual(spalten)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('die vier alten Zellen-Angaben ueberleben den Round-Trip NICHT', () => {
    // Ein Stand aus G2. Die Tabelle liest ihre Spalten ueber coerceSpalten —
    // dort fallen Rolle, eigene Quelle, Uebernahme-Feld und Vorbelegung weg,
    // die Bindung der Spalte bleibt. (Aus einer GESPEICHERTEN Maske raeumt sie
    // die Migration weg, s. state/migrationen.test.ts.)
    const spalten = [{
      titel: 'Artikel', feld: '3_18', art: 'text',
      rolle: 'nachschlagen', rollenQuelle: 'q-art', erfassung: { feld: '3_18' },
      vorbelegung: '1',
    }]
    const html = exportMask(tabelleBaum({ erfassung: 'ja', spalten })).html
    expect(coerceSpalten(spaltenAusHtml(html)))
      .toEqual([{ titel: 'Artikel', feld: '3_18', art: 'text' }])
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

// G4: Mit Erfassungszeile wird die Tabelle fuer Ketten adressierbar — die
// Kette am Knopf findet sie zur Laufzeit ueber data-ff-block-id (dasselbe
// Attribut wie beim Baustein-Wert). Ohne den Schalter bleibt das Tag sauber.
describe('Tabelle: adressierbar fuer "Wert aus Erfassungszelle" (G4)', () => {
  it('erfassung="ja" schreibt data-ff-block-id mit der Baustein-Kennung', () => {
    const html = exportMask(tabelleBaum({ erfassung: 'ja' })).html
    expect(tabelleTag(html)).toContain('data-ff-block-id="tab"')
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('ohne Erfassungszeile bleibt das Tag ohne data-ff-block-id', () => {
    expect(tabelleTag(exportMask(tabelleBaum({})).html)).not.toContain('data-ff-block-id')
  })

  it('eine Knopf-Kette mit Erfassungszellen-Herkunft reist unversehrt', () => {
    const baum = tabelleBaum({ erfassung: 'ja' })
    baum.root.childIds = ['tab', 'knopf']
    baum.knopf = {
      id: 'knopf', type: 'button', parentId: 'root', childIds: [],
      props: { label: 'Positionen schreiben' },
      events: {
        onClick: [{
          id: 's1', type: 'RELATION', resultKey: '', relationId: 'r-82',
          params: [
            { source: 'erfassungszelle', blockId: 'tab', value: '0' },
            { source: 'fixed', value: '1' },
          ],
          extraParams: [],
        }],
      },
    }
    const html = exportMask(baum).html
    const aktionen = /<ff-button[^>]*data-ff-aktionen="([^"]*)"/.exec(html)?.[1] ?? ''
    expect(aktionen).toContain('erfassungszelle')
    expect(aktionen).toContain('tab')
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })
})

// G5: der Schalter „Schlank" ist ein normaler Registry-Prop — Standard
// reist nicht, Bestandsmasken exportieren byte-gleich.
describe('Tabelle: Schalter Schlank (G5)', () => {
  it('schlank="ja" reist mit, der Standard laesst das Tag sauber', () => {
    expect(tabelleTag(exportMask(tabelleBaum({ schlank: 'ja' })).html)).toMatch(/\sschlank="ja"/i)
    expect(tabelleTag(exportMask(tabelleBaum({})).html)).not.toMatch(/schlank=/i)
  })
})
