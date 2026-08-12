// Meldungsspur und Loeschen ohne Rueckfrage — U2 (2026-08-12)
//
// Zwei Aussagen stehen hier, weil sie zusammen gebaut wurden:
//
//  1. Die Meldungsspur (state/meldungen.ts) ersetzt sieben `window.alert`.
//     Sie muss sammeln, einzeln schliessen und ihre Horcher wecken — sonst
//     zieht die Anzeige nicht nach und eine Verlustmeldung faellt unter den
//     Tisch. Das ist der Weg, auf dem seit U2 JEDE Editor-Meldung laeuft;
//     dass der Lade- und der Schreibweg ihn wirklich benutzen, halten
//     persistence.test.ts und speicherPanne.test.ts fest.
//  2. Loeschen fragt NIE nach (Nutzer-Entscheidung U0-3). Bis U2 fragte das
//     Kreuzchen am Baustein bei Inhalt nach, Entf-Taste und
//     Inspector-Papierkorb nicht — derselbe Baustein verschwand je Weg
//     anders. Der Parameter dafuer ist weg; was BLEIBEN muss, ist die
//     Erklaerung an der geschuetzten Musterkarte: ohne sie waere der
//     Loeschknopf dort ein toter Knopf (Regel 4).
//
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { beforeEach, describe, expect, it } from 'vitest'
// Side-Effect-Import: das echte Kanban-Board traegt die Musterkarten-Regel
// (templateChild) — die Test-Bausteine haben keine.
import '../blocks/kanban/KanbanBlock'
import { Editor } from './Editor'
import { loescheBaustein } from './loescheBaustein'
import { meldungen } from './meldungen'
import { registerTestBlocks, TEST_BLOCK, TEST_BOX } from '../test/testBlocks'

registerTestBlocks()

// Die Spur ist ein Modul-Singleton und ueberlebt den einzelnen Test.
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
    // Keine Rueckfrage, aber auch keine Meldung: ein gewolltes Loeschen ist
    // kein Ereignis, ueber das der Editor reden muesste.
    expect(meldungen.liste).toHaveLength(0)

    ed.undo()
    expect(ed.getNode(kasten!.id)).toBeDefined()
    expect(ed.getNode(drin!.id)).toBeDefined()
  })

  it('die geschuetzte Musterkarte bleibt stehen UND sagt warum', () => {
    const ed = new Editor()
    const board = ed.addBlock('kanban', ed.rootId)
    expect(board).not.toBeNull()
    // Die erste Karte des Boards ist die Musterkarte (templateChild).
    const muster = Object.values(ed.tree).find((n) => n.type === 'card')
    expect(muster, 'das Board bringt keine Musterkarte mit').toBeDefined()
    expect(ed.isRemoveProtected(muster!.id)).toBe(true)

    loescheBaustein(ed, muster!.id)

    expect(ed.getNode(muster!.id)).toBeDefined()      // steht noch
    expect(meldungen.liste).toHaveLength(1)           // und der Knopf ist nicht tot
    expect(meldungen.liste[0].text).toContain('Musterkarte')
  })
})
