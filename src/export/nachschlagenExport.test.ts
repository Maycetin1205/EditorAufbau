import { describe, expect, it } from 'vitest'

import '../blocks/formfeld/FormFeldBlock'
import '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'

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
  })

  it('„Einzigen Treffer übernehmen" ueberlebt den Export', () => {
    const tag = (html: string): string => /<ff-formfeld[^>]*>/.exec(html)?.[0] ?? ''
    const an = tag(exportMask(baumMit({ ...KUNDE_PROPS, einzigerTreffer: 'ja' }), 'M', ADRESSEN).html)
    expect(an).toMatch(/\seinzigerTreffer="ja"/i)

    const aus = tag(exportMask(baumMit(KUNDE_PROPS), 'M', ADRESSEN).html)
    expect(aus).not.toMatch(/einzigerTreffer=/i)
  })

  it('eine eingestellte Fenstergroesse reist mit, die Standardgroesse nicht', () => {
    const standard = exportMask(baumMit(KUNDE_PROPS), 'Maske', ADRESSEN).html
    expect(standard).not.toContain('fensterbreite=')
    expect(standard).not.toContain('fensterhoehe=')

    const gezogen = exportMask(
      baumMit({ ...KUNDE_PROPS, fensterBreite: 760, fensterHoehe: 500 }),
      'Maske', ADRESSEN,
    ).html
    expect(gezogen).toContain('fensterbreite="760"')
    expect(gezogen).toContain('fensterhoehe="500"')
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
  })

  it('eine alte EIGENE Bindung bleibt daheim: ein Quellen-Waehler, ein SEFILELOOP', () => {
    const tree = baumMit({ ...KUNDE_PROPS, source: 'q-tiere', valueField: '18_30' })
    const { html, sevariablen } = exportMask(tree, 'Maske', BEIDE)
    const tag = /<ff-formfeld[^>]*/.exec(html)?.[0] ?? ''
    expect(tag).toContain('nachschlagquelle="q-adr"')
    expect(tag).not.toContain('source=')
    expect(tag).not.toContain('valuefield=')

    expect(JSON.parse(sevariablen).SEFILELOOP.map((s: { ALIAS: string }) => s.ALIAS)).toEqual(['Adressen'])
  })

  // Umgekehrt seit 2026-08-20: das Ankreuzfeld IST bindbar, seit sein
  // SE-Wert-Kontrakt belegt ist (Format `AJN`, 1 Zeichen, `J`/`N`). Bis dahin
  // blieb eine Bindung daheim, weil die Maske sonst einen Schreib-Eintrag fuer
  // einen Wert angelegt haette, den niemand deuten konnte.
  it('Ankreuzfeld: die Bindung reist mit und laedt ihre Quelle (2026-08-20)', () => {
    const tree = baumMit({ ...TEXT_PROPS, fieldType: 'checkbox', source: 'q-tiere', valueField: '18_30' })
    const { html, sevariablen } = exportMask(tree, 'Maske', BEIDE)
    const tag = /<ff-formfeld[^>]*/.exec(html)?.[0] ?? ''
    expect(tag).toContain('fieldtype="checkbox"')
    expect(tag).toContain('valuefield="18_30"')
    expect(JSON.parse(sevariablen).SEFILELOOP.map((s: { ALIAS: string }) => s.ALIAS))
      .toEqual(['Kundenhaustiere'])
  })

  it('Gegenprobe Textfeld: dieselbe Bindung reist mit und laedt ihre Quelle', () => {
    const tree = baumMit({ ...TEXT_PROPS, source: 'q-tiere', valueField: '18_30' })
    const { html, sevariablen } = exportMask(tree, 'Maske', BEIDE)
    const tag = /<ff-formfeld[^>]*/.exec(html)?.[0] ?? ''
    expect(tag).toContain('source="q-tiere"')
    expect(tag).toContain('valuefield="18_30"')
    expect(JSON.parse(sevariablen).SEFILELOOP.map((s: { ALIAS: string }) => s.ALIAS)).toEqual(['Kundenhaustiere'])
  })

  it('zurueckgestellter Feldtyp laesst die Nachschlage-Quelle daheim', () => {
    const tree = baumMit({ ...KUNDE_PROPS, fieldType: 'text', speicherFeld: '999_9' })
    const { sevariablen } = exportMask(tree, 'Maske', ADRESSEN)
    expect('SEFILELOOP' in JSON.parse(sevariablen)).toBe(false)
  })
})
