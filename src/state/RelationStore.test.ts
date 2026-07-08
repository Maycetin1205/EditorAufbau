// RelationStore-Tests (Kap. 5.5)
// Der Store ist die gelebte Wahrheit der Relation-Vorlagen-Bibliothek: Seed
// beim allerersten Start (Standard-PUT), danach gehören die Vorlagen dem
// Bediener (auch eine leere Bibliothek überlebt den Reload). Persistenz-
// Muster wie DataSourceStore (localStorage + sanitize + entprelltes Speichern).
// LEITPLANKE: Tests niemals löschen/abschwächen, um "grün" zu werden.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BUILTIN_RELATION_TEMPLATES, type RelationTemplate } from '../core/data/relations'
import { RelationStore } from './RelationStore'

const KEY = 'aufbau_editor_relationen_v1'

const eigene: Omit<RelationTemplate, 'id'> = {
  name: 'Termin verschieben',
  verb: 'PUT_RELATION',
  nr: '1205',
  params: ['{FELD_POS}', '{FELD_LEN}', 'L', '{PINDEX}', '{RELID}', '{VALUE}'],
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

describe('RelationStore', () => {
  it('erster Start: mitgelieferter Startbestand (Standard-PUT) wird eingespielt', () => {
    const store = new RelationStore()
    expect(store.list).toEqual(BUILTIN_RELATION_TEMPLATES)
    expect(store.get('standard-put')?.nr).toBe('174')
    expect(store.get('gibt-es-nicht')).toBeUndefined()
  })

  it('anlegen: frische id, Eintrag persistiert und überlebt den Reload', () => {
    const store = new RelationStore()
    const angelegt = store.add(eigene)
    expect(angelegt.id).not.toBe('')
    expect(store.get(angelegt.id)?.name).toBe('Termin verschieben')
    flushSave()
    const neu = new RelationStore()
    expect(neu.get(angelegt.id)).toEqual(angelegt)
  })

  it('bearbeiten: id bleibt stabil (Konsumenten behalten ihre Vorlage)', () => {
    const store = new RelationStore()
    store.update('standard-put', { ...eigene, name: 'Umbenannt' })
    expect(store.get('standard-put')?.name).toBe('Umbenannt')
    expect(store.get('standard-put')?.nr).toBe('1205')
    store.update('gibt-es-nicht', eigene) // kein Effekt, kein Fehler
    flushSave()
    expect(new RelationStore().get('standard-put')?.name).toBe('Umbenannt')
  })

  it('löschen gilt auch für die mitgelieferte Vorlage — und wird nie ungefragt rückgängig gemacht', () => {
    const store = new RelationStore()
    store.remove('standard-put')
    expect(store.list).toEqual([])
    flushSave()
    // Reload: die leere Bibliothek bleibt leer (kein erneuter Seed).
    expect(new RelationStore().list).toEqual([])
  })

  it('kaputter Speicher wird nicht zum Datenverlust-Verstärker: Müll-JSON → Seed', () => {
    localStorage.setItem(KEY, '{{{kein json')
    expect(new RelationStore().list).toEqual(BUILTIN_RELATION_TEMPLATES)
  })

  it('benachrichtigt Abonnenten (version zählt hoch)', () => {
    const store = new RelationStore()
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
