// Editor
// Zentraler Store für den Editor.
// Speichert nur einen serialisierbaren BlockNode-Baum (flache Map + Wurzel) und
// benachrichtigt React per Subject. Position = Verschachtelung + Reihenfolge
// (Flow), keine Koordinaten.

import {
  ROOT_ID,
  ROOT_TYPE,
  type BlockNode,
  type BlockTree,
} from '../core/blocks/BlockData'
import { createBlockNode } from '../core/blocks/blockFactory'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { Subject } from './Subject'
import { deepClone } from '../lib/deepClone'

const STORAGE_KEY = 'aufbau_editor_mvp_v1'
const HISTORY_LIMIT = 50
const SAVE_DEBOUNCE_MS = 500

interface PersistedState {
  tree: BlockTree
  selectedId: string | null
}

interface EditorSnapshot {
  tree: BlockTree
  selectedId: string | null
}

function createRootNode(): BlockNode {
  return { id: ROOT_ID, type: ROOT_TYPE, props: {}, parentId: null, childIds: [] }
}

function createEmptyTree(): BlockTree {
  return { [ROOT_ID]: createRootNode() }
}

function normalizeProps(type: string, rawProps: Record<string, unknown>): Record<string, unknown> {
  const def = getBlockDefinition(type)
  if (!def) return {}
  const next = deepClone(def.defaultProps)
  // Übernommen wird jede Prop, die der Block als defaultProp kennt — nicht nur
  // Inspector-Felder (customProperties). Blöcke ohne Inspector-Felder (Button,
  // Text: Inline-Edit per Doppelklick) würden sonst beim Laden jede Änderung
  // verlieren. Unbekannte Keys werden weiterhin verworfen.
  for (const key of Object.keys(next)) {
    if (Object.prototype.hasOwnProperty.call(rawProps, key)) {
      next[key] = rawProps[key]
    }
  }
  return next
}

// Baut aus rohen (evtl. kaputten) Daten einen sauberen Baum: läuft von der
// Wurzel über childIds, übernimmt nur Knoten mit bekanntem Typ, normalisiert
// Props, repariert parentId und verwirft Waisen/Zyklen.
function sanitizeTree(raw: Record<string, unknown>): BlockTree {
  const tree = createEmptyTree()
  const src = raw as Record<string, { type?: unknown; props?: unknown; childIds?: unknown }>

  const addChild = (parentId: string, childId: unknown): void => {
    if (typeof childId !== 'string' || tree[childId]) return
    const node = src[childId]
    if (!node || typeof node !== 'object') return
    if (typeof node.type !== 'string' || !getBlockDefinition(node.type)) return
    tree[childId] = {
      id: childId,
      type: node.type,
      props: normalizeProps(node.type, node.props && typeof node.props === 'object' ? node.props as Record<string, unknown> : {}),
      parentId,
      childIds: [],
    }
    tree[parentId].childIds.push(childId)
    const grand = Array.isArray(node.childIds) ? node.childIds : []
    for (const g of grand) addChild(childId, g)
  }

  const rootSrc = src[ROOT_ID]
  const rootChildren = rootSrc && Array.isArray(rootSrc.childIds) ? rootSrc.childIds : []
  for (const cid of rootChildren) addChild(ROOT_ID, cid)
  return tree
}

// Altes Format (Liste mit absolutem layout) -> Baum: alle Blöcke als Kinder der
// Wurzel, layout wird verworfen.
function migrateFlatBlocks(blocks: unknown[]): BlockTree {
  const tree = createEmptyTree()
  for (const raw of blocks) {
    if (!raw || typeof raw !== 'object') continue
    const b = raw as { id?: unknown; type?: unknown; props?: unknown }
    if (typeof b.id !== 'string' || typeof b.type !== 'string') continue
    if (!getBlockDefinition(b.type)) continue
    tree[b.id] = {
      id: b.id,
      type: b.type,
      props: normalizeProps(b.type, b.props && typeof b.props === 'object' ? b.props as Record<string, unknown> : {}),
      parentId: ROOT_ID,
      childIds: [],
    }
    tree[ROOT_ID].childIds.push(b.id)
  }
  return tree
}

function loadFromStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { tree?: unknown; blocks?: unknown; selectedId?: unknown }

    let tree: BlockTree | null = null
    if (parsed.tree && typeof parsed.tree === 'object') {
      tree = sanitizeTree(parsed.tree as Record<string, unknown>)
    } else if (Array.isArray(parsed.blocks)) {
      tree = migrateFlatBlocks(parsed.blocks)
    }
    if (!tree) return null

    const selectedId =
      typeof parsed.selectedId === 'string' && tree[parsed.selectedId] && parsed.selectedId !== ROOT_ID
        ? parsed.selectedId
        : null
    return { tree, selectedId }
  } catch {
    return null
  }
}

// Klont einen Teilbaum (Knoten + Nachfahren) mit frischen ids.
function cloneSubtree(
  tree: BlockTree,
  id: string,
): { nodes: BlockTree; rootId: string } {
  const nodes: BlockTree = {}
  const cloneRec = (srcId: string, parentId: string | null): string => {
    const src = tree[srcId]
    const newId = crypto.randomUUID()
    const childIds = src.childIds.map((c) => cloneRec(c, newId))
    nodes[newId] = { id: newId, type: src.type, props: deepClone(src.props), parentId, childIds }
    return newId
  }
  const rootId = cloneRec(id, tree[id].parentId)
  return { nodes, rootId }
}

export class Editor extends Subject<Editor> {
  private _tree: BlockTree = createEmptyTree()
  private _selectedId: string | null = null
  private _version = 0
  private _history: EditorSnapshot[] = []
  private _future: EditorSnapshot[] = []
  private _saveTimer: ReturnType<typeof setTimeout> | null = null
  private _hydrated = false
  // Tiefe einer laufenden Geste (z.B. Ziehen). > 0 = History-Snapshots werden
  // unterdrückt, damit eine durchgehende Geste EIN Undo-Schritt bleibt.
  private _txDepth = 0

  constructor() {
    super()
    const persisted = loadFromStorage()
    this._tree = persisted ? persisted.tree : createEmptyTree()
    this._selectedId = persisted?.selectedId ?? null
    this._hydrated = true
  }

  get tree(): Readonly<BlockTree> { return this._tree }
  get rootId(): string { return ROOT_ID }

  getNode(id: string): BlockNode | undefined { return this._tree[id] }

  childNodesOf(parentId: string): BlockNode[] {
    const parent = this._tree[parentId]
    if (!parent) return []
    return parent.childIds
      .map((id) => this._tree[id])
      .filter((n): n is BlockNode => Boolean(n))
  }

  // Anzahl echter Blöcke (ohne die Wurzel).
  get blockCount(): number { return Object.keys(this._tree).length - 1 }

  get selectedId(): string | null { return this._selectedId }
  get selectedNode(): BlockNode | null {
    if (this._selectedId === null) return null
    const node = this._tree[this._selectedId]
    return node && node.id !== ROOT_ID ? node : null
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
    return { tree: deepClone(this._tree), selectedId: this._selectedId }
  }

  private pushHistory(): void {
    this._history.push(this.snapshot())
    if (this._history.length > HISTORY_LIMIT) this._history.shift()
    this._future = []
  }

  // Klammert eine durchgehende Geste: genau EIN Snapshot am Anfang, alle
  // Änderungen dazwischen ohne weitere Snapshots, endTransaction schließt ab.
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
    this._tree = prev.tree
    this._selectedId = prev.selectedId
    this.notify(this)
  }

  redo(): void {
    const next = this._future.pop()
    if (!next) return
    this._history.push(this.snapshot())
    this._tree = next.tree
    this._selectedId = next.selectedId
    this.notify(this)
  }

  // Hängt einen neuen Block in den angegebenen Container (Default: Wurzel,
  // ans Ende). `index` = Einfüge-Position innerhalb der Kinder (für Drop).
  addBlock(type: string, parentId: string = ROOT_ID, index?: number): BlockNode {
    this.pushHistory()
    const node = createBlockNode(type)
    const parent = this._tree[parentId] ?? this._tree[ROOT_ID]
    node.parentId = parent.id
    const childIds = [...parent.childIds]
    const at = index === undefined
      ? childIds.length
      : Math.max(0, Math.min(index, childIds.length))
    childIds.splice(at, 0, node.id)
    this._tree = {
      ...this._tree,
      [node.id]: node,
      [parent.id]: { ...parent, childIds },
    }
    this._selectedId = node.id
    this.notify(this)
    return node
  }

  // true, wenn `id` im Teilbaum von `ancestorId` liegt (inkl. ancestorId
  // selbst). Für die UI: ein Container darf nie in sich selbst fallen.
  isInSubtree(ancestorId: string, id: string): boolean {
    let cur: string | null | undefined = id
    while (cur) {
      if (cur === ancestorId) return true
      cur = this._tree[cur]?.parentId
    }
    return false
  }

  removeBlock(id: string): void {
    const node = this._tree[id]
    if (!node || id === ROOT_ID) return
    this.pushHistory()
    const remove = new Set(this.collectSubtree(id))
    const next: BlockTree = {}
    for (const [key, value] of Object.entries(this._tree)) {
      if (!remove.has(key)) next[key] = value
    }
    if (node.parentId && next[node.parentId]) {
      const parent = next[node.parentId]
      next[node.parentId] = { ...parent, childIds: parent.childIds.filter((c) => c !== id) }
    }
    this._tree = next
    if (this._selectedId && remove.has(this._selectedId)) this._selectedId = null
    this.notify(this)
  }

  private collectSubtree(id: string): string[] {
    const acc: string[] = []
    const rec = (nid: string): void => {
      const n = this._tree[nid]
      if (!n) return
      acc.push(nid)
      n.childIds.forEach(rec)
    }
    rec(id)
    return acc
  }

  selectBlock(id: string | null): void {
    if (this._selectedId === id) return
    this._selectedId = id
    this.notify(this)
  }

  updateProperty(id: string, attr: string, value: unknown): void {
    const node = this._tree[id]
    if (!node) return
    this.pushHistory()
    this._tree = {
      ...this._tree,
      [id]: { ...node, props: { ...node.props, [attr]: value } },
    }
    this.notify(this)
  }

  duplicateBlock(id: string): BlockNode | null {
    const original = this._tree[id]
    if (!original || id === ROOT_ID || !original.parentId) return null
    const parent = this._tree[original.parentId]
    if (!parent) return null
    this.pushHistory()
    const { nodes, rootId: copyId } = cloneSubtree(this._tree, id)
    const childIds = [...parent.childIds]
    childIds.splice(parent.childIds.indexOf(id) + 1, 0, copyId)
    this._tree = {
      ...this._tree,
      ...nodes,
      [parent.id]: { ...parent, childIds },
    }
    this._selectedId = copyId
    this.notify(this)
    return nodes[copyId]
  }

  // Verschiebt einen Knoten in einen Container an eine Einfüge-Position.
  // index bezieht sich auf die Kinderliste des Zielcontainers (inkl. des
  // gezogenen Knotens, falls gleicher Container) — die Korrektur passiert hier.
  moveNode(id: string, newParentId: string, index: number): void {
    const node = this._tree[id]
    const newParent = this._tree[newParentId]
    if (!node || !newParent || id === ROOT_ID) return
    // Niemals in den eigenen Teilbaum einhängen (Zyklus).
    if (this.collectSubtree(id).includes(newParentId)) return
    const oldParentId = node.parentId
    if (!oldParentId) return
    const oldParent = this._tree[oldParentId]

    this.pushHistory()
    const next: BlockTree = { ...this._tree }

    if (oldParentId === newParentId) {
      const arr = oldParent.childIds.filter((c) => c !== id)
      const oldIndex = oldParent.childIds.indexOf(id)
      let target = oldIndex < index ? index - 1 : index
      target = Math.max(0, Math.min(target, arr.length))
      arr.splice(target, 0, id)
      next[oldParentId] = { ...oldParent, childIds: arr }
    } else {
      next[oldParentId] = { ...oldParent, childIds: oldParent.childIds.filter((c) => c !== id) }
      const arr = [...newParent.childIds]
      const target = Math.max(0, Math.min(index, arr.length))
      arr.splice(target, 0, id)
      next[newParentId] = { ...newParent, childIds: arr }
      next[id] = { ...node, parentId: newParentId }
    }
    this._tree = next
    this.notify(this)
  }

  clear(): void {
    if (this.blockCount === 0) return
    this.pushHistory()
    this._tree = createEmptyTree()
    this._selectedId = null
    this.notify(this)
  }

  private scheduleSave(): void {
    if (this._saveTimer) clearTimeout(this._saveTimer)
    this._saveTimer = setTimeout(() => {
      try {
        const state: PersistedState = { tree: this._tree, selectedId: this._selectedId }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (err) {
        console.warn('Editor: localStorage-Speichern fehlgeschlagen', err)
      }
    }, SAVE_DEBOUNCE_MS)
  }
}

export const editor = new Editor()
