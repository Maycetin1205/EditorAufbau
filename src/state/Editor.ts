// Editor
// Singleton-Klasse mit Editor-State. Speichert ausschliesslich serialisierbare BlockData.
// Erbt von Subject (Observer-Pattern). React-Bruecke via useSyncExternalStore (siehe useEditor.ts).
// Features: Undo/Redo (Snapshot-Stack), Duplicate, Clipboard, localStorage-Persistenz.

import type { BlockData, BlockLayout } from '../core/blocks/BlockData'
import { createBlockData } from '../core/blocks/blockFactory'
import { Subject } from './Subject'

const STORAGE_KEY = 'aufbau_editor_v1'
const HISTORY_LIMIT = 80
const SAVE_DEBOUNCE_MS = 500

interface PersistedState {
  blocks: BlockData[]
  selectedId: string | null
}

interface EditorSnapshot {
  blocks: BlockData[]
  selectedId: string | null
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function loadFromStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      blocks: Array.isArray(parsed.blocks) ? parsed.blocks : [],
      selectedId: typeof parsed.selectedId === 'string' ? parsed.selectedId : null,
    }
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
  private _clipboard: BlockData | null = null
  private _saveTimer: ReturnType<typeof setTimeout> | null = null
  private _hydrated = false

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
  get hasClipboard(): boolean { return this._clipboard !== null }

  override notify(data: Editor): void {
    this._version++
    super.notify(data)
    if (this._hydrated) this.scheduleSave()
  }

  // --- History ---

  private snapshot(): EditorSnapshot {
    return { blocks: deepClone(this._blocks), selectedId: this._selectedId }
  }

  // Vor jeder mutierenden Aktion aufrufen. Schiebt Snapshot ins history-Stack,
  // setzt redo-Stack zurueck (klassisches Undo-Verhalten).
  private pushHistory(): void {
    this._history.push(this.snapshot())
    if (this._history.length > HISTORY_LIMIT) this._history.shift()
    this._future = []
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

  // --- Blocks ---

  addBlock(type: string): BlockData {
    this.pushHistory()
    const data = createBlockData(type)
    const STEP = 24
    const slot = this._blocks.length % 12
    data.layout = { ...data.layout, x: slot * STEP, y: slot * STEP }
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
    // Auswahl ist nicht-mutierend fuer History.
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
    this.pushHistory()
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
        x: original.layout.x + 24,
        y: original.layout.y + 24,
      },
    }
    this._blocks = [...this._blocks, copy]
    this._selectedId = copy.id
    this.notify(this)
    return copy
  }

  copyBlock(id: string): void {
    const original = this._blocks.find((b) => b.id === id)
    if (!original) return
    this._clipboard = deepClone(original)
    this.notify(this)
  }

  pasteBlock(): BlockData | null {
    if (!this._clipboard) return null
    this.pushHistory()
    const copy: BlockData = {
      ...deepClone(this._clipboard),
      id: crypto.randomUUID(),
      layout: {
        ...this._clipboard.layout,
        x: this._clipboard.layout.x + 24,
        y: this._clipboard.layout.y + 24,
      },
    }
    this._blocks = [...this._blocks, copy]
    this._selectedId = copy.id
    this.notify(this)
    return copy
  }

  // Block in Z-Order ans Ende verschieben (zeichnerisch "nach vorne").
  bringToFront(id: string): void {
    const idx = this._blocks.findIndex((b) => b.id === id)
    if (idx < 0 || idx === this._blocks.length - 1) return
    this.pushHistory()
    const next = [...this._blocks]
    const [block] = next.splice(idx, 1)
    next.push(block)
    this._blocks = next
    this.notify(this)
  }

  sendToBack(id: string): void {
    const idx = this._blocks.findIndex((b) => b.id === id)
    if (idx <= 0) return
    this.pushHistory()
    const next = [...this._blocks]
    const [block] = next.splice(idx, 1)
    next.unshift(block)
    this._blocks = next
    this.notify(this)
  }

  clear(): void {
    this.pushHistory()
    this._blocks = []
    this._selectedId = null
    this.notify(this)
  }

  // --- Persistence ---

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
