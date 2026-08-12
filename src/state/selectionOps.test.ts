// Tests von auswahlZiel — „welcher Baustein ist nach einem Klick gewaehlt?"
//
// Anlass (U8, Nutzer-Befund 2026-08-12 mit Screenshots): ein Klick auf eine
// Kanban-Karte waehlte das Board, der zweite die Spalte, erst der dritte die
// Karte. Seitdem gilt die Gegenrichtung — der Klick trifft, was unter dem
// Zeiger liegt, und ein weiterer Klick auf denselben Baustein geht eine Ebene
// nach AUSSEN. Die Faelle unten halten beide Richtungen fest, damit die alte
// Regel nicht unbemerkt zurueckkommt.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import type { BlockTree } from '../core/blocks/BlockData'
import { registerBlockType } from '../core/blocks/blockRegistry'
import { FLOW_DEFAULTS } from '../core/blocks/flowLayout'
import { registerTestBlocks, TEST_BLOCK, TEST_BOX } from '../test/testBlocks'
import { auswahlZiel } from './selectionOps'

registerTestBlocks()

// Eine SEITE (pageBlock) — die Grenze, an der die Auswahl nach aussen stehen
// bleibt. Ohne echten Baustein registriert: die Faelle unten brauchen kein DOM.
const TEST_SEITE = 't-seite'
registerBlockType({
  type: TEST_SEITE,
  tagName: 'ff-t-seite',
  displayName: 'Testseite',
  category: 'layout',
  defaultProps: { ...FLOW_DEFAULTS },
  customProperties: [],
  acceptsChildren: true,
  resizableWidth: false,
  resizableHeight: false,
  pageBlock: true,
})

// Wurzel -> Board -> Spalte -> Karte, daneben eine Seite mit einem Baustein.
const baum: BlockTree = {
  root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board', 'seite'] },
  board: { id: 'board', type: TEST_BOX, props: {}, parentId: 'root', childIds: ['spalte'] },
  spalte: { id: 'spalte', type: TEST_BOX, props: {}, parentId: 'board', childIds: ['karte'] },
  karte: { id: 'karte', type: TEST_BLOCK, props: {}, parentId: 'spalte', childIds: [] },
  seite: { id: 'seite', type: TEST_SEITE, props: {}, parentId: 'root', childIds: ['drin'] },
  drin: { id: 'drin', type: TEST_BLOCK, props: {}, parentId: 'seite', childIds: [] },
}

// Klick auf freie Flaeche des Bausteins (nicht auf eine seiner Stellen).
const klick = (getroffen: string, gewaehlt: string | null) =>
  auswahlZiel(baum, getroffen, gewaehlt, false)

describe('auswahlZiel', () => {
  it('waehlt mit EINEM Klick die Karte — nicht das Board (der behobene Fehler)', () => {
    expect(klick('karte', null)).toBe('karte')
  })

  it('waehlt die Karte auch, wenn gerade eine Huelle gewaehlt ist', () => {
    expect(klick('karte', 'board')).toBe('karte')
    expect(klick('karte', 'spalte')).toBe('karte')
  })

  it('geht bei einem weiteren Klick auf denselben Baustein eine Ebene nach aussen', () => {
    expect(klick('karte', 'karte')).toBe('spalte')
    expect(klick('spalte', 'spalte')).toBe('board')
  })

  it('bleibt an der obersten Ebene der Flaeche stehen', () => {
    // Das Board haengt direkt unter der Wurzel: die Flaeche selbst ist kein
    // Baustein, den die Auswahl treffen koennte.
    expect(klick('board', 'board')).toBe('board')
  })

  it('tritt nicht aus einer Seite heraus', () => {
    // Der Popup-/Ansichts-Rumpf wird nie ueber die Flaeche gewaehlt.
    expect(klick('drin', 'drin')).toBe('drin')
  })

  it('laesst die Auswahl stehen, wenn der Klick auf einer Stelle des Bausteins landet', () => {
    // Sonst waere die gewaehlte Karte beim Doppelklick schon nicht mehr
    // gewaehlt (Inline-Edit) und der Feld-Picker ginge nie auf.
    expect(auswahlZiel(baum, 'karte', 'karte', true)).toBe('karte')
  })

  it('waehlt nichts bei unbekannter id oder auf der Wurzel', () => {
    expect(klick('gibtsnicht', null)).toBeNull()
    expect(klick('root', null)).toBeNull()
  })
})
