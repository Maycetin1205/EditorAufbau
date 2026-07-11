// Registry-Konzept blockEvents (Kommandozentrale Z1): Bausteine melden ihre
// Ereignisse mit Klarnamen; die keys sind das Technikwert-Vokabular des
// alten Editors (onClick/onCardClick/onCardDrop) — daran hängen ab Z2 die
// Aktionsketten. LEITPLANKE: Tests niemals loeschen/abschwaechen.

import { describe, expect, it } from 'vitest'
// Imports registrieren die Bloecke als Side-Effect (Muster kanban.export.test).
import { ButtonBlock } from '../../blocks/button/ButtonBlock'
import { KanbanBlock } from '../../blocks/kanban/KanbanBlock'
import { TextBlock } from '../../blocks/text/TextBlock'
import { getBlockDefinition } from './blockRegistry'

describe('blockEvents (Registry, Z1)', () => {
  it('Kanban meldet „Karte angeklickt" + „Karte verschoben" (Keys des alten Editors)', () => {
    expect(getBlockDefinition(KanbanBlock.blockType)?.blockEvents).toEqual([
      { key: 'onCardClick', name: 'Karte angeklickt' },
      { key: 'onCardDrop', name: 'Karte verschoben' },
    ])
  })

  it('Schaltfläche meldet „Klick"', () => {
    expect(getBlockDefinition(ButtonBlock.blockType)?.blockEvents).toEqual([
      { key: 'onClick', name: 'Klick' },
    ])
  })

  it('Text hat keine Ereignisse (undefined, kein leeres Pflichtfeld)', () => {
    expect(getBlockDefinition(TextBlock.blockType)?.blockEvents).toBeUndefined()
  })

  it('Klarname ist nie der Technikwert (kein on…-Key als Anzeigename)', () => {
    for (const def of [KanbanBlock, ButtonBlock].map((b) => getBlockDefinition(b.blockType))) {
      for (const ev of def?.blockEvents ?? []) {
        expect(ev.name).not.toMatch(/^on[A-Z]/)
        expect(ev.name).not.toBe(ev.key)
      }
    }
  })
})
