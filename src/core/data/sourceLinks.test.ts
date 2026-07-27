// Tests des Verknuepfungs-Modells.
// Die zwei Nutzer-Entscheidungen vom 2026-07-25 stehen hier als Test:
// hoechstens drei Schluesselpaare, und eine unbrauchbare Verknuepfung
// verbindet einfach nicht (statt zu raten).

import { describe, expect, it } from 'vitest'
import {
  MAX_SCHLUESSELPAARE,
  findLink,
  istBrauchbar,
  leereVerknuepfung,
  paareAusSicht,
  sanitizeSourceLinks,
  vollstaendigePaare,
  type SourceLink,
} from './sourceLinks'

const link = (over: Partial<SourceLink> = {}): SourceLink => ({
  id: 'L1',
  fromSourceId: 'auftrag',
  toSourceId: 'kunde',
  keyPairs: [{ fromField: '2_8', toField: '10_8' }],
  ...over,
})

describe('istBrauchbar', () => {
  it('erkennt eine vollstaendige Verknuepfung', () => {
    expect(istBrauchbar(link())).toBe(true)
  })

  it('weist halbfertige ab, ohne zu werfen', () => {
    expect(istBrauchbar(link({ fromSourceId: '' }))).toBe(false)
    expect(istBrauchbar(link({ toSourceId: '' }))).toBe(false)
    expect(istBrauchbar(link({ keyPairs: [{ fromField: '2_8', toField: '' }] }))).toBe(false)
    expect(istBrauchbar(link({ keyPairs: [] }))).toBe(false)
  })

  it('weist eine Quelle mit sich selbst ab', () => {
    expect(istBrauchbar(link({ toSourceId: 'auftrag' }))).toBe(false)
  })
})

describe('vollstaendigePaare', () => {
  it('laesst halbe Paare weg — ein halbes Paar traefe alles oder nichts', () => {
    const l = link({ keyPairs: [
      { fromField: '2_8', toField: '10_8' },
      { fromField: '3_4', toField: '' },
      { fromField: '', toField: '5_2' },
    ] })
    expect(vollstaendigePaare(l)).toEqual([{ fromField: '2_8', toField: '10_8' }])
  })
})

describe('findLink', () => {
  const links = [link()]

  it('findet die Verknuepfung in BEIDE Richtungen', () => {
    expect(findLink(links, 'auftrag', 'kunde')?.id).toBe('L1')
    expect(findLink(links, 'kunde', 'auftrag')?.id).toBe('L1')
  })

  it('findet nichts bei unbekannten oder leeren Quellen', () => {
    expect(findLink(links, 'auftrag', 'artikel')).toBeUndefined()
    expect(findLink(links, '', 'kunde')).toBeUndefined()
    expect(findLink(links, 'kunde', 'kunde')).toBeUndefined()
  })

  it('uebergeht unbrauchbare Verknuepfungen', () => {
    const halb = [link({ keyPairs: [{ fromField: '2_8', toField: '' }] })]
    expect(findLink(halb, 'auftrag', 'kunde')).toBeUndefined()
  })
})

describe('paareAusSicht', () => {
  const l = link({ keyPairs: [
    { fromField: 'A1', toField: 'B1' },
    { fromField: 'A2', toField: 'B2' },
  ] })

  it('laesst die Paare stehen, wenn die Hauptquelle links steht', () => {
    expect(paareAusSicht(l, 'auftrag')).toEqual([
      { haupt: 'A1', zusatz: 'B1' },
      { haupt: 'A2', zusatz: 'B2' },
    ])
  })

  it('DREHT die Paare, wenn die Hauptquelle rechts steht', () => {
    expect(paareAusSicht(l, 'kunde')).toEqual([
      { haupt: 'B1', zusatz: 'A1' },
      { haupt: 'B2', zusatz: 'A2' },
    ])
  })
})

describe('sanitizeSourceLinks (kaputter Speicher darf nie den Start blockieren)', () => {
  it('gibt bei Muell eine leere Liste zurueck', () => {
    expect(sanitizeSourceLinks(null)).toEqual([])
    expect(sanitizeSourceLinks('nope')).toEqual([])
    expect(sanitizeSourceLinks([1, 'x', null])).toEqual([])
  })

  it('laesst Eintraege ohne id oder ohne Paare aus', () => {
    expect(sanitizeSourceLinks([{ fromSourceId: 'a', toSourceId: 'b', keyPairs: [] }])).toEqual([])
    expect(sanitizeSourceLinks([{ id: 'X', fromSourceId: 'a', toSourceId: 'b' }])).toEqual([])
  })

  it('verwirft doppelte ids', () => {
    const roh = [link(), link()]
    expect(sanitizeSourceLinks(roh)).toHaveLength(1)
  })

  it('schneidet mehr als drei Paare ab, statt den Eintrag zu verwerfen', () => {
    const viele = [link({ keyPairs: [
      { fromField: 'a', toField: 'b' },
      { fromField: 'c', toField: 'd' },
      { fromField: 'e', toField: 'f' },
      { fromField: 'g', toField: 'h' },
    ] })]
    expect(sanitizeSourceLinks(viele)[0].keyPairs).toHaveLength(MAX_SCHLUESSELPAARE)
  })

  it('liest eine gute Verknuepfung unveraendert ein', () => {
    expect(sanitizeSourceLinks([link()])).toEqual([link()])
  })
})

describe('leereVerknuepfung', () => {
  it('startet mit EINER leeren Zeile, damit im Formular sofort etwas steht', () => {
    const leer = leereVerknuepfung()
    expect(leer.keyPairs).toHaveLength(1)
    expect(istBrauchbar({ id: 'x', ...leer })).toBe(false)
  })
})
