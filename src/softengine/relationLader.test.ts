import { beforeEach, describe, expect, it } from 'vitest'
import { getField, rowsFor, type RuntimeLadeRelation } from './data'
import { geholteZeilenFuer, setzeGeholteZeilenZurueck } from './geholteZeilen'
import { ladeZeilenPerRelation } from './relationLader'

const g = globalThis as unknown as Record<string, unknown>
let seCallback: ((raw: unknown) => void) | undefined
const anfragen: { nr: string; params: string[] }[] = []

g.window ??= { addEventListener: () => {} }
g.document ??= {
  title: 'Relation-Lader-Test',
  addEventListener: () => {},
  getElementById: () => null,
  body: undefined,
}
g.basisHTML_REGISTER = (cb: (raw: unknown) => void): void => {
  seCallback = cb
}
g.basisHTML_SND_MSG = (_verb: string, nachricht: { NR: string; PARAMS: string[] }): void => {
  anfragen.push({ nr: nachricht.NR, params: nachricht.PARAMS })
}

g.SEDATA = { Daten: {} }

function sende(paket: unknown): void {
  if (!seCallback) throw new Error('SoftEngine-Callback nie registriert (bootSe nicht gelaufen?)')
  seCallback(JSON.stringify(paket))
}

function antworte(wert: string): void {
  sende({ RESULT: wert })
}

async function tick(): Promise<void> {
  for (let i = 0; i < 6; i += 1) await Promise.resolve()
}

function satz(artikel: string, text: string): string {
  return (' '.repeat(11) + artikel.padEnd(6).slice(0, 6) + ' ' + text).padEnd(255)
}

const LADE: RuntimeLadeRelation = {
  nr: '69',
  geberQuelleId: 'belege',
  belegartFeld: '2_1',
  belegnummerFeld: '3_8',
  jahrFeld: '0_1',
  archivFeld: '1_1',
  endeFelder: ['11_6', '18_25'],
  zusatzFelder: [],
}

const BELEG = { '2_1': 'R', '3_8': '26200228', '0_1': '6', '1_1': '0' }

beforeEach(() => {
  setzeGeholteZeilenZurueck()
  anfragen.length = 0
})

describe('relationLader (Welle R, Etappe R2)', () => {
  it('holt Positionen seriell bis zum Ende und speist sie in den normalen Datenweg', async () => {
    const quelle = { id: 'q-ende', name: 'BelegPositionen' }
    ladeZeilenPerRelation(quelle, LADE, BELEG)
    await tick()

    expect(anfragen).toHaveLength(1)
    expect(anfragen[0].nr).toBe('69')
    expect(anfragen[0].params).toEqual([
      'R', '0', '255', '26200228', '6', '0', '', '1', '', '', '', '',
    ])

    antworte(satz('4711', 'Wurmkur'))
    await tick()
    expect(geholteZeilenFuer('BelegPositionen')).toEqual([])
    expect(anfragen[1]?.params[7]).toBe('2')

    antworte(satz('4712', 'Futter'))
    await tick()

    antworte('')
    await tick()

    const rows = rowsFor({ Daten: {} }, 'BelegPositionen', 'POS')
    expect(rows).toHaveLength(2)
    expect(getField(rows[0], '11_6')).toBe('4711')
    expect(getField(rows[1], '18_25')).toBe('Futter')
    expect(anfragen).toHaveLength(3)
  })

  it('Abwahl leert die Quelle sofort und fragt nichts', async () => {
    const quelle = { id: 'q-abwahl', name: 'Positionen' }
    ladeZeilenPerRelation(quelle, LADE, BELEG)
    await tick()
    antworte(satz('1', 'Eins'))
    await tick()
    antworte('')
    await tick()
    expect(rowsFor({ Daten: {} }, 'Positionen', 'POS')).toHaveLength(1)

    const fragenVorher = anfragen.length
    ladeZeilenPerRelation(quelle, LADE, undefined)
    expect(rowsFor({ Daten: {} }, 'Positionen', 'POS')).toEqual([])
    expect(anfragen).toHaveLength(fragenVorher)
  })

  it('eine überholte Antwort wird still verworfen (schnell zwei Belege angeklickt)', async () => {
    const quelle = { id: 'q-ueberholt', name: 'Wechsel' }
    ladeZeilenPerRelation(quelle, LADE, BELEG)
    await tick()

    ladeZeilenPerRelation(quelle, LADE, { ...BELEG, '3_8': '26200400' })
    await tick()

    antworte(satz('ALT', 'Position des alten Belegs'))
    await tick()
    expect(anfragen).toHaveLength(2)
    expect(anfragen[1].params[3]).toBe('26200400')

    antworte(satz('NEU', 'Position des neuen Belegs'))
    await tick()
    antworte('')
    await tick()

    const rows = rowsFor({ Daten: {} }, 'Wechsel', 'POS')
    expect(rows).toHaveLength(1)
    expect(getField(rows[0], '11_6')).toBe('NEU')
  })

  it('Felder hinter dem 255er-Schnitt kosten je Position eine eigene Frage', async () => {
    const quelle = { id: 'q-zusatz', name: 'MitZusatz' }
    ladeZeilenPerRelation(quelle, { ...LADE, zusatzFelder: ['280_12'] }, BELEG)
    await tick()
    antworte(satz('4711', 'Wurmkur'))
    await tick()

    expect(anfragen).toHaveLength(2)
    expect(anfragen[1].params).toEqual([
      'R', '280', '12', '26200228', '6', '0', '', '1', '', '', '', '',
    ])
    antworte('54321')
    await tick()
    antworte('')
    await tick()

    const rows = rowsFor({ Daten: {} }, 'MitZusatz', 'POS')
    expect(rows).toHaveLength(1)

    expect(getField(rows[0], '280_12')).toBe('54321')
  })

  it('ein Fremdpaket beendet die Liste NICHT, die echte Antwort zählt normal', async () => {
    const quelle = { id: 'q-fremd', name: 'MitFremdpaket' }
    ladeZeilenPerRelation(quelle, LADE, BELEG)
    await tick()
    antworte(satz('4711', 'Wurmkur'))
    await tick()
    expect(anfragen).toHaveLength(2)

    sende({ MSGART: 'x', ID: '' })
    await tick()

    expect(anfragen).toHaveLength(2)
    expect(geholteZeilenFuer('MitFremdpaket')).toEqual([])

    antworte(satz('4712', 'Futter'))
    await tick()

    antworte('')
    await tick()

    const rows = rowsFor({ Daten: {} }, 'MitFremdpaket', 'POS')
    expect(rows).toHaveLength(2)
    expect(getField(rows[1], '11_6')).toBe('4712')
  })

  it('ein halber Schlüssel fragt nicht, er leert (nie raten)', () => {
    const quelle = { id: 'q-halb', name: 'HalberSchluessel' }
    ladeZeilenPerRelation(quelle, LADE, { '2_1': 'R' })
    expect(anfragen).toHaveLength(0)
    expect(rowsFor({ Daten: {} }, 'HalberSchluessel', 'POS')).toEqual([])
  })

  it('Notbremse: nach 999 Positionen ohne Ende-Kennung ist Schluss', async () => {
    const quelle = { id: 'q-deckel', name: 'OhneEnde' }
    ladeZeilenPerRelation(quelle, LADE, BELEG)
    await tick()

    for (let i = 0; i < 999; i += 1) {
      antworte(satz(String(i + 1), 'endlos'))
      await tick()
    }
    expect(anfragen).toHaveLength(999)
    expect(rowsFor({ Daten: {} }, 'OhneEnde', 'POS')).toHaveLength(999)
  })
})
