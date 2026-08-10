// Migrations-Tests — die Uebernahme alter Speicherstaende (state/migrations.ts).
// Jede Migration ist eine Einbahnstrasse: sie laeuft beim Laden und macht aus
// Altbestand den heutigen Vertrag. Getestet wird sie ueber den ECHTEN Lade-Weg
// (Editor aus dem Browser-Speicher), nicht gegen die Funktion allein — nur so
// faellt auf, wenn eine Migration am falschen Punkt der Kette haengt.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.
//
// Aus persistence.test.ts herausgeloest (2026-08-06), als die Aufraeum-Migration
// "Knopf aus Tabelle" die Datei ueber den 500-Zeilen-Deckel schob
// (check:regeln). Der Schnitt liegt am Thema: hier die MIGRATIONEN, drueben der
// Lade-Weg selbst (sanitize, Notfallkopie, Aktionsketten, Popup-Seiten).
// Die Faelle sind unveraendert uebernommen — reine Verschiebung.

import { beforeEach, describe, expect, it } from 'vitest'
// Side-Effect-Importe: die ECHTEN Bausteine, die die Migrationen anfassen.
// Kanban (kanban, kanban-spalte, card) fuer P1.1 und die Karten-Demowerte;
// die Atome mit Registry-Startbreiten fuer die Raster-Reparatur (Schema 4:
// formfeld startW 6, button startW 4, trenner startW 24); die Tabelle fuer
// die Aufraeum-Migration "Knopf aus Tabelle".
import '../blocks/kanban/KanbanBlock'
import '../blocks/formfeld/FormFeldBlock'
import '../blocks/button/ButtonBlock'
import '../blocks/trenner/TrennerBlock'
import '../blocks/tabelle/TabelleBlock'
import { Editor } from './Editor'
import { CURRENT_SCHEMA_VERSION, DEMO_CLEANUP_BEFORE_SCHEMA } from './migrations'
import { registerTestBlocks, TEST_BLOCK } from '../test/testBlocks'

registerTestBlocks()

const KEY = 'aufbau_editor_mvp_v1'

// Ueber den echten Weg laden: Stand in den Browser-Speicher, Editor bauen.
function load(state: unknown): Editor {
  localStorage.setItem(KEY, JSON.stringify(state))
  return new Editor()
}

beforeEach(() => localStorage.clear())

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

describe('Aufräum-Migration (2026-08-06: Knopf aus Tabelle)', () => {
  it('entfernt einen Knopf, der IN einer Tabelle liegt — restlos, nicht nur unsichtbar', () => {
    // Der Knöpfe-Platz in der Tabelle gab es rund 40 Minuten lang; er ist
    // zurückgenommen (WYSIWYG-Bruch, s. Kopf von TabelleBlock). Ein damals
    // gesetzter Knopf wäre danach ein UNSICHTBARER Waise: nicht gezeichnet,
    // nicht exportiert, nicht mehr löschbar. Nutzer-Ansage: restlos raus.
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
        tab: { id: 'tab', type: 'tabelle', props: {}, parentId: 'root', childIds: ['knopf'] },
        knopf: { id: 'knopf', type: 'button', props: { label: 'Neuer Patient' }, parentId: 'tab', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('knopf')).toBeUndefined()
    expect(ed.getNode('tab')?.childIds).toEqual([])
    // Die Tabelle selbst bleibt unangetastet.
    expect(ed.getNode('tab')?.type).toBe('tabelle')
  })

  it('lässt Knöpfe AUSSERHALB der Tabelle in Ruhe', () => {
    // Die Migration greift eng: nur Kinder vom Typ 'button' unter einem
    // Knoten vom Typ 'tabelle'. Ein Knopf auf der Maskenfläche ist ein ganz
    // normaler Baustein und darf nie mitgerissen werden.
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab', 'frei'] },
        tab: { id: 'tab', type: 'tabelle', props: {}, parentId: 'root', childIds: [] },
        frei: { id: 'frei', type: 'button', props: { label: 'Speichern' }, parentId: 'root', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('frei')?.props.label).toBe('Speichern')
    expect(ed.getNode('root')?.childIds).toEqual(['tab', 'frei'])
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

  // Gegenstueck zum Datei-Weg (maskenDatei.test: „eine Karte mit dem echten
  // Wert Heute ueberlebt Speichern und Laden"). Im BROWSER-Speicher lief der
  // Putzer bis 2026-08-06 auch fuer aktuelle Staende: „Heute" im Chip und
  // „09:15" im Zeitfeld waren nach jedem Reload still weg.
  //
  // A2 (2026-08-10): die Versionen stehen hier als ZAHLEN, nicht als
  // CURRENT_SCHEMA_VERSION. Mit der Konstante haette der Fall „genau an der
  // Grenze" beim naechsten Versionssprung stillschweigend auf 6 gezeigt — der
  // Test waere gruen geblieben und haette dabei aufgehoert, die Grenze zu
  // pruefen. Genau die Sorte gruener Test, die nichts mehr haelt.
  const mitKarte = (schemaVersion: number) => load({
    schemaVersion,
    tree: {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
      board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['s1'] },
      s1: { id: 's1', type: 'kanban-spalte', props: {}, parentId: 'board', childIds: ['getippt'] },
      getippt: {
        id: 'getippt',
        type: 'card',
        props: { chipText: 'Heute', time: '09:15', heading: 'Rückruf Fr. Wagner' },
        parentId: 's1',
        childIds: [],
      },
    },
    selectedId: null,
  })

  it('Schema 4 ist Altbestand: die Werkswerte werden geleert', () => {
    const props = mitKarte(4).getNode('getippt')?.props
    expect(props?.chipText).toBe('')
    expect(props?.time).toBe('')
    expect(props?.heading).toBe('')
  })

  // 5 und 6: „Heute" ist ein echter Wert des Bedieners und bleibt. Der Fall 6
  // ist der eigentliche Grund fuer A2 — er wird heute noch von keinem Stand
  // erreicht, aber der Umbau auf das Popup-Raster braucht ihn.
  it.each([5, 6])('Schema %i bleibt unberuehrt — „Heute" ist dort echt', (v) => {
    const props = mitKarte(v).getNode('getippt')?.props
    expect(props?.chipText).toBe('Heute')
    expect(props?.time).toBe('09:15')
    expect(props?.heading).toBe('Rückruf Fr. Wagner')
  })

  // Stolperdraht fuer den Tag, an dem jemand CURRENT_SCHEMA_VERSION hochsetzt:
  // die Putzer-Grenze ist eine historische Zahl und darf NICHT mitwandern.
  // Wandert sie mit, laeuft der Putzer wieder ueber echte Eingaben.
  it('die Putzer-Grenze wandert nicht mit der Schemaversion mit', () => {
    expect(DEMO_CLEANUP_BEFORE_SCHEMA).toBe(5)
    expect(CURRENT_SCHEMA_VERSION).toBeGreaterThanOrEqual(DEMO_CLEANUP_BEFORE_SCHEMA)
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
