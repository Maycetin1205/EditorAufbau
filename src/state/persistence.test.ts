// Persistenz-Tests
// Prüfen den Lade-Weg: kaputte/fremde Speicherstände dürfen den Editor nie
// zerlegen (sanitize), Verluste passieren nie still (Notfallkopie, Meldung),
// und Inline-Edit-Werte überleben das Neuladen (der am 2026-07-02 gefixte Bug).
// LEITPLANKE: Tests niemals löschen/abschwächen, um "grün" zu werden.
//
// Die MIGRATIONEN (alte Speicherstände in die heutige Form) stehen seit
// 2026-08-06 nebenan in migrationen.test.ts — die Datei war sonst über den
// 500-Zeilen-Deckel gewachsen (check:regeln). Der Schnitt liegt am Thema.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// Side-Effect-Import: der echte Popup-Baustein für die Seiten-Tests. Mehr
// echte Bausteine braucht dieser Weg nicht — alles Übrige läuft über die
// Test-Bausteine.
import '../blocks/popup/PopupBlock'
import { BACKUP_KEY, Editor } from './Editor'
import {
  registerTestBlocks,
  TEST_BLOCK,
  TEST_BOX,
  TEST_EVENT_BLOCK,
} from '../test/testBlocks'

registerTestBlocks()

const KEY = 'aufbau_editor_mvp_v1'

function load(state: unknown): Editor {
  localStorage.setItem(KEY, JSON.stringify(state))
  return new Editor()
}

// Sammelt alert-Meldungen für die Dauer eines Tests (die meisten Lade-Tests
// prüfen sie nicht — dann bleibt alert schlicht ungestubbt wie bisher).
function captureAlerts(): string[] {
  const msgs: string[] = []
  ;(globalThis as Record<string, unknown>).alert = (m: string) => { msgs.push(m) }
  return msgs
}

beforeEach(() => localStorage.clear())
afterEach(() => { delete (globalThis as Record<string, unknown>).alert })

describe('sanitizeTree (Laden verteidigt sich)', () => {
  it('lädt einen gesunden Baum vollständig', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'x'] },
        a: { id: 'a', type: TEST_BOX, props: { direction: 'row' }, parentId: 'root', childIds: ['b'] },
        b: { id: 'b', type: TEST_BLOCK, props: { text: 'Hallo' }, parentId: 'a', childIds: [] },
        x: { id: 'x', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [] },
      },
      selectedId: 'b',
    })
    expect(ed.getNode('a')?.props.direction).toBe('row')
    expect(ed.getNode('b')?.props.text).toBe('Hallo')
    expect(ed.selectedId).toBe('b')
  })

  it('Inline-Edit-Werte überleben das Neuladen (Bugfix 2026-07-02)', () => {
    // text ist KEIN Inspector-Feld (customProperties leer) — muss trotzdem
    // erhalten bleiben, weil es in den defaultProps deklariert ist.
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
        a: { id: 'a', type: TEST_BLOCK, props: { text: 'Vom Nutzer geändert' }, parentId: 'root', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('a')?.props.text).toBe('Vom Nutzer geändert')
  })

  it('verwirft unbekannte Typen, Waisen und fremde Props', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'kaputt'] },
        a: { id: 'a', type: TEST_BLOCK, props: { text: 'ok', boese: 'injektion' }, parentId: 'root', childIds: [] },
        kaputt: { id: 'kaputt', type: 'gibt-es-nicht', props: {}, parentId: 'root', childIds: [] },
        waise: { id: 'waise', type: TEST_BLOCK, props: {}, parentId: 'nirgends', childIds: [] },
      },
      selectedId: 'kaputt',
    })
    expect(ed.getNode('a')?.props.text).toBe('ok')
    expect(ed.getNode('a')?.props.boese).toBeUndefined() // unbekannte Keys fliegen raus
    expect(ed.getNode('kaputt')).toBeUndefined()
    expect(ed.getNode('waise')).toBeUndefined()
    expect(ed.selectedId).toBeNull() // Auswahl auf gelöschtem Knoten → weg
  })

  it('überlebt Zyklen im gespeicherten Baum', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
        a: { id: 'a', type: TEST_BOX, props: {}, parentId: 'root', childIds: ['b'] },
        b: { id: 'b', type: TEST_BOX, props: {}, parentId: 'a', childIds: ['a'] }, // Zyklus!
      },
      selectedId: null,
    })
    expect(ed.getNode('a')?.parentId).toBe(ed.rootId)
    expect(ed.getNode('b')?.childIds).toEqual([]) // Zyklus gekappt
  })

  it('überlebt kompletten Müll im Speicher', () => {
    localStorage.setItem(KEY, '{{{kein json')
    const ed = new Editor()
    expect(ed.blockCount).toBe(0) // leerer, benutzbarer Editor
  })

  // Kahlschlag 2026-07-14: abgeschaffte Typen (text/container/infobox/badge/
  // formfield) in alten Speicherständen verschwinden NIE still — der Bediener
  // bekommt eine Meldung, und der INHALT eines abgeschafften Rahmens wird an
  // seiner Stelle eingegliedert statt mitgelöscht.
  it('meldet verworfene unbekannte Typen sichtbar und zieht deren Kinder hoch', () => {
    const meldungen: string[] = []
    ;(globalThis as Record<string, unknown>).alert = (msg: string) => { meldungen.push(msg) }
    try {
      const ed = load({
        tree: {
          root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t1', 'c1', 't2'] },
          t1: { id: 't1', type: 'text', props: {}, parentId: 'root', childIds: [] },
          // Abgeschaffter "Bereich" mit echtem Inhalt: der Rahmen fällt,
          // der Block darin rückt an dieselbe Stelle unter die Wurzel.
          c1: { id: 'c1', type: 'container', props: {}, parentId: 'root', childIds: ['drin'] },
          drin: { id: 'drin', type: TEST_BLOCK, props: { text: 'Gerettet' }, parentId: 'c1', childIds: [] },
          t2: { id: 't2', type: 'text', props: {}, parentId: 'root', childIds: [] },
        },
        selectedId: null,
      })
      expect(ed.getNode('t1')).toBeUndefined()
      expect(ed.getNode('c1')).toBeUndefined()
      expect(ed.getNode('drin')?.props.text).toBe('Gerettet')
      expect(ed.getNode('drin')?.parentId).toBe(ed.rootId)
      // Reihenfolge: der gerettete Inhalt steht an der Stelle des Rahmens.
      expect(ed.getNode(ed.rootId)?.childIds).toEqual(['drin'])
      expect(meldungen).toHaveLength(1)
      expect(meldungen[0]).toContain('3 Baustein(e)')
      expect(meldungen[0]).toContain('"text"')
      expect(meldungen[0]).toContain('"container"')
    } finally {
      delete (globalThis as Record<string, unknown>).alert
    }
  })
})

describe('Notfallkopie bei unlesbarem Stand (U1)', () => {
  it('sichert kaputtes JSON als Notfallkopie und meldet es, statt still leer zu starten', () => {
    const msgs = captureAlerts()
    localStorage.setItem(KEY, '{{{kein json')
    const ed = new Editor()
    expect(ed.blockCount).toBe(0)                                 // leerer, benutzbarer Editor
    expect(localStorage.getItem(BACKUP_KEY)).toBe('{{{kein json') // Rohdaten unverändert gesichert
    expect(msgs).toHaveLength(1)
    expect(msgs[0]).toContain('beschädigt')
    expect(msgs[0]).toContain(BACKUP_KEY)                         // Fundort steht in der Meldung
  })

  it('behandelt gültiges JSON ohne verwertbaren Baum wie einen Lesefehler', () => {
    const msgs = captureAlerts()
    // Hatte mal einen tree-Schlüssel (also echte Editor-Daten), aber die
    // Struktur ist unbrauchbar — nicht still verwerfen.
    const raw = JSON.stringify({ schemaVersion: 2, tree: 'kaputt', selectedId: null })
    localStorage.setItem(KEY, raw)
    const ed = new Editor()
    expect(ed.blockCount).toBe(0)
    expect(localStorage.getItem(BACKUP_KEY)).toBe(raw)
    expect(msgs).toHaveLength(1)
  })

  it('überschreibt eine bereits vorhandene Notfallkopie NICHT (früheste bleibt)', () => {
    captureAlerts()
    localStorage.setItem(BACKUP_KEY, 'aeltere kopie')
    localStorage.setItem(KEY, '{{{kein json')
    new Editor()
    expect(localStorage.getItem(BACKUP_KEY)).toBe('aeltere kopie')
  })

  it('der Autosave überschreibt die Notfallkopie nie (getrennter Schlüssel)', () => {
    vi.useFakeTimers()
    try {
      captureAlerts()
      localStorage.setItem(KEY, '{{{kein json')
      const ed = new Editor()
      const kopie = localStorage.getItem(BACKUP_KEY)
      expect(kopie).toBe('{{{kein json')
      // Echte Änderung anstoßen und den debounced Save durchlaufen lassen.
      ed.addBlock(TEST_BLOCK)
      vi.runAllTimers()
      // STORAGE_KEY trägt jetzt gültige Editor-Daten ...
      const gespeichert = localStorage.getItem(KEY)
      expect(gespeichert).not.toBe('{{{kein json')
      expect(() => JSON.parse(gespeichert as string)).not.toThrow()
      // ... die Notfallkopie ist unangetastet.
      expect(localStorage.getItem(BACKUP_KEY)).toBe(kopie)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('Aktionsketten (Z2) im Speicher', () => {
  const schritt = { id: 's1', type: 'START_TOOL', resultKey: '', toolNr: '3003', toolParams: ['{PINDEX}'] }

  it('Ketten überleben das Neuladen', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
        a: { id: 'a', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [], events: { onClick: [schritt] } },
      },
      selectedId: null,
    })
    expect(ed.getNode('a')?.events).toEqual({ onClick: [schritt] })
  })

  it('verwirft Ketten an nicht deklarierten Ereignissen und kaputte Schritte', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'b', 'c'] },
        // onFremd deklariert der Typ nicht -> fliegt; onClick bleibt.
        a: { id: 'a', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [], events: { onClick: [schritt], onFremd: [schritt] } },
        // kaputter Schritt (toolNr als Zahl) -> ganze Kette weg, Feld entfällt.
        b: { id: 'b', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [], events: { onClick: [{ ...schritt, toolNr: 7 }] } },
        // Block ohne blockEvents: events-Müll wird nie übernommen.
        c: { id: 'c', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [], events: { onClick: [schritt] } },
      },
      selectedId: null,
    })
    expect(ed.getNode('a')?.events).toEqual({ onClick: [schritt] })
    expect(ed.getNode('b')?.events).toBeUndefined()
    expect(ed.getNode('c')?.events).toBeUndefined()
  })
})


describe('Popup-Seiten (P-A)', () => {
  it('Popup-Knoten mit Inhalt überlebt das Neuladen; die Hauptseite fließt ohne ihn', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'p'] },
        a: { id: 'a', type: TEST_BLOCK, props: { text: 'Haupt' }, parentId: 'root', childIds: [] },
        p: { id: 'p', type: 'popup', props: { name: 'Neue Behandlung', breite: 400, hoehe: 300 }, parentId: 'root', childIds: ['b'] },
        b: { id: 'b', type: TEST_BLOCK, props: { text: 'Im Popup' }, parentId: 'p', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('p')?.props.name).toBe('Neue Behandlung')
    expect(ed.getNode('b')?.parentId).toBe('p')
    // Seiten-Bausteine erscheinen NIE im Fluss der Hauptseite …
    expect(ed.childNodesOf('root').map((n) => n.id)).toEqual(['a'])
    // … sondern als eigene Seiten neben der Hauptseite.
    expect(ed.pages.map((s) => s.name)).toEqual(['Hauptseite', 'Neue Behandlung'])
  })

  // Die Auswahl wird persistiert, die offene SEITE bewusst nicht — sie startet
  // immer als Hauptseite. Bis 2026-08-06 blieb die Auswahl am Popup-Inhalt
  // haengen: der Inspector aenderte einen unsichtbaren Baustein, Entf loeschte
  // ihn. Die Auswahl auf der Hauptseite bleibt unveraendert erhalten.
  it('nur eine Auswahl auf der Hauptseite ueberlebt das Neuladen', () => {
    const baum = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'p'] },
      a: { id: 'a', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [] },
      p: { id: 'p', type: 'popup', props: { name: 'Popup' }, parentId: 'root', childIds: ['b'] },
      b: { id: 'b', type: TEST_BLOCK, props: {}, parentId: 'p', childIds: [] },
    }
    expect(load({ tree: baum, selectedId: 'b' }).selectedId).toBeNull()
    expect(load({ tree: baum, selectedId: 'a' }).selectedId).toBe('a')
  })

  it('addPopupPage: eindeutiger Name, Seite wird aktiv, Anlegen+Benennen = EIN Undo-Schritt', () => {
    const ed = new Editor()
    const p1 = ed.addPopupPage()
    const p2 = ed.addPopupPage()
    expect(p1).not.toBeNull()
    expect(p2).not.toBeNull()
    expect(ed.getNode(p1!.id)?.props.name).toBe('Popup')
    expect(ed.getNode(p2!.id)?.props.name).toBe('Popup 2')
    expect(ed.activePageId).toBe(p2!.id)
    ed.undo()
    // Ein Undo entfernt die Seite KOMPLETT (nicht erst den Namen) und die
    // aktive Seite fällt sicher auf die Hauptseite zurück.
    expect(ed.getNode(p2!.id)).toBeUndefined()
    expect(ed.activePageId).toBe(ed.rootId)
    expect(ed.pages.map((s) => s.name)).toEqual(['Hauptseite', 'Popup'])
  })
})

