// Persistenz-Tests
// Prüfen den Lade-Weg: kaputte/fremde Speicherstände dürfen den Editor nie
// zerlegen (sanitize), alte Formate werden migriert, und Inline-Edit-Werte
// überleben das Neuladen (der am 2026-07-02 gefixte Bug).
// LEITPLANKE: Tests niemals löschen/abschwächen, um "grün" zu werden.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// Side-Effect-Import: registriert die echten Kanban-Blöcke (kanban,
// kanban-spalte, card) für die P1.1-Migrationstests.
import '../blocks/kanban/KanbanBlock'
// … und den echten Popup-Baustein für die Seiten-Tests.
import '../blocks/popup/PopupBlock'
// Echte Atome mit Registry-Startbreiten für die Raster-Reparatur (Schema 4):
// formfeld startW 6, button startW 4, trenner startW 24 (Vollbreite).
import '../blocks/formfeld/FormFeldBlock'
import '../blocks/button/ButtonBlock'
import '../blocks/trenner/TrennerBlock'
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

describe('Migration (P1.1: Vorlagen-Kasten abgeschafft)', () => {
  it('zieht die Musterkarte aus dem Kasten an den ANFANG der ersten Spalte, der Kasten verschwindet', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['kasten', 's1', 's2'] },
        kasten: { id: 'kasten', type: 'kanban-vorlage', props: {}, parentId: 'board', childIds: ['muster'] },
        muster: { id: 'muster', type: 'card', props: { heading: 'Meine Musterkarte' }, parentId: 'kasten', childIds: [] },
        s1: { id: 's1', type: 'kanban-spalte', props: { heading: 'Offen' }, parentId: 'board', childIds: ['alt'] },
        alt: { id: 'alt', type: 'card', props: { heading: 'Alte Karte' }, parentId: 's1', childIds: [] },
        s2: { id: 's2', type: 'kanban-spalte', props: {}, parentId: 'board', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('kasten')).toBeUndefined()
    expect(ed.getNode('board')?.childIds).toEqual(['s1', 's2'])
    // Musterkarte VOR den Bestandskarten — die ERSTE Karte des Boards
    // bleibt damit die gestaltete Vorlage (templateChild/seRuntime).
    expect(ed.getNode('s1')?.childIds).toEqual(['muster', 'alt'])
    expect(ed.getNode('muster')?.props.heading).toBe('Meine Musterkarte')
    expect(ed.getNode('muster')?.parentId).toBe('s1')
  })

  it('Board ohne Spalte (degeneriert): Kasten samt Karten entfällt, nichts bricht', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['kasten'] },
        kasten: { id: 'kasten', type: 'kanban-vorlage', props: {}, parentId: 'board', childIds: ['muster'] },
        muster: { id: 'muster', type: 'card', props: {}, parentId: 'kasten', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('kasten')).toBeUndefined()
    expect(ed.getNode('muster')).toBeUndefined()
    expect(ed.getNode('board')?.childIds).toEqual([])
  })
})

describe('Migration (2026-07-16: alte Karten-Demo-Werte werden geleert)', () => {
  it('leert exakt die früheren Werkswerte, echte Eingaben bleiben', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['s1'] },
        s1: { id: 's1', type: 'kanban-spalte', props: {}, parentId: 'board', childIds: ['demo', 'echt'] },
        demo: {
          id: 'demo',
          type: 'card',
          props: {
            heading: 'Rückruf Fr. Wagner',
            time: '09:15',
            meta: 'Katze · EKH',
            text: 'Befund Minka besprechen',
            chipText: 'Heute',
          },
          parentId: 's1',
          childIds: [],
        },
        echt: {
          id: 'echt',
          type: 'card',
          props: { heading: 'Rückruf Hr. Meier', text: 'Vom Nutzer getippt' },
          parentId: 's1',
          childIds: [],
        },
      },
      selectedId: null,
    })
    const demo = ed.getNode('demo')?.props
    expect(demo?.heading).toBe('')
    expect(demo?.time).toBe('')
    expect(demo?.meta).toBe('')
    expect(demo?.text).toBe('')
    expect(demo?.chipText).toBe('')
    const echt = ed.getNode('echt')?.props
    expect(echt?.heading).toBe('Rückruf Hr. Meier')
    expect(echt?.text).toBe('Vom Nutzer getippt')
  })
})

describe('Migration (Schema 2: Root-Kanban nutzt die Maskenfläche)', () => {
  it('setzt alte Pixelmaße einmalig auf volle Breite und verbleibende Höhe', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: {
          id: 'board',
          type: 'kanban',
          props: { width: 1273, height: 836 },
          parentId: 'root',
          childIds: [],
        },
      },
      selectedId: null,
    })
    expect(ed.getNode('board')?.props.width).toBe('fill')
    expect(ed.getNode('board')?.props.height).toBe('fill')
  })

  it('erhält eine danach bewusst gesetzte feste Höhe', () => {
    const ed = load({
      schemaVersion: 2,
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: {
          id: 'board',
          type: 'kanban',
          props: { width: 'fill', height: 500 },
          parentId: 'root',
          childIds: [],
        },
      },
      selectedId: null,
    })
    expect(ed.getNode('board')?.props.height).toBe(500)
  })
})

describe('Migration (Schema 4: Reparatur der Riesen-Rahmen)', () => {
  // Die erste (kaputte) Raster-Migration setzte JEDEN Block auf Vollbreite
  // (rasterX=0, rasterW=24). Bei Nutzern mit Speicherstand auf Schema 3 heilt
  // erst diese Folge-Migration die schmalen Bausteine wieder.
  it('gibt schmalen Bausteinen die Startbreite zurück, Vollbreite bleibt, überlappungsfrei neu gestapelt', () => {
    const ed = load({
      schemaVersion: 3,
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['ff', 'btn', 'tr'] },
        ff: { id: 'ff', type: 'formfeld', props: { rasterX: 0, rasterY: 0, rasterW: 24, rasterH: 3 }, parentId: 'root', childIds: [] },
        btn: { id: 'btn', type: 'button', props: { rasterX: 0, rasterY: 3, rasterW: 24, rasterH: 3 }, parentId: 'root', childIds: [] },
        tr: { id: 'tr', type: 'trenner', props: { rasterX: 0, rasterY: 6, rasterW: 24, rasterH: 1 }, parentId: 'root', childIds: [] },
      },
      selectedId: null,
    })
    // Schmale Bausteine bekommen ihre Registry-Startbreite zurück …
    expect(ed.getNode('ff')?.props.rasterW).toBe(6)
    expect(ed.getNode('btn')?.props.rasterW).toBe(4)
    // … der zu Recht volle Trenner (Startbreite 24) bleibt Vollbreite.
    expect(ed.getNode('tr')?.props.rasterW).toBe(24)
    // Höhe: Schema 5 kappt die zu grosse Alt-Höhe auf die kalibrierte
    // Registry-Starthöhe (formfeld 2); der Vollbreiten-Trenner bleibt 1 hoch.
    expect(ed.getNode('ff')?.props.rasterH).toBe(2)
    expect(ed.getNode('tr')?.props.rasterH).toBe(1)
    // Überlappungsfrei untereinander gestapelt (x=0, y fortlaufend nach Höhe).
    expect(ed.getNode('ff')?.props.rasterX).toBe(0)
    expect(ed.getNode('ff')?.props.rasterY).toBe(0)
    expect(ed.getNode('btn')?.props.rasterY).toBe(3)
    expect(ed.getNode('tr')?.props.rasterY).toBe(6)
  })

  it('lässt bereits geheilte/frische Stände unberührt (idempotent)', () => {
    const ed = load({
      schemaVersion: 3,
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'b'] },
        // Schon schmal + frei platziert: kein Fehler-Muster → nichts anfassen.
        a: { id: 'a', type: 'formfeld', props: { rasterX: 2, rasterY: 1, rasterW: 6, rasterH: 3 }, parentId: 'root', childIds: [] },
        b: { id: 'b', type: 'button', props: { rasterX: 8, rasterY: 1, rasterW: 4, rasterH: 3 }, parentId: 'root', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('a')?.props.rasterX).toBe(2)
    expect(ed.getNode('a')?.props.rasterY).toBe(1)
    expect(ed.getNode('a')?.props.rasterW).toBe(6)
    expect(ed.getNode('b')?.props.rasterX).toBe(8)
    expect(ed.getNode('b')?.props.rasterW).toBe(4)
  })
})

describe('Migration (altes Flach-Format)', () => {
  it('übernimmt Blöcke aus dem alten Listen-Format, Layout wird verworfen', () => {
    const ed = load({
      blocks: [
        { id: 'alt1', type: TEST_BLOCK, props: { text: 'Alt' }, layout: { x: 10, y: 20, width: 100, height: 40 } },
        { id: 'alt2', type: 'unbekannt', props: {} },
      ],
    })
    expect(ed.getNode('alt1')?.props.text).toBe('Alt')
    expect(ed.getNode('alt1')?.parentId).toBe(ed.rootId)
    expect(ed.getNode('alt1')?.props.layout).toBeUndefined()
    expect(ed.getNode('alt2')).toBeUndefined()
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
