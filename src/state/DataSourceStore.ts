// DataSourceStore
// Datenquellen-Vorlagen sind BENUTZERDEFINIERT — Felder sind je
// SoftEngine-Installation individuell. Dieser Store ist die gelebte Wahrheit
// der Vorlagen-Bibliothek: persistiert in localStorage NEBEN den Bäumen
// (Muster: Editor.ts — Subject + sanitize beim Laden + entprelltes Speichern).
// Beim allerersten Start wird der mitgelieferte Startbestand
// (BUILTIN_DATA_SOURCES) eingespielt; danach gehören die Vorlagen dem
// Bediener (auch Löschen der mitgelieferten überlebt den Reload — es wird
// nie ungefragt neu eingespielt).
//
// Bewusst KEIN Undo/Redo: die Bibliothek ist kein Canvas-Gestenraum; vor
// destruktiven Aktionen fragt die UI nach (wie das Kreuzchen).

import {
  BUILTIN_DATA_SOURCES,
  sanitizeDataSources,
  type DataSource,
} from '../core/data/dataSources'
import { deepClone } from '../lib/deepClone'
import { Subject } from './Subject'

const STORAGE_KEY = 'aufbau_editor_datenquellen_v1'
const SAVE_DEBOUNCE_MS = 500

// null = noch nie gespeichert (→ Seed); sonst die sanitierte Liste
// (auch wenn leer — der Bediener hat dann alles gelöscht).
function loadFromStorage(): DataSource[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { sources?: unknown }
    return sanitizeDataSources(parsed.sources)
  } catch {
    return null
  }
}

export class DataSourceStore extends Subject<DataSourceStore> {
  private _sources: DataSource[]
  private _version = 0
  private _saveTimer: ReturnType<typeof setTimeout> | null = null
  private _hydrated = false

  constructor() {
    super()
    this._sources = loadFromStorage() ?? deepClone(BUILTIN_DATA_SOURCES) as DataSource[]
    this._hydrated = true
  }

  get list(): readonly DataSource[] { return this._sources }
  get version(): number { return this._version }

  get(id: string): DataSource | undefined {
    return this._sources.find((s) => s.id === id)
  }

  override notify(data: DataSourceStore): void {
    this._version++
    super.notify(data)
    if (this._hydrated) this.scheduleSave()
  }

  // Neue Vorlage mit frischem, stabilem Technikwert (Blöcke referenzieren
  // die id in ihrer source-Prop — sie ändert sich nie wieder).
  add(data: Omit<DataSource, 'id'>): DataSource {
    const source: DataSource = { ...deepClone(data), id: crypto.randomUUID() }
    this._sources = [...this._sources, source]
    this.notify(this)
    return source
  }

  // Bearbeiten ersetzt alles AUSSER der id (angehängte Blöcke behalten
  // ihre Quelle). Unbekannte id = kein Effekt.
  update(id: string, data: Omit<DataSource, 'id'>): void {
    const at = this._sources.findIndex((s) => s.id === id)
    if (at < 0) return
    const next = [...this._sources]
    next[at] = { ...deepClone(data), id }
    this._sources = next
    this.notify(this)
  }

  remove(id: string): void {
    const next = this._sources.filter((s) => s.id !== id)
    if (next.length === this._sources.length) return
    this._sources = next
    this.notify(this)
  }

  private scheduleSave(): void {
    if (this._saveTimer) clearTimeout(this._saveTimer)
    this._saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ sources: this._sources }))
      } catch (err) {
        console.warn('DataSourceStore: localStorage-Speichern fehlgeschlagen', err)
      }
    }, SAVE_DEBOUNCE_MS)
  }
}

export const dataSourceStore = new DataSourceStore()
