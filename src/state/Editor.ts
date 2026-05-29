// Editor
// Kleiner zentraler Store fuer den MVP-Editor.
// Speichert nur serialisierbare BlockData und benachrichtigt React per Subject.

import type {
  BlockData,
  BlockLayout,
} from '../core/blocks/BlockData'
import { createBlockData } from '../core/blocks/blockFactory'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { Subject } from './Subject'
import { deepClone } from '../lib/deepClone'

const STORAGE_KEY = 'aufbau_editor_mvp_v1'
const HISTORY_LIMIT = 50
const SAVE_DEBOUNCE_MS = 500

interface PersistedState {
  blocks: BlockData[]
  selectedId: string | null
}

interface EditorSnapshot {
  blocks: BlockData[]
  selectedId: string | null
}

function normalizeProps(type: string, rawProps: Record<string, unknown>): Record<string, unknown> {
  const def = getBlockDefinition(type)
  if (!def) return {}

  const next = deepClone(def.defaultProps)
  for (const property of def.customProperties) {
    if (Object.prototype.hasOwnProperty.call(rawProps, property.attributeName)) {
      next[property.attributeName] = rawProps[property.attributeName]
    }
  }
  return next
}

function migrateBlock(raw: unknown): BlockData | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Partial<BlockData> & Record<string, unknown>
  if (typeof b.id !== 'string' || typeof b.type !== 'string' || !b.layout) return null
  if (!getBlockDefinition(b.type)) return null

  return {
    id: b.id,
    type: b.type,
    layout: b.layout as BlockLayout,
    props: normalizeProps(
      b.type,
      (b.props && typeof b.props === 'object' ? b.props : {}) as Record<string, unknown>,
    ),
  }
}

function loadFromStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    const rawBlocks = Array.isArray(parsed.blocks) ? parsed.blocks : []
    const blocks: BlockData[] = []
    for (const b of rawBlocks) {
      const migrated = migrateBlock(b)
      if (migrated) blocks.push(migrated)
    }
    const selectedId =
      typeof parsed.selectedId === 'string' && blocks.some((b) => b.id === parsed.selectedId)
        ? parsed.selectedId
        : null
    return { blocks, selectedId }
  } catch {
    return null
  }
}

export class Editor extends Subject<Editor> {
  private _blocks: BlockData[] = []
  private _selectedId: string | null = null
  private _version: number = 0
  private _history: EditorSnapshot[] = []
  private _future: EditorSnapshot[] = []
  private _saveTimer: ReturnType<typeof setTimeout> | null = null
  private _hydrated = false
  // Tiefe einer laufenden Interaktion (Ziehen/Resizen). > 0 = History-Snapshots
  // werden unterdrueckt, damit eine durchgehende Geste EIN Undo-Schritt bleibt.
  private _txDepth = 0

  constructor() {
    super()
    const persisted = loadFromStorage()
    if (persisted) {
      this._blocks = persisted.blocks
      this._selectedId = persisted.selectedId
    }
    this._hydrated = true
  }

  get blocks(): readonly BlockData[] { return this._blocks }
  get selectedId(): string | null { return this._selectedId }
  get selectedBlock(): BlockData | null {
    if (this._selectedId === null) return null
    return this._blocks.find((b) => b.id === this._selectedId) ?? null
  }
  get version(): number { return this._version }
  get canUndo(): boolean { return this._history.length > 0 }
  get canRedo(): boolean { return this._future.length > 0 }

  override notify(data: Editor): void {
    this._version++
    super.notify(data)
    if (this._hydrated) this.scheduleSave()
  }

  private snapshot(): EditorSnapshot {
    return { blocks: deepClone(this._blocks), selectedId: this._selectedId }
  }

  private pushHistory(): void {
    this._history.push(this.snapshot())
    if (this._history.length > HISTORY_LIMIT) this._history.shift()
    this._future = []
  }

  // Macht nur dann einen History-Snapshot, wenn gerade keine Interaktion laeuft.
  private recordHistory(): void {
    if (this._txDepth === 0) this.pushHistory()
  }

  // Klammert eine durchgehende Geste (z.B. Ziehen): genau EIN Snapshot am Anfang,
  // alle Aenderungen dazwischen ohne weitere Snapshots, endTransaction schliesst ab.
  beginTransaction(): void {
    if (this._txDepth === 0) this.pushHistory()
    this._txDepth++
  }

  endTransaction(): void {
    if (this._txDepth > 0) this._txDepth--
  }

  undo(): void {
    const prev = this._history.pop()
    if (!prev) return
    this._future.push(this.snapshot())
    this._blocks = prev.blocks
    this._selectedId = prev.selectedId
    this.notify(this)
  }

  redo(): void {
    const next = this._future.pop()
    if (!next) return
    this._history.push(this.snapshot())
    this._blocks = next.blocks
    this._selectedId = next.selectedId
    this.notify(this)
  }

  addBlock(type: string): BlockData {
    this.pushHistory()
    const data = createBlockData(type)
    const STEP = 28
    const slot = this._blocks.length % 10
    data.layout = { ...data.layout, x: 32 + slot * STEP, y: 32 + slot * STEP }
    this._blocks = [...this._blocks, data]
    this._selectedId = data.id
    this.notify(this)
    return data
  }

  removeBlock(id: string): void {
    this.pushHistory()
    this._blocks = this._blocks.filter((b) => b.id !== id)
    if (this._selectedId === id) this._selectedId = null
    this.notify(this)
  }

  selectBlock(id: string | null): void {
    if (this._selectedId === id) return
    this._selectedId = id
    this.notify(this)
  }

  updateProperty(id: string, attr: string, value: unknown): void {
    this.pushHistory()
    this._blocks = this._blocks.map((b) =>
      b.id === id ? { ...b, props: { ...b.props, [attr]: value } } : b,
    )
    this.notify(this)
  }

  updateLayout(id: string, patch: Partial<BlockLayout>): void {
    this.recordHistory()
    this._blocks = this._blocks.map((b) =>
      b.id === id ? { ...b, layout: { ...b.layout, ...patch } } : b,
    )
    this.notify(this)
  }

  duplicateBlock(id: string): BlockData | null {
    const original = this._blocks.find((b) => b.id === id)
    if (!original) return null
    this.pushHistory()
    const copy: BlockData = {
      ...deepClone(original),
      id: crypto.randomUUID(),
      layout: {
        ...original.layout,
        x: original.layout.x + 28,
        y: original.layout.y + 28,
      },
    }
    this._blocks = [...this._blocks, copy]
    this._selectedId = copy.id
    this.notify(this)
    return copy
  }

  clear(): void {
    if (this._blocks.length === 0) return
    this.pushHistory()
    this._blocks = []
    this._selectedId = null
    this.notify(this)
  }

  private scheduleSave(): void {
    if (this._saveTimer) clearTimeout(this._saveTimer)
    this._saveTimer = setTimeout(() => {
      try {
        const state: PersistedState = { blocks: this._blocks, selectedId: this._selectedId }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (err) {
        console.warn('Editor: localStorage-Speichern fehlgeschlagen', err)
      }
    }, SAVE_DEBOUNCE_MS)
  }
}

export const editor = new Editor()
