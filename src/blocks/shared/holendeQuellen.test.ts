import { beforeEach, describe, expect, it } from 'vitest'

import '../formfeld/FormFeldBlock'
import '../tabelle/TabelleBlock'
import '../kanban/KanbanBlock'
import '../trenner/TrennerBlock'
import { klareAuswahl, setzeAuswahlZurueck, waehleAuswahl } from './auswahl'
import { gewaehlteZeileDerQuelle, quelleAttrJeTag } from './holendeQuellen'

describe('quelleAttrJeTag', () => {
  it('nimmt für das Nachschlage-Feld dessen Nachschlage-Quelle', () => {
    expect(quelleAttrJeTag().get('ff-formfeld')).toBe('nachschlagquelle')
  })

  it('nimmt für Zeilen-Geber die normale Datenquelle', () => {
    const map = quelleAttrJeTag()
    expect(map.get('ff-tabelle')).toBe('source')
    expect(map.get('ff-kanban')).toBe('source')
  })

  it('kennt nur Bausteine, an denen der Bediener einen Satz herausgreift', () => {
    expect(quelleAttrJeTag().has('ff-trenner')).toBe(false)
  })
})

// Fake-Wurzel wie in seAktionen.test.ts: geprueft wird allein, WELCHER Geber
// gewinnt — dafuer braucht es kein Fenster.
const ATTR_JE_TAG = new Map([['ff-tabelle', 'source']])

function fakeGeber(geberId: string, quelle: string) {
  const attrs = new Map([['data-ff-id', geberId], ['source', quelle]])
  return {
    tagName: 'FF-TABELLE',
    getAttribute: (k: string) => attrs.get(k) ?? null,
  }
}

function fakeWurzel(geber: ReturnType<typeof fakeGeber>[]): ParentNode {
  return {
    querySelectorAll: (selector: string) => (selector === '[data-ff-id]' ? geber : []),
  } as unknown as ParentNode
}

describe('gewaehlteZeileDerQuelle: der letzte Klick gewinnt', () => {
  const zeile1 = { '2_8': '10001' }
  const zeile2 = { '2_8': '20002' }
  const zeile3 = { '2_8': '30003' }

  const tabelle1 = fakeGeber('tabelle1', 'belege')
  const tabelle2 = fakeGeber('tabelle2', 'belege')
  const wurzel = fakeWurzel([tabelle1, tabelle2])

  const gewaehlt = (quelle: string, wo: ParentNode = wurzel): unknown =>
    gewaehlteZeileDerQuelle(quelle, ATTR_JE_TAG, wo)

  beforeEach(() => setzeAuswahlZurueck())

  it('ohne Auswahl: nichts wird erfunden', () => {
    expect(gewaehlt('belege')).toBeUndefined()
  })

  it('die juengste Wahl gewinnt, nicht die erste im Aufbau', () => {
    waehleAuswahl('tabelle1', zeile1)
    expect(gewaehlt('belege')).toEqual(zeile1)

    waehleAuswahl('tabelle2', zeile2)
    expect(gewaehlt('belege')).toEqual(zeile2)

    // Zurueck in die erste Tabelle, andere Zeile: sie ist jetzt die juengste.
    waehleAuswahl('tabelle1', zeile3)
    expect(gewaehlt('belege')).toEqual(zeile3)
  })

  it('dieselbe Zeile nochmal getroffen waehlt ab — dann gilt die andere Tabelle', () => {
    waehleAuswahl('tabelle2', zeile2)
    waehleAuswahl('tabelle1', zeile1)
    expect(gewaehlt('belege')).toEqual(zeile1)

    waehleAuswahl('tabelle1', zeile1)
    expect(gewaehlt('belege')).toEqual(zeile2)
  })

  it('Abwahl der juengsten faellt auf die naechstjuengere zurueck', () => {
    waehleAuswahl('tabelle1', zeile1)
    waehleAuswahl('tabelle2', zeile2)

    klareAuswahl('tabelle2')
    expect(gewaehlt('belege')).toEqual(zeile1)

    klareAuswahl('tabelle1')
    expect(gewaehlt('belege')).toBeUndefined()
  })

  it('eine fremde Quelle bleibt unberuehrt', () => {
    const fremde = fakeGeber('tabelle3', 'adressen')
    const wo = fakeWurzel([tabelle1, tabelle2, fremde])
    waehleAuswahl('tabelle3', zeile2)

    expect(gewaehlt('belege', wo)).toBeUndefined()
    expect(gewaehlt('adressen', wo)).toEqual(zeile2)
  })

  it('ohne Quelle wird nicht gesucht', () => {
    waehleAuswahl('tabelle1', zeile1)
    expect(gewaehlt('')).toBeUndefined()
  })
})
