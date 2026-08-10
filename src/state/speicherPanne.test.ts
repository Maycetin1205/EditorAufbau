// Speicher-Panne — Tests zum SCHREIB-Weg (Befund B3, 2026-07-28)
//
// Bis 2026-07-28 schrieben alle vier Speicherwege (Maske + die drei
// Bibliotheken) bei einem Fehler nur ein console.warn. Der Bediener sah
// nichts und verlor beim Schliessen seine Arbeit — Widerspruch zur eigenen
// Zusage „Verluste passieren nie still".
//
// Eigene Datei, weil persistence.test.ts sonst ueber den 500-Zeilen-Deckel
// waechst (check:regeln) — und weil das hier eine eigene Aussage ist: der
// LESE-Weg wohnt drueben, der SCHREIB-Weg hier.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DataSourceStore } from './DataSourceStore'
import { Editor } from './Editor'
import { backupKeyFor, merkeSpeicherErfolg } from './notfallkopie'
import { persistState } from './persistence'
import { RelationStore } from './RelationStore'
import { speicherGate } from './speicherGate'
import { createEmptyTree } from './treeOps'
import { registerTestBlocks, TEST_BLOCK } from '../test/testBlocks'

registerTestBlocks()

const KEY = 'aufbau_editor_mvp_v1'
const QUELLEN_KEY = 'aufbau_editor_datenquellen_v1'
const RELATIONEN_KEY = 'aufbau_editor_relationen_v1'

function captureAlerts(): string[] {
  const msgs: string[] = []
  ;(globalThis as Record<string, unknown>).alert = (m: string) => { msgs.push(m) }
  return msgs
}

// Modulweit, weil beide Beschreibungsbloecke unten denselben Griff brauchen:
// der ECHTE Schreibweg, damit ein Test ihn gezielt scheitern lassen kann.
const echtesSetItem = localStorage.setItem.bind(localStorage)

function setItemFaellt(fuerKeys: (key: string) => boolean): void {
  localStorage.setItem = ((key: string, value: string) => {
    if (fuerKeys(key)) throw new Error('QuotaExceededError')
    echtesSetItem(key, value)
  }) as typeof localStorage.setItem
}

describe('Speicher-Panne meldet sich (B3, 2026-07-28)', () => {
  // Bis 2026-07-28 schrieben alle vier Speicherwege bei einem Fehler nur ein
  // console.warn — der Bediener sah nichts und verlor beim Schliessen seine
  // Arbeit. Jetzt gibt es Klartext, aber nur EINMAL je zusammenhaengender
  // Stoerung (sonst Meldungs-Gewitter durch den Autosave).

  // Der Merker lebt im Modul und ueberlebt damit den einzelnen Test — in der
  // App ist das richtig (er soll die ganze Sitzung halten), hier muss jeder
  // Fall bei null anfangen.
  beforeEach(() => { localStorage.clear(); speicherGate.entsperre(); merkeSpeicherErfolg(KEY) })
  afterEach(() => {
    localStorage.setItem = echtesSetItem
    delete (globalThis as Record<string, unknown>).alert
  })

  it('Fehler -> Fehler -> Erfolg -> Fehler ergibt GENAU ZWEI Meldungen', () => {
    const msgs = captureAlerts()
    setItemFaellt((k) => k === KEY)
    persistState(createEmptyTree(), null)
    persistState(createEmptyTree(), null)
    expect(msgs).toHaveLength(1) // zweiter Versuch schweigt: dieselbe Stoerung

    localStorage.setItem = echtesSetItem
    persistState(createEmptyTree(), null) // Speicher geht wieder

    setItemFaellt((k) => k === KEY)
    persistState(createEmptyTree(), null) // NEUE Stoerung -> meldet erneut
    expect(msgs).toHaveLength(2)
    expect(msgs[1]).toContain('Maske')
  })

  it('der Erfolg eines FREMDEN Speicherwegs entschaerft den Merker nicht', () => {
    const msgs = captureAlerts()
    setItemFaellt((k) => k === KEY)
    persistState(createEmptyTree(), null)
    expect(msgs).toHaveLength(1)

    // Eine andere Bibliothek speichert erfolgreich — das ist eine ANDERE
    // Stoerungslage und darf die Masken-Meldung nicht zuruecksetzen.
    merkeSpeicherErfolg('irgendeine_andere_bibliothek')

    persistState(createEmptyTree(), null)
    expect(msgs).toHaveLength(1)
  })

  it('der Editor laeuft trotz Speicher-Panne normal weiter', () => {
    captureAlerts()
    setItemFaellt(() => true)
    const ed = new Editor()
    const node = ed.addBlock(TEST_BLOCK, ed.rootId)
    expect(node).not.toBeNull()
    expect(ed.getNode(node!.id)).toBeDefined()
  })
})

// Die beiden Bibliotheken (Datenquellen, Relations-Vorlagen) teilen seit
// 2026-08-04 EIN Fundament: VorlagenStore.ts. Diese Faelle halten fest, was
// dabei nicht verrutschen durfte — Speicher-Schluessel, JSON-Huelle,
// Startbestand und die Notfallkopie. Verrutscht einer davon, startet die
// Bibliothek des Bedieners beim naechsten Oeffnen wortlos leer; das ist genau
// der Verlust, den die Regel „nichts scheitert still" verbietet.
describe('Vorlagen-Bibliotheken auf gemeinsamem Fundament (2026-08-04)', () => {
  beforeEach(() => {
    localStorage.clear()
    // Der Riegel (A3) lebt im Modul und ueberlebt den einzelnen Test.
    speicherGate.entsperre()
    merkeSpeicherErfolg(QUELLEN_KEY)
    merkeSpeicherErfolg(RELATIONEN_KEY)
    // Gespeichert wird entprellt (500 ms) — ohne Zeitsteuerung sieht der Test
    // den Schreibvorgang nie.
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.setItem = echtesSetItem
    delete (globalThis as Record<string, unknown>).alert
  })

  const speichernAbwarten = () => { vi.advanceTimersByTime(600) }

  const EINE_QUELLE = {
    name: 'Terminplaner',
    kind: 'idb' as const,
    idbId: 'IDBID0001',
    fields: [{ code: '78_30', label: 'Tiername' }],
  }
  const EINE_RELATION = {
    name: 'Test-Schreiben',
    verb: 'PUT_RELATION' as const,
    nr: '174',
    params: ['0', '10', 'L', '{PINDEX}', '{RELID}', '{VALUE}'],
  }

  it('Datenquellen speichern unter ihrem Schluessel in der Huelle "sources"', () => {
    const store = new DataSourceStore()
    store.add(EINE_QUELLE)
    speichernAbwarten()

    const roh = localStorage.getItem(QUELLEN_KEY)
    expect(roh, 'nichts unter dem Datenquellen-Schluessel gespeichert').not.toBeNull()
    const gelesen = JSON.parse(roh!) as Record<string, unknown>
    // GENAU dieser eine Huellen-Schluessel — ein zweiter oder ein anderer Name
    // waere eine Form, die der bestehende Lese-Weg nicht mehr erkennt.
    expect(Object.keys(gelesen)).toEqual(['sources'])
    expect(gelesen.sources).toEqual(store.list)
  })

  it('Relations-Vorlagen speichern unter ihrem Schluessel in der Huelle "relations"', () => {
    const store = new RelationStore()
    store.add(EINE_RELATION)
    speichernAbwarten()

    const roh = localStorage.getItem(RELATIONEN_KEY)
    expect(roh, 'nichts unter dem Relationen-Schluessel gespeichert').not.toBeNull()
    const gelesen = JSON.parse(roh!) as Record<string, unknown>
    expect(Object.keys(gelesen)).toEqual(['relations'])
    expect(gelesen.relations).toEqual(store.list)
  })

  it('ein gespeicherter Stand wird unveraendert wieder gelesen', () => {
    const erste = new DataSourceStore()
    const angelegt = erste.add(EINE_QUELLE)
    speichernAbwarten()

    // Zweiter Store = das naechste Oeffnen des Editors.
    expect(new DataSourceStore().list).toEqual([angelegt])
  })

  it('frischer Browser: Datenquellen leer, Relationen mit dem Standard-PUT', () => {
    // Nutzer-Entscheidung 2026-07-30: der Datenquellen-Startbestand ist
    // restlos entfernt. Die Relationen behalten ihren einen mitgelieferten.
    expect(new DataSourceStore().list).toEqual([])
    const relationen = new RelationStore()
    expect(relationen.list).toHaveLength(1)
    expect(relationen.list[0].verb).toBe('PUT_RELATION')
  })

  it('beschaedigter Stand wird gesichert und gemeldet, nicht still ersetzt', () => {
    const msgs = captureAlerts()
    localStorage.setItem(QUELLEN_KEY, '{ das ist kein JSON')

    const store = new DataSourceStore()

    expect(store.list).toEqual([])
    expect(localStorage.getItem(backupKeyFor(QUELLEN_KEY))).toBe('{ das ist kein JSON')
    expect(msgs).toHaveLength(1)
    expect(msgs[0]).toContain('Datenquellen')
  })

  it('gueltiges JSON ohne Liste zaehlt ebenfalls als beschaedigt', () => {
    const msgs = captureAlerts()
    localStorage.setItem(RELATIONEN_KEY, '{"relations":"keine Liste"}')

    // Beschaedigt -> Startbestand, aber MIT Meldung und gesicherter Kopie.
    expect(new RelationStore().list).toHaveLength(1)
    expect(localStorage.getItem(backupKeyFor(RELATIONEN_KEY))).toBe('{"relations":"keine Liste"}')
    expect(msgs).toHaveLength(1)
    expect(msgs[0]).toContain('Relations-Vorlagen')
  })

  // A3 (2026-08-10): der Riegel muss ALLE Schreibwege halten, nicht nur den
  // Baum. Waere der Baum gesperrt und die Bibliotheken nicht, haette eine
  // alte App die Datenquellen und Relationen eines neueren Standes
  // ausgeduennt festgeschrieben — derselbe Verlust, nur eine Tuer weiter.
  it('steht ein Stand unter Quarantaene, schreibt auch keine Bibliothek', () => {
    const quellen = new DataSourceStore()
    const relationen = new RelationStore()
    speicherGate.sperre({
      grund: 'Test', probleme: [], kopieSchluessel: null, rohdaten: '{}',
    })
    try {
      quellen.add(EINE_QUELLE)
      relationen.add(EINE_RELATION)
      speichernAbwarten()
      expect(localStorage.getItem(QUELLEN_KEY)).toBeNull()
      expect(localStorage.getItem(RELATIONEN_KEY)).toBeNull()

      // Nach dem Entsperren (gueltige Maske geoeffnet bzw. bestaetigtes
      // Leeren) laeuft das Speichern wieder — der Riegel ist keine Einbahn.
      // Die naechste Aenderung tragt den GANZEN Stand hinaus, nicht nur sich
      // selbst: geschrieben wird immer die komplette Liste.
      speicherGate.entsperre()
      quellen.add({ ...EINE_QUELLE, name: 'Zweite' })
      speichernAbwarten()
      expect(localStorage.getItem(QUELLEN_KEY)).not.toBeNull()
      expect(quellen.list).toHaveLength(2)
    } finally {
      speicherGate.entsperre()
    }
  })

  it('jede Bibliothek meldet ihren eigenen Klarnamen, wenn Speichern scheitert', () => {
    const msgs = captureAlerts()
    setItemFaellt((k) => k === QUELLEN_KEY || k === RELATIONEN_KEY)

    const quellen = new DataSourceStore()
    quellen.add(EINE_QUELLE)
    speichernAbwarten()

    const relationen = new RelationStore()
    relationen.add(EINE_RELATION)
    speichernAbwarten()

    // Zwei unabhaengige Speicherwege, zwei Meldungen — und jede benennt, WAS
    // gefaehrdet ist (der Schreib-Klarname der Relationen lautet bewusst
    // „Relationen", nicht „Relations-Vorlagen").
    expect(msgs).toHaveLength(2)
    expect(msgs[0]).toContain('Datenquellen')
    expect(msgs[1]).toContain('Relationen')
  })
})

