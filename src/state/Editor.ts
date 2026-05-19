// Editor
// Zentrale Klasse fuer Editor-Zustand. Erbt von Subject (Observer-Pattern).
// Komponenten abonnieren via editor.subscribe(fn).
// Bei jeder Aenderung ruft Editor notify(this) auf -> alle Observer reagieren.

import type { BasicBlock } from '../core/blocks/BasicBlock'
import { createBlock } from '../core/blocks/blockFactory'
import { Subject } from './Subject'

export class Editor extends Subject<Editor> {
  private _blocks: BasicBlock[] = []
  private _selectedId: string | null = null
  private _version: number = 0

  get blocks(): readonly BasicBlock[] {
    return this._blocks
  }

  get selectedId(): string | null {
    return this._selectedId
  }

  get selectedBlock(): BasicBlock | null {
    if (this._selectedId === null) return null
    return this._blocks.find((b) => b.id === this._selectedId) ?? null
  }

  // Versions-Zaehler: useSyncExternalStore vergleicht primitive Werte mit Object.is.
  // Bei jeder Aenderung erhoeht. React rendert nur wenn version sich aendert.
  get version(): number {
    return this._version
  }

  override notify(data: Editor): void {
    this._version++
    super.notify(data)
  }

  addBlock(type: string): BasicBlock {
    const block = createBlock(type)
    this._blocks.push(block)
    this.notify(this)
    return block
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
    const block = this._blocks.find((b) => b.id === id)
    if (!block) return
    Reflect.set(block, attr, value)
    this.notify(this)
  }
}

// Singleton-Instanz fuer die ganze App.
export const editor = new Editor()
