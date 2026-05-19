// Editor
// Singleton-Klasse mit Editor-State. Speichert ausschliesslich serialisierbare BlockData.
// Erbt von Subject (Observer-Pattern). React-Bruecke via useSyncExternalStore (siehe useEditor.ts).

import type { BlockData } from '../core/blocks/BlockData'
import { createBlockData } from '../core/blocks/blockFactory'
import { Subject } from './Subject'

export class Editor extends Subject<Editor> {
  private _blocks: BlockData[] = []
  private _selectedId: string | null = null
  private _version: number = 0

  get blocks(): readonly BlockData[] {
    return this._blocks
  }

  get selectedId(): string | null {
    return this._selectedId
  }

  get selectedBlock(): BlockData | null {
    if (this._selectedId === null) return null
    return this._blocks.find((b) => b.id === this._selectedId) ?? null
  }

  // Versions-Zaehler: useSyncExternalStore vergleicht primitive Snapshots mit Object.is.
  get version(): number {
    return this._version
  }

  override notify(data: Editor): void {
    this._version++
    super.notify(data)
  }

  addBlock(type: string): BlockData {
    const data = createBlockData(type)
    this._blocks = [...this._blocks, data]
    this.notify(this)
    return data
  }

  removeBlock(id: string): void {
    this._blocks = this._blocks.filter((b) => b.id !== id)
    if (this._selectedId === id) this._selectedId = null
    this.notify(this)
  }

  selectBlock(id: string | null): void {
    this._selectedId = id
    this.notify(this)
  }

  updateProperty(id: string, attr: string, value: unknown): void {
    // Immutables Update: neue BlockData mit neuem props-Objekt.
    // Notwendig damit React den BlockData-Wechsel in BlockHost erkennt (Object.is-Vergleich).
    this._blocks = this._blocks.map((b) =>
      b.id === id ? { ...b, props: { ...b.props, [attr]: value } } : b,
    )
    this.notify(this)
  }
}

export const editor = new Editor()
