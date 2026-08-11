// Teilverlust beim Laden (A4, 2026-08-10)
//
// Bis hierher galt: der Datei-Weg lehnt eine Maske ab, sobald beim Bereinigen
// etwas verlorengeht — der BROWSER-Weg duennte still aus. Eine Waise, eine
// kaputte Aktionskette, eine Eigenschaft, die kein Baustein mehr kennt: alles
// fiel lautlos weg, und der Autosave schrieb den kleineren Stand 500 ms spaeter
// fest. Zwei Kriterien fuer dieselbe Frage waren ein Fehler; jetzt gilt an
// beiden Wegen das strengere.
//
// Eigene Datei, weil persistence.test.ts am 500-Zeilen-Deckel steht
// (check:regeln) und weil das hier eine eigene Aussage ist: drueben der
// LADE-Weg an sich, hier der TEILVERLUST.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// Echte Bausteine, weil hier der Eltern-Kind-VERTRAG der Registry geprueft
// wird — den koennen Test-Bausteine nicht glaubhaft nachstellen: die Karte
// darf nur in eine Kanban-Spalte, das Popup nur direkt unter die Wurzel.
import '../blocks/card/CardBlock'
import '../blocks/kanban/KanbanBlock'
import '../blocks/popup/PopupBlock'
// Die Tabelle wird gebraucht, weil S2.1 zwei ihrer Eigenschaften gestrichen hat
// und ein Altbestand damit trotzdem laden muss (unten, eigener Abschnitt).
import '../blocks/tabelle/TabelleBlock'
import { DataSourceStore } from './DataSourceStore'
import { Editor } from './Editor'
import { quarantaeneKopien } from './notfallkopie'
import { verwerfeGesperrteStaende } from './persistence'
import { speicherGate } from './speicherGate'
import { registerTestBlocks, TEST_BLOCK, TEST_BOX, TEST_EVENT_BLOCK } from '../test/testBlocks'

registerTestBlocks()

const KEY = 'aufbau_editor_mvp_v1'
const QUELLEN_KEY = 'aufbau_editor_datenquellen_v1'

// Der Riegel lebt im Modul und ueberlebt den einzelnen Test.
beforeEach(() => { localStorage.clear(); speicherGate.entsperre() })
afterEach(() => { speicherGate.entsperre() })

// Einen Baum in den Browser-Speicher legen und den Editor bauen — der echte
// Weg, nicht die Funktion allein.
function lade(tree: Record<string, unknown>): { ed: Editor; roh: string } {
  const roh = JSON.stringify({ schemaVersion: 5, tree, selectedId: null })
  localStorage.setItem(KEY, roh)
  return { ed: new Editor(), roh }
}

// Ein gesperrter Stand ist an DREI Dingen gleichzeitig erkennbar: nicht
// hydriert, Riegel vorgelegt, Rohdaten Byte fuer Byte unberuehrt.
function erwarteGesperrt(ed: Editor, roh: string): void {
  expect(ed.blockCount).toBe(0)
  expect(speicherGate.gesperrt).toBe(true)
  expect(localStorage.getItem(KEY)).toBe(roh)
}

function gruende(): string[] {
  return (speicherGate.quarantaene?.probleme ?? []).map((p) => `${p.bereich}|${p.stelle}|${p.grund}`)
}

describe('Teilverlust im Blockbaum sperrt statt still zu schrumpfen', () => {
  it('eine WAISE (kein Weg von der Wurzel)', () => {
    const { ed, roh } = lade({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
      a: { id: 'a', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [] },
      waise: { id: 'waise', type: TEST_BLOCK, props: { text: 'echte Arbeit' }, parentId: 'nirgends', childIds: [] },
    })
    erwarteGesperrt(ed, roh)
    expect(gruende().some((g) => g.includes('fehlen Bausteine (1 von 2)'))).toBe(true)
  })

  it('eine kaputte AKTIONSKETTE reisst nicht mehr lautlos ab', () => {
    const { ed, roh } = lade({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
      a: {
        id: 'a', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [],
        // toolNr als Zahl -> der Schritt-Lader verwirft die GANZE Kette.
        events: { onClick: [{ id: 's1', type: 'START_TOOL', resultKey: '', toolNr: 7, toolParams: [] }] },
      },
    })
    erwarteGesperrt(ed, roh)
    expect(gruende().some((g) => g.includes('a|') && g.includes('stimmen Angaben nicht'))).toBe(true)
  })

  it('eine EIGENSCHAFT, die der Baustein nicht kennt', () => {
    const { ed, roh } = lade({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
      a: { id: 'a', type: TEST_BLOCK, props: { text: 'ok', gibtEsNicht: 'wichtig' }, parentId: 'root', childIds: [] },
    })
    erwarteGesperrt(ed, roh)
    expect(gruende().some((g) => g.includes('stimmen Angaben nicht'))).toBe(true)
  })

  it('derselbe Baustein unter ZWEI Eltern', () => {
    const { ed, roh } = lade({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['b1', 'b2'] },
      b1: { id: 'b1', type: TEST_BOX, props: {}, parentId: 'root', childIds: ['kind'] },
      b2: { id: 'b2', type: TEST_BOX, props: {}, parentId: 'root', childIds: ['kind'] },
      kind: { id: 'kind', type: TEST_BLOCK, props: {}, parentId: 'b1', childIds: [] },
    })
    erwarteGesperrt(ed, roh)
  })

  it('ein Verweis auf einen Baustein, den der Stand nicht enthaelt', () => {
    const { ed, roh } = lade({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'fehlt'] },
      a: { id: 'a', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [] },
    })
    erwarteGesperrt(ed, roh)
    expect(gruende().some((g) => g.includes('verweist auf einen anderen'))).toBe(true)
  })
})

// S2.1 (2026-08-11): der Zeilen-Waehler der Tabelle ist gestrichen. Ein Stand,
// in dem der Bediener einmal „25 pro Seite" gewaehlt hat, ist trotzdem gesund —
// er darf nicht in Quarantaene laufen, nur weil eine Etappe eine Eigenschaft
// abgeschafft hat. Genau dieser Fehler traf 2026-08-10 schon einmal jeden
// Altbestand mit Vorlagen-Kasten.
describe('Eine abgeschaffte Eigenschaft ist kein Teilverlust', () => {
  const tabellenStand = (props: Record<string, unknown>) => ({
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
    tab: { id: 'tab', type: 'tabelle', props, parentId: 'root', childIds: [] },
  })

  it('eine Tabelle mit dem alten Zeilen-Waehler laedt ohne Sperre', () => {
    const { ed } = lade(tabellenStand({ width: 'fill', proSeite: '25', zeilenWaehler: 'ja' }))
    expect(speicherGate.gesperrt).toBe(false)
    expect(ed.blockCount).toBe(1)
    // Und die Werte sind wirklich weg, nicht heimlich mitgeschleppt: sonst
    // stellte die Laufzeit eine Eigenschaft ein, die kein Baustein mehr liest.
    const props = ed.tree.tab.props
    expect(props).not.toHaveProperty('proSeite')
    expect(props).not.toHaveProperty('zeilenWaehler')
  })

  it('aber eine WIRKLICH unbekannte Eigenschaft an derselben Tabelle sperrt weiter', () => {
    // Die Ausnahme gilt fuer genau zwei Namen. Wuerde sie fuer die Tabelle
    // pauschal gelten, waere die Verlust-Kontrolle dort ausgeschaltet.
    const { ed, roh } = lade(tabellenStand({ width: 'fill', proSeite: '25', gibtEsNicht: 'wichtig' }))
    erwarteGesperrt(ed, roh)
    expect(gruende().some((g) => g.includes('tab|') && g.includes('stimmen Angaben nicht'))).toBe(true)
  })

  it('und an einem ANDEREN Baustein bleibt derselbe Name ein Verlust', () => {
    // Die Liste nennt Typ UND Namen. Ein `proSeite` an einem Testbaustein ist
    // eine Eigenschaft, die dort nie existiert hat — also echter Verlust.
    const { ed, roh } = lade({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
      a: { id: 'a', type: TEST_BLOCK, props: { proSeite: '25' }, parentId: 'root', childIds: [] },
    })
    erwarteGesperrt(ed, roh)
  })
})

// A4 Punkt 7-9: der Eltern-Kind-Vertrag der Registry. Solche Baeume entstehen
// nicht im Editor (addBlock fragt canContain), wohl aber in einer von Hand
// bearbeiteten Datei — und danach ist es ein Knoten, den der Editor nicht
// zeichnet, den der Export aber mit hinausschreibt.
describe('Unzulaessige Eltern-Kind-Vertraege werden nicht durchgeschleust', () => {
  it('eine Karte ausserhalb einer Kanban-Spalte', () => {
    const { ed, roh } = lade({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['k'] },
      k: { id: 'k', type: 'card', props: {}, parentId: 'root', childIds: [] },
    })
    erwarteGesperrt(ed, roh)
    expect(gruende().some((g) => g.includes('„card"') && g.includes('„root"'))).toBe(true)
  })

  it('eine SEITE (Popup), die nicht direkt unter der Wurzel liegt', () => {
    const { ed, roh } = lade({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['box'] },
      box: { id: 'box', type: TEST_BOX, props: {}, parentId: 'root', childIds: ['p'] },
      p: { id: 'p', type: 'popup', props: { name: 'Popup' }, parentId: 'box', childIds: [] },
    })
    erwarteGesperrt(ed, roh)
    expect(gruende().some((g) => g.includes('Seite liegt nicht direkt unter der Wurzel'))).toBe(true)
  })

  it('eine SEITE in einer anderen Seite', () => {
    const { ed, roh } = lade({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['p1'] },
      p1: { id: 'p1', type: 'popup', props: { name: 'Aussen' }, parentId: 'root', childIds: ['p2'] },
      p2: { id: 'p2', type: 'popup', props: { name: 'Innen' }, parentId: 'p1', childIds: [] },
    })
    erwarteGesperrt(ed, roh)
    expect(gruende().some((g) => g.includes('Seite liegt in einer anderen Seite'))).toBe(true)
  })

  it('Gegenprobe: der erlaubte Aufbau laedt normal', () => {
    const { ed } = lade({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board', 'p'] },
      board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['s1'] },
      s1: { id: 's1', type: 'kanban-spalte', props: {}, parentId: 'board', childIds: ['k'] },
      k: { id: 'k', type: 'card', props: { heading: 'Muster' }, parentId: 's1', childIds: [] },
      p: { id: 'p', type: 'popup', props: { name: 'Popup' }, parentId: 'root', childIds: [] },
    })
    expect(speicherGate.gesperrt).toBe(false)
    expect(ed.getNode('k')?.props.heading).toBe('Muster')
  })
})

// Die Gegenprobe zur Strenge: was eine Migration ABSICHTLICH wegnimmt, ist
// kein Verlust. Ohne diese Unterscheidung waere der Schutz schlimmer als der
// Fehler — jeder Bediener mit einem alten Vorlagen-Kasten im Speicher waere
// aus seinem eigenen Editor ausgesperrt.
describe('Absichtliche Migrations-Aenderungen sperren NICHT', () => {
  it('ein alter Vorlagen-Kasten wird entfernt und der Stand laedt', () => {
    const { ed } = lade({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
      board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['kasten', 's1'] },
      kasten: { id: 'kasten', type: 'kanban-vorlage', props: {}, parentId: 'board', childIds: ['muster'] },
      muster: { id: 'muster', type: 'card', props: { heading: 'Musterkarte' }, parentId: 'kasten', childIds: [] },
      s1: { id: 's1', type: 'kanban-spalte', props: {}, parentId: 'board', childIds: [] },
    })
    expect(speicherGate.gesperrt).toBe(false)
    expect(ed.getNode('kasten')).toBeUndefined()
    expect(ed.getNode('muster')?.props.heading).toBe('Musterkarte')
    expect(ed.getNode('s1')?.childIds).toEqual(['muster'])
  })
})

describe('Teilverlust in einer Bibliothek sperrt ebenso', () => {
  const GUTE_QUELLE = {
    id: 'q1', name: 'Terminplaner', kind: 'idb' as const, idbId: 'IDBID0001',
    fields: [{ code: '78_30', label: 'Tiername' }],
  }

  it('ein kaputter Eintrag unter guten: gesperrt, benannt, nichts geschrieben', () => {
    vi.useFakeTimers()
    try {
      const roh = JSON.stringify({ sources: [GUTE_QUELLE, { id: 'kaputt' }] })
      localStorage.setItem(QUELLEN_KEY, roh)

      const store = new DataSourceStore()

      expect(store.list).toHaveLength(1)          // bereinigt im Speicher …
      expect(speicherGate.gesperrt).toBe(true)    // … aber nicht schreibbar
      expect(gruende().some((g) => g.startsWith('Datenquellen|kaputt|'))).toBe(true)

      // Der Bediener arbeitet weiter — geschrieben wird trotzdem nichts.
      store.add({ ...GUTE_QUELLE, name: 'Zweite' })
      vi.advanceTimersByTime(600)
      expect(localStorage.getItem(QUELLEN_KEY)).toBe(roh)

      // Und die Rohdaten liegen zusaetzlich als Kopie.
      const kopien = quarantaeneKopien(QUELLEN_KEY)
      expect(kopien).toHaveLength(1)
      expect(localStorage.getItem(kopien[0])).toBe(roh)
    } finally {
      vi.useRealTimers()
    }
  })

  it('„verwerfen und leer beginnen" raeumt NUR die gesperrte Bibliothek', () => {
    // Die Maske ist in Ordnung — sie darf nicht mit weggeraeumt werden.
    const maskenStand = JSON.stringify({
      schemaVersion: 5,
      tree: { root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: [] } },
      selectedId: null,
    })
    localStorage.setItem(KEY, maskenStand)
    const rohQuellen = JSON.stringify({ sources: [{ id: 'kaputt' }] })
    localStorage.setItem(QUELLEN_KEY, rohQuellen)
    new DataSourceStore()
    const kopie = quarantaeneKopien(QUELLEN_KEY)[0]

    verwerfeGesperrteStaende()

    expect(localStorage.getItem(QUELLEN_KEY)).toBeNull()      // die gesperrte Bibliothek …
    expect(localStorage.getItem(KEY)).toBe(maskenStand)       // … die heile Maske NICHT
    expect(localStorage.getItem(kopie)).toBe(rohQuellen)      // Rohkopie bleibt
    expect(speicherGate.gesperrt).toBe(false)
  })

  it('eine heile Bibliothek sperrt nicht', () => {
    localStorage.setItem(QUELLEN_KEY, JSON.stringify({ sources: [GUTE_QUELLE] }))
    expect(new DataSourceStore().list).toHaveLength(1)
    expect(speicherGate.gesperrt).toBe(false)
  })
})
