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

let abmelden: (() => void) | null = null
function captureMeldungen(): string[] {
  const msgs: string[] = []
  meldungen.leere()
  abmelden = meldungen.subscribe(() => {
    msgs.length = 0
    for (const m of meldungen.liste) msgs.push(m.text)
  })
  return msgs
}

function meldungenAufraeumen(): void {
  abmelden?.()
  abmelden = null
  meldungen.leere()
}

const echtesSetItem = localStorage.setItem.bind(localStorage)

function setItemFaellt(fuerKeys: (key: string) => boolean): void {
  localStorage.setItem = ((key: string, value: string) => {
    if (fuerKeys(key)) throw new Error('QuotaExceededError')
    echtesSetItem(key, value)
  }) as typeof localStorage.setItem
}

describe('Speicher-Panne meldet sich (B3, 2026-07-28)', () => {
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
    expect(msgs).toHaveLength(1)

    localStorage.setItem = echtesSetItem
    persistState(createEmptyTree(), null)

    setItemFaellt((k) => k === KEY)
    persistState(createEmptyTree(), null)
    expect(msgs).toHaveLength(2)
    expect(msgs[1]).toContain('Maske')
  })

  it('der Erfolg eines FREMDEN Speicherwegs entschaerft den Merker nicht', () => {
    const msgs = captureMeldungen()
    setItemFaellt((k) => k === KEY)
    persistState(createEmptyTree(), null)
    expect(msgs).toHaveLength(1)

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

describe('Ein werfender Horcher reisst Meldung und Autosave nicht mit (A7.1)', () => {
  beforeEach(() => {
    localStorage.clear()
    merkeSpeicherErfolg(KEY)

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

    const node = ed.addBlock(TEST_BLOCK, ed.rootId)

    expect(node).not.toBeNull()
    expect(gesehen).toEqual(['davor', 'danach'])

    expect(konsole).toHaveBeenCalled()
    konsole.mockRestore()

    vi.advanceTimersByTime(600)
    const roh = localStorage.getItem(KEY)
    expect(roh, 'die Aenderung wurde nie geschrieben').not.toBeNull()
    expect(roh).toContain(node!.id)
  })
})

describe('Vorlagen-Bibliotheken auf gemeinsamem Fundament (2026-08-04)', () => {
  beforeEach(() => {
    localStorage.clear()
    merkeSpeicherErfolg(QUELLEN_KEY)
    merkeSpeicherErfolg(RELATIONEN_KEY)

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

    expect(new DataSourceStore().list).toEqual([angelegt])
  })

  it('frischer Browser: Datenquellen leer, Relationen mit dem Standard-PUT', () => {
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

    expect(msgs).toHaveLength(2)
    expect(msgs[0]).toContain('Datenquellen')
    expect(msgs[1]).toContain('Relationen')
  })
})

