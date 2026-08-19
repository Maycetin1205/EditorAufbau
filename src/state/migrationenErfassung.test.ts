import { describe, expect, it, beforeEach } from 'vitest'

import '../blocks/button/ButtonBlock'
import '../blocks/tabelle/TabelleBlock'
import { Editor } from './Editor'

const KEY = 'aufbau_editor_mvp_v1'

function load(state: unknown): Editor {
  localStorage.setItem(KEY, JSON.stringify(state))
  return new Editor()
}

beforeEach(() => { localStorage.clear() })

// Die Erfassung stellte zwei Dinge selbst fest, die der Nutzer seit dem
// 2026-08-19 SELBST waehlt: wo eine Zelle sucht (Stufe 7) und wie eine Kette an
// die erfasste Zeile kommt (Stufe 8). Beide Stufen heben gespeicherte Masken
// auf die neuen Wahlen, ohne ihr Verhalten zu aendern — genau das steht hier.
describe('Migration (Schema 7: Sucht-in wird eine Wahl)', () => {
  const stand = (schemaVersion: number) => load({
    schemaVersion,
    tree: {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
      tab: {
        id: 'tab',
        type: 'tabelle',
        parentId: 'root',
        childIds: [],
        props: {
          source: 'q-pos',
          erfassung: 'ja',
          weitereQuellen: [
            { quelleId: 'q-art', keyPairs: [{ fromField: '10_8', toField: '3_18' }] },
          ],
          spalten: [
            { titel: 'Artikel', feld: '10_8', art: 'text' },
            { titel: 'Bezeichnung', feld: 'q-art::30_40', art: 'text' },
            { titel: 'Menge', feld: '11_6', art: 'zahl' },
          ],
        },
      },
    },
    selectedId: null,
  })

  const spalten = (ed: Editor): Record<string, unknown>[] =>
    (ed.getNode('tab')?.props.spalten ?? []) as Record<string, unknown>[]

  it('schreibt die alte Ableitung als Wahl fest — gekoppelt und Anzeige', () => {
    const s = spalten(stand(6))
    // Das gekoppelte Positions-Feld suchte im Stamm, weil ein Schluesselpaar
    // es koppelte; die Anzeige-Spalte suchte in ihrer eigenen Quelle.
    expect(s[0].suchtIn).toBe('q-art')
    expect(s[1].suchtIn).toBe('q-art')
    // Die Menge war ungekoppelt und bleibt frei.
    expect(s[2].suchtIn).toBeUndefined()
  })

  it('ruehrt eine Maske ab Schema 7 nicht mehr an — „frei" bleibt frei', () => {
    const s = spalten(stand(7))
    expect(s[0].suchtIn).toBeUndefined()
    expect(s[1].suchtIn).toBeUndefined()
  })
})

describe('Migration (Schema 8: Erfassungszelle wird Quelle-und-Feld)', () => {
  const stand = (schemaVersion: number, spaltenIndex: string) => load({
    schemaVersion,
    tree: {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab', 'knopf'] },
      tab: {
        id: 'tab',
        type: 'tabelle',
        parentId: 'root',
        childIds: [],
        props: {
          source: 'q-pos',
          erfassung: 'ja',
          spalten: [
            { titel: 'Artikel', feld: '10_8', art: 'text' },
            { titel: 'Bezeichnung', feld: 'q-art::30_40', art: 'text' },
          ],
        },
      },
      knopf: {
        id: 'knopf',
        type: 'button',
        parentId: 'root',
        childIds: [],
        props: { label: 'Schreiben' },
        events: {
          onClick: [{
            id: 's1',
            type: 'RELATION',
            resultKey: '',
            relationId: 'r-82',
            params: [
              { source: 'erfassungszelle', blockId: 'tab', value: spaltenIndex },
              { source: 'fixed', value: '1' },
            ],
            extraParams: [],
          }],
        },
      },
    },
    selectedId: null,
  })

  const params = (ed: Editor): Record<string, unknown>[] => {
    const step = ed.getNode('knopf')?.events?.onClick?.[0]
    return step && step.type === 'RELATION'
      ? (step.params as unknown as Record<string, unknown>[])
      : []
  }

  it('macht aus dem Spalten-Index die Quelle und das Feld der Spalte', () => {
    const p = params(stand(7, '0'))
    expect(p[0]).toEqual({ source: 'data_field', dataSourceId: 'q-pos', value: '10_8' })
    // Der feste Wert daneben bleibt unangetastet.
    expect(p[1]).toEqual({ source: 'fixed', value: '1' })
  })

  it('eine Spalte auf eine verknuepfte Quelle behaelt DEREN Quelle', () => {
    expect(params(stand(7, '1'))[0])
      .toEqual({ source: 'data_field', dataSourceId: 'q-art', value: '30_40' })
  })

  it('eine Spalte, die es nicht mehr gibt, wird ein LEERER fester Wert', () => {
    expect(params(stand(7, '9'))[0]).toEqual({ source: 'fixed', value: '' })
  })

  it('ab Schema 8 wird nichts mehr gewandelt', () => {
    expect(params(stand(8, '0'))[0])
      .toEqual({ source: 'erfassungszelle', blockId: 'tab', value: '0' })
  })
})
