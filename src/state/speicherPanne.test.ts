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
import { meldungen } from './meldungen'
import { backupKeyFor, merkeSpeicherErfolg } from './notfallkopie'
import { persistState } from './persistence'
import { RelationStore } from './RelationStore'
import { createEmptyTree } from './treeOps'
import { registerTestBlocks, TEST_BLOCK } from '../test/testBlocks'

registerTestBlocks()

const KEY = 'aufbau_editor_mvp_v1'
const QUELLEN_KEY = 'aufbau_editor_datenquellen_v1'
const RELATIONEN_KEY = 'aufbau_editor_relationen_v1'

// Bis U2 (2026-08-12) meldete der Schreib-Weg per `window.alert` und wurde hier
// gestubbt; jetzt meldet er in die Meldungsspur des Editors
// (state/meldungen.ts). Die ist ein Modul-Singleton und überlebt den einzelnen
// Test — darum das Leeren/Abmelden in den Hooks unten.
let abmelden: (() => void) | null = null
function captureMeldungen(): string[] {
  const msgs: string[] = []
  meldungen.leere() // jeder Fall faengt bei null an
  abmelden = meldungen.subscribe(() => {
    msgs.length = 0
    for (const m of meldungen.liste) msgs.push(m.text)
  })
  return msgs
}

// Beide Beschreibungsblöcke unten räumen gleich auf.
function meldungenAufraeumen(): void {
  abmelden?.()
  abmelden = null
  meldungen.leere()
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
  beforeEach(() => { localStorage.clear(); merkeSpeicherErfolg(KEY) })
  afterEach(() => {
    localStorage.setItem = echtesSetItem
    meldungenAufraeumen()
  })

  it('Fehler -> Fehler -> Erfolg -> Fehler ergibt GENAU ZWEI Meldungen', () => {
    const msgs = captureMeldungen()
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
    const msgs = captureMeldungen()
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
    captureMeldungen()
    setItemFaellt(() => true)
    const ed = new Editor()
    const node = ed.addBlock(TEST_BLOCK, ed.rootId)
    expect(node).not.toBeNull()
    expect(ed.getNode(node!.id)).toBeDefined()
  })
})

// A7.1 (2026-08-11): derselbe Schreibweg, andere Ursache. Bis hierher konnte
// ein einzelner werfender Horcher (eine Anzeige, die sich verrechnet) den
// GANZEN Melde-Durchlauf abbrechen — und weil Editor.notify den Autosave NACH
// dem Melden einplant, wurde die Aenderung nie geschrieben. Der Bediener sah
// sie auf dem Schirm und verlor sie beim Schliessen: genau der stille Verlust,
// den dieser Weg verhindern soll.
describe('Ein werfender Horcher reisst Meldung und Autosave nicht mit (A7.1)', () => {
  beforeEach(() => {
    localStorage.clear()
    merkeSpeicherErfolg(KEY)
    // Gespeichert wird entprellt (500 ms) — ohne Zeitsteuerung sieht der Test
    // den Schreibvorgang nie.
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.setItem = echtesSetItem
    meldungenAufraeumen()
  })

  it('die spaeteren Horcher laufen weiter, der Stand wird geschrieben', () => {
    const ed = new Editor()
    const gesehen: string[] = []
    ed.subscribe(() => { gesehen.push('davor') })
    ed.subscribe(() => { throw new Error('Anzeige verrechnet sich') })
    ed.subscribe(() => { gesehen.push('danach') })
    const konsole = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Ohne die Isolierung flog der Wurf bis HIER heraus.
    const node = ed.addBlock(TEST_BLOCK, ed.rootId)

    expect(node).not.toBeNull()
    expect(gesehen).toEqual(['davor', 'danach'])
    // Sichtbar bleiben muss er trotzdem — verschluckt wird nichts.
    expect(konsole).toHaveBeenCalled()
    konsole.mockRestore()

    vi.advanceTimersByTime(600)
    const roh = localStorage.getItem(KEY)
    expect(roh, 'die Aenderung wurde nie geschrieben').not.toBeNull()
    expect(roh).toContain(node!.id)
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
    merkeSpeicherErfolg(QUELLEN_KEY)
    merkeSpeicherErfolg(RELATIONEN_KEY)
    // Gespeichert wird entprellt (500 ms) — ohne Zeitsteuerung sieht der Test
    // den Schreibvorgang nie.
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.setItem = echtesSetItem
    meldungenAufraeumen()
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
    const msgs = captureMeldungen()
    localStorage.setItem(QUELLEN_KEY, '{ das ist kein JSON')

    const store = new DataSourceStore()

    expect(store.list).toEqual([])
    expect(localStorage.getItem(backupKeyFor(QUELLEN_KEY))).toBe('{ das ist kein JSON')
    expect(msgs).toHaveLength(1)
    expect(msgs[0]).toContain('Datenquellen')
  })

  it('gueltiges JSON ohne Liste zaehlt ebenfalls als beschaedigt', () => {
    const msgs = captureMeldungen()
    localStorage.setItem(RELATIONEN_KEY, '{"relations":"keine Liste"}')

    // Beschaedigt -> Startbestand, aber MIT Meldung und gesicherter Kopie.
    expect(new RelationStore().list).toHaveLength(1)
    expect(localStorage.getItem(backupKeyFor(RELATIONEN_KEY))).toBe('{"relations":"keine Liste"}')
    expect(msgs).toHaveLength(1)
    expect(msgs[0]).toContain('Relations-Vorlagen')
  })

  it('jede Bibliothek meldet ihren eigenen Klarnamen, wenn Speichern scheitert', () => {
    const msgs = captureMeldungen()
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

