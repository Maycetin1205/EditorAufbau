import { beforeEach, describe, expect, it } from 'vitest'
import { seGlobal } from '../../softengine/bridge'
import { setzeAuswahlZurueck, waehleAuswahl } from './auswahl'
import { holeDatenVorspann } from './datenVorspann'

// `holeDatenVorspann` liest sein Umfeld ausschliesslich ueber `getAttribute` —
// darum reicht ein Attribut-Beutel, wie in auswahl.test.ts und
// holendeQuellen.test.ts auch.
const elementMit = (attrs: Record<string, string>): HTMLElement =>
  ({ getAttribute: (n: string) => attrs[n] ?? null }) as unknown as HTMLElement

const HUNDE = { '2_8': '10001', '30_20': 'Rex' }
const KATZE = { '2_8': '10002', '30_20': 'Mimi' }
const ZWEITER_HUND = { '2_8': '10001', '30_20': 'Bello' }

const FOLGE = JSON.stringify([{
  geberId: 'kundenTabelle',
  keyPairs: [{ fromField: '2_8', toField: '2_8' }],
}])

beforeEach(() => {
  setzeAuswahlZurueck()
  const g = seGlobal()
  g.FF_DATA_SOURCES = [
    { id: 'q-tiere', name: 'Tiere', tableId: 'IDBID0007', indexField: '0_10' },
  ]
  g.SEDATA = {
    Daten: {
      SEFileLoop: [{ ALIAS: 'Tiere', Zeilen: [HUNDE, KATZE, ZWEITER_HUND] }],
    },
  }
})

// Der gemeinsame Einstieg jeder Datenanzeige. Bis 2026-08-21 wandte er nur
// den TAGESFILTER an; „Folgt der Auswahl von …" setzte allein die Tabelle um.
// Das Kanban-Brett bekam die Zeilen darum unveraendert und ignorierte die
// Einstellung KOMPLETT — der Inspector bot sie an, der Export schrieb sie,
// und zur Laufzeit tat sie nichts.
describe('holeDatenVorspann: die Auswahl-Folge gilt fuer JEDE Datenanzeige', () => {
  it('ohne Auswahl beim Geber kommen alle Zeilen — nichts passiert von selbst', () => {
    const v = holeDatenVorspann(elementMit({ source: 'q-tiere', folgtauswahl: FOLGE }))
    expect(v?.zeilen).toEqual([HUNDE, KATZE, ZWEITER_HUND])
    expect(v?.durchAuswahlGefiltert).toBe(false)
  })

  it('mit Auswahl bleiben nur die passenden Zeilen', () => {
    waehleAuswahl('kundenTabelle', { '2_8': '10001' })
    const v = holeDatenVorspann(elementMit({ source: 'q-tiere', folgtauswahl: FOLGE }))
    expect(v?.zeilen).toEqual([HUNDE, ZWEITER_HUND])
    expect(v?.durchAuswahlGefiltert).toBe(true)
  })

  it('kein Partner: die Liste ist ehrlich LEER, nicht ungefiltert', () => {
    waehleAuswahl('kundenTabelle', { '2_8': '99999' })
    const v = holeDatenVorspann(elementMit({ source: 'q-tiere', folgtauswahl: FOLGE }))
    expect(v?.zeilen).toEqual([])
    expect(v?.durchAuswahlGefiltert).toBe(true)
  })

  it('ohne eingestellte Folge bleibt alles, wie es war', () => {
    waehleAuswahl('kundenTabelle', { '2_8': '10001' })
    const v = holeDatenVorspann(elementMit({ source: 'q-tiere' }))
    expect(v?.zeilen).toEqual([HUNDE, KATZE, ZWEITER_HUND])
    expect(v?.durchAuswahlGefiltert).toBe(false)
  })

  it('ohne (oder mit unbekannter) Quelle gibt es keinen Vorspann', () => {
    expect(holeDatenVorspann(elementMit({}))).toBeNull()
    expect(holeDatenVorspann(elementMit({ source: 'gibt-es-nicht' }))).toBeNull()
  })
})
