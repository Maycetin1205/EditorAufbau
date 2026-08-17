import { beforeEach, describe, expect, it } from 'vitest'

import '../blocks/kanban/KanbanBlock'
import { Editor } from './Editor'
import { loescheBaustein } from './loescheBaustein'
import { meldungen } from './meldungen'
import { registerTestBlocks, TEST_BLOCK, TEST_BOX } from '../test/testBlocks'

registerTestBlocks()

beforeEach(() => { localStorage.clear(); meldungen.leere() })

describe('Meldungsspur (state/meldungen)', () => {
  it('sammelt mehrere Meldungen in der Reihenfolge des Meldens', () => {
    meldungen.melde('erste')
    meldungen.melde('zweite')
    expect(meldungen.liste.map((m) => m.text)).toEqual(['erste', 'zweite'])
  })

  it('schliesst GENAU die gewaehlte Meldung', () => {
    meldungen.melde('erste')
    meldungen.melde('zweite')
    const erste = meldungen.liste[0]
    meldungen.schliesse(erste.id)
    expect(meldungen.liste.map((m) => m.text)).toEqual(['zweite'])
  })

  it('eine unbekannte Nummer aendert nichts (und weckt niemanden)', () => {
    meldungen.melde('erste')
    let geweckt = 0
    const ab = meldungen.subscribe(() => { geweckt++ })
    meldungen.schliesse(999)
    ab()
    expect(meldungen.liste).toHaveLength(1)
    expect(geweckt).toBe(0)
  })

  it('weckt die Horcher und zaehlt den Stand hoch — sonst zieht die Anzeige nicht nach', () => {
    const vorher = meldungen.version
    let geweckt = 0
    const ab = meldungen.subscribe(() => { geweckt++ })
    meldungen.melde('etwas ist schiefgegangen')
    ab()
    expect(geweckt).toBe(1)
    expect(meldungen.version).toBeGreaterThan(vorher)
  })
})

describe('Loeschen fragt nie nach (U0-3, 2026-08-12)', () => {
  it('ein Baustein MIT Inhalt faellt sofort — Strg+Z ist das Netz', () => {
    const ed = new Editor()
    const kasten = ed.addBlock(TEST_BOX, ed.rootId)
    expect(kasten).not.toBeNull()
    const drin = ed.addBlock(TEST_BLOCK, kasten!.id)
    expect(drin).not.toBeNull()

    loescheBaustein(ed, kasten!.id)

    expect(ed.getNode(kasten!.id)).toBeUndefined()
    expect(ed.getNode(drin!.id)).toBeUndefined()

    expect(meldungen.liste).toHaveLength(0)

    ed.undo()
    expect(ed.getNode(kasten!.id)).toBeDefined()
    expect(ed.getNode(drin!.id)).toBeDefined()
  })

  it('die geschuetzte Musterkarte bleibt stehen UND sagt warum', () => {
    const ed = new Editor()
    const board = ed.addBlock('kanban', ed.rootId)
    expect(board).not.toBeNull()

    const muster = Object.values(ed.tree).find((n) => n.type === 'card')
    expect(muster, 'das Board bringt keine Musterkarte mit').toBeDefined()
    expect(ed.isRemoveProtected(muster!.id)).toBe(true)

    loescheBaustein(ed, muster!.id)

    expect(ed.getNode(muster!.id)).toBeDefined()
    expect(meldungen.liste).toHaveLength(1)
    expect(meldungen.liste[0].text).toContain('Musterkarte')
  })
})
