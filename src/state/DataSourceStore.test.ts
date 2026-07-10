// DataSourceStore-Tests (Kap. 5.4)
// Der Store ist die gelebte Wahrheit der Vorlagen-Bibliothek: Seed beim
// allerersten Start, danach gehören die Vorlagen dem Bediener (auch eine
// leere Bibliothek überlebt den Reload). Persistenz-Muster wie Editor.ts
// (localStorage + sanitize + entprelltes Speichern).
// LEITPLANKE: Tests niemals löschen/abschwächen, um "grün" zu werden.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BUILTIN_DATA_SOURCES, type DataSource } from '../core/data/dataSources'
import { DataSourceStore } from './DataSourceStore'

const KEY = 'aufbau_editor_datenquellen_v1'

const eigene: Omit<DataSource, 'id'> = {
  name: 'Eigene Tabelle',
  kind: 'idb',
  idbId: 'IDBID0007',
  indexField: '0_10',
  fields: [{ code: '10_8', label: 'Nummer' }],
}

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// Entprelltes Speichern abwarten (SAVE_DEBOUNCE_MS = 500).
function flushSave() {
  vi.advanceTimersByTime(600)
}

describe('DataSourceStore', () => {
  it('erster Start: mitgelieferter Startbestand wird eingespielt', () => {
    const store = new DataSourceStore()
    expect(store.list).toEqual(BUILTIN_DATA_SOURCES)
    expect(store.get('terminplaner')?.name).toBe('Terminplaner')
    expect(store.get('gibt-es-nicht')).toBeUndefined()
  })

  it('anlegen: frische id, Eintrag persistiert und überlebt den Reload', () => {
    const store = new DataSourceStore()
    const angelegt = store.add(eigene)
    expect(angelegt.id).not.toBe('')
    expect(store.get(angelegt.id)?.name).toBe('Eigene Tabelle')
    flushSave()
    const neu = new DataSourceStore()
    expect(neu.get(angelegt.id)).toEqual(angelegt)
  })

  it('bearbeiten: id bleibt stabil (angehängte Blöcke behalten ihre Quelle)', () => {
    const store = new DataSourceStore()
    store.update('terminplaner', { ...eigene, name: 'Umbenannt' })
    expect(store.get('terminplaner')?.name).toBe('Umbenannt')
    expect(store.get('terminplaner')?.idbId).toBe('IDBID0007')
    store.update('gibt-es-nicht', eigene) // kein Effekt, kein Fehler
    flushSave()
    expect(new DataSourceStore().get('terminplaner')?.name).toBe('Umbenannt')
  })

  it('löschen gilt auch für mitgelieferte Vorlagen — und wird nie ungefragt rückgängig gemacht', () => {
    const store = new DataSourceStore()
    store.remove('terminplaner')
    store.remove('kundenhaustiere')
    expect(store.list).toEqual([])
    flushSave()
    // Reload: die leere Bibliothek bleibt leer (kein erneuter Seed).
    expect(new DataSourceStore().list).toEqual([])
  })

  it('kaputter Speicher wird nicht zum Datenverlust-Verstärker: Müll-JSON → Seed', () => {
    localStorage.setItem(KEY, '{{{kein json')
    expect(new DataSourceStore().list).toEqual(BUILTIN_DATA_SOURCES)
  })

  it('benachrichtigt Abonnenten (version zählt hoch)', () => {
    const store = new DataSourceStore()
    let calls = 0
    store.subscribe(() => { calls++ })
    const v = store.version
    const { id } = store.add(eigene)
    store.update(id, eigene)
    store.remove(id)
    expect(calls).toBe(3)
    expect(store.version).toBe(v + 3)
  })
})
